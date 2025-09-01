import Navbar from "@/components/Navbar";
import useUser from "@/hooks/useUser";
import { Button } from "@/components/ui/button"; // Pokud používáš komponenty jako shadcn/ui
import useDemo from "@/hooks/useDemo";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import useAuthToken from "@/hooks/useAuthToken";
import PaymentQRCode from "@/components/PaymentQRCode";
import { startOfDay } from "@/lib/utils";

export default function Settings() {
  const { data: user } = useUser();
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = !user?.isDevice && user?.role === "SUPERADMIN";
  const isAdmin = !user?.isDevice && user?.role === "ADMIN";
  const { isDemoActive, toggleDemo } = useDemo();

  useEffect(() => {
    if (user && !user?.isDevice) {
      setEmailEnabled(user.emailNotificationsEnabled);
    }
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/user/email-notifications`,
        {
          method: "PUT",
          body: JSON.stringify({ userId: user?.id, enabled: checked }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Chyba při ukládání");

      setEmailEnabled(checked);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (err) {
      console.error(err);
      alert("Nepodařilo se uložit změnu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe mx-auto max-w-4xl w-full">
      <main className="relative overflow-hidden flex flex-col flex-grow items-center justify-start">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 space-y-6 pb-4 overflow-auto overscroll-none max-h-[calc(100vh_-_145px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
          {/* <div className="flex items-center gap-2 text-sm">
              <span>{t("language_label")}</span>
              <LanguageDropdown />
            </div> */}
          <Card className="shadow-lg border border-gray-300 rounded-xl">
            <CardHeader>
              <CardTitle>Uživatelské nastavení</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p className="text-sm text-gray-700">
                Jste přihlášen jako{" "}
                <strong>{!user?.isDevice ? user?.email : user?.name}</strong>
                <br />
                {!user?.isDevice && (
                  <>
                    Role: <strong>{user?.role}</strong>
                  </>
                )}
              </p>

              {!user?.isDevice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Emailové notifikace
                  </span>
                  <Switch
                    checked={emailEnabled}
                    onCheckedChange={handleToggle}
                    disabled={saving}
                  />
                </div>
              )}
              <p className="text-xs">
                <strong>{user?.organization.name}</strong>
                <br />
                {user?.organization.street}
                <br />
                <span>{user?.organization.city}</span>
                <br />
                {user?.organization.postalCode}
                <br />
                <span>{user?.organization.country}</span>
              </p>
              {/* <p className="text-sm text-gray-700">
              {/* <Link href="/settings/profile">
                <Button>Upravit profil</Button>
              </Link>
              <Link href="/settings/changePassword">
                <Button className="mt-4">Změnit heslo</Button>  
              </Link> */}
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-gray-300 rounded-xl">
            <CardHeader>
              <CardTitle>Demo režim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p className="text-sm text-gray-700">
                Demo režim je{" "}
                <strong>{isDemoActive ? "aktivní" : "neaktivní"}</strong>
              </p>
              <Button
                onClick={toggleDemo}
                className={isDemoActive ? "bg-[#982121] hover:bg-red-600" : ""}
              >
                {isDemoActive ? "Deaktivovat demo" : "Aktivovat demo"}
              </Button>
            </CardContent>
          </Card>

          {isAdmin || isSuperAdmin ? (
            <Card className="shadow-lg border border-gray-300 rounded-xl">
              <CardHeader>
                <CardTitle>Administrace</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col">
                <Link href="/settings/notifications">
                  <Button>Notifikace</Button>
                </Link>
                <Link href="/settings/registerUser">
                  <Button className="mt-4">Registrace uživatele</Button>
                </Link>
                <Link href="/settings/users">
                  <Button className="mt-4">Správa uživatelů</Button>
                </Link>
                <Link href="/settings/registerDevice">
                  <Button className="mt-4">Registrace zařízení</Button>
                </Link>
                <Link href="/settings/devices">
                  <Button className="mt-4">Správa zařízení</Button>
                </Link>
                {isSuperAdmin && (
                  <Link href="/settings/organization">
                    <Button className="mt-4">Organizace & Monitoring</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : null}

          {isAdmin &&
            user?.organization &&
            (() => {
              const { subscriptionValidUntil } = user.organization;

              const today = startOfDay(new Date());
              const oneMonthFromNow = new Date(today);
              oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

              const subscriptionValidUntilDate = subscriptionValidUntil
                ? startOfDay(new Date(subscriptionValidUntil))
                : null;

              const hasSubscription = !!subscriptionValidUntilDate;
              const isSubscriptionActive =
                hasSubscription && subscriptionValidUntilDate > today;
              const endsInLessThanMonth =
                hasSubscription &&
                subscriptionValidUntilDate <= oneMonthFromNow &&
                subscriptionValidUntilDate > today;

              if (isSubscriptionActive && !endsInLessThanMonth) {
                // Aktivní předplatné (více než 1 měsíc)
                return (
                  <Card className="shadow-lg border border-gray-300 rounded-xl mt-6">
                    <CardHeader>
                      <CardTitle>Předplatné aplikace</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">
                        Předplatné je aktivní do{" "}
                        <strong>
                          {subscriptionValidUntilDate.toLocaleDateString(
                            "cs-CZ",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </strong>
                        .
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              if (endsInLessThanMonth) {
                return (
                  <Card className="shadow-lg border border-gray-300 rounded-xl mt-6">
                    <CardHeader>
                      <CardTitle>Předplatné aplikace</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        <strong>Upozornění:</strong> Vaše předplatné končí dne{" "}
                        <strong>
                          {subscriptionValidUntilDate.toLocaleDateString(
                            "cs-CZ",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </strong>
                        .<br />
                        Doporučujeme provést platbu co nejdříve, aby nedošlo k
                        přerušení přístupu.
                      </p>
                      <PaymentQRCode
                        organizationId={user.organization.id}
                        organizationName={user.organization.name}
                        priceCzk={1200}
                      />
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card className="shadow-lg border border-gray-300 rounded-xl mt-6">
                  <CardHeader>
                    <CardTitle>Předplatné aplikace</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-4">
                    <p className="text-sm text-gray-700">
                      <strong>1 měsíční zkušební doba zdarma.</strong>
                      {/* <br />
                      Po 1 měsíci je potřeba zaplatit roční předplatné.
                      <br />
                      Cena: <strong>100 Kč</strong> měsíčně,
                      <br />
                      platba je vždy na <strong>12 měsíců</strong> dopředu.
                      <br />
                      Roční cena: <strong>1200 Kč</strong>.
                      <br />
                      Faktura bude odeslána na Váš e-mail po zaplacení.
                      <br />
                      Pro zaplacení použijte přiložený QR kód. */}
                    </p>
                    <p className="text-sm text-gray-700">
                      Pokud nebude platba provedena do konce zkušební doby, bude
                      přístup k organizaci deaktivován.
                    </p>
                    {/* <PaymentQRCode
                      organizationId={user.organization.id}
                      organizationName={user.organization.name}
                      priceCzk={1200}
                    /> */}
                  </CardContent>
                </Card>
              );
            })()}
        </div>
      </main>
    </div>
  );
}
