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
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const { isDemoActive, toggleDemo } = useDemo();

  useEffect(() => {
    if (user) {
      setEmailEnabled(user.emailNotificationsEnabled);
    }
  }, [user]);

  console.log(emailEnabled);

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/email-notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, enabled: checked }),
      });
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
          <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-2" />
        </div>
        <Navbar />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 space-y-6 py-4 overflow-auto overscroll-none max-h-[calc(100vh_-_145px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
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
                <strong>{user?.email}</strong>
                <br />  
                Role: <strong>{user?.role}</strong>
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Emailové notifikace</span>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={handleToggle}
                  disabled={saving}
                />
              </div>
              <p className="text-xs"><strong>{user?.organization.name}</strong><br />
              {user?.organization.street}<br />
              <span>{user?.organization.city}</span><br />
              {user?.organization.postalCode}<br />
              <span>{user?.organization.country}</span></p>
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

          {/* Sekce: Admin notifikace */}
          {isAdmin ? (
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
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-center items-center">
              <Spinner size="lg" className="mt-[20px] bg-black" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
