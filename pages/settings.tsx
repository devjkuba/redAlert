import Navbar from "@/components/Navbar";
import useUser from "@/hooks/useUser";
import { Button } from "@/components/ui/button"; // Pokud používáš komponenty jako shadcn/ui
import useDemo from "@/hooks/useDemo";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";
  const { isDemoActive, toggleDemo } = useDemo();

  return (
    <div className="flex min-h-screen !pt-safe !px-safe pb-safe">
      <main className="relative overflow-hidden flex flex-col flex-grow items-center justify-start">
        {isDemoActive && (
          <div className="absolute bg-[#d62a70] text-white font-sm w-full text-center font-bold text-sm">
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
        <div className="w-full max-w-4xl px-4 space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo režim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p className="text-sm text-gray-700">
                Demo režim je <strong>{isDemoActive ? "aktivní" : "neaktivní"}</strong>
              </p>
              <Button
                onClick={toggleDemo}
                className={isDemoActive ? "bg-[#d62a70] hover:bg-red-600" : ""}
              >
                {isDemoActive ? "Deaktivovat demo" : "Aktivovat demo"}
              </Button>
            </CardContent>
          </Card>

          {/* Sekce: Admin notifikace */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Administrace</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/settings/notifications">
                  <Button>Notifikace</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
