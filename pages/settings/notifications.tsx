import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { getNotifications } from "@/lib/getNotifications";
import Navbar from "@/components/Navbar";
import useDemo from "@/hooks/useDemo";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function AdminNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]); // Ukládáme notifikace
  const [loading, setLoading] = useState<boolean>(false); // Stav pro načítání
  const [error, setError] = useState<string | null>(null); // Stav pro chyby
  const { isDemoActive } = useDemo();

  // Získání notifikací pro administrátora
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.role !== "ADMIN") return; // Pokud uživatel není admin, nic nezobrazujeme

      setLoading(true);
      try {
        const data = await getNotifications(user.organizationId!); // Získej notifikace na základě organizace
        setNotifications(data);
      } catch (err) {
        setError("Došlo k chybě při načítání notifikací.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.organizationId, user?.role]);

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
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Notifikace</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4">
          {loading && <p>Načítání notifikací...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* Zobrazíme notifikace v tabulce */}
          {notifications.length === 0 && !loading && !error ? (
            <p className="text-center text-gray-500">Žádné notifikace k zobrazení.</p>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableCell className="p-1">Datum vytvoření</TableCell>
                  <TableCell className="p-1">Typ</TableCell>
                  <TableCell className="p-1">Zpráva</TableCell>
                  <TableCell className="p-1">Aktivováno uživatelem</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                     <TableCell className="text-xs p-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs p-1">{notification.type}</TableCell>
                    <TableCell className="text-xs p-1">{notification.message}</TableCell>
                    <TableCell className="text-xs p-1">{notification.triggeredBy.firstName} {notification.triggeredBy.lastName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
