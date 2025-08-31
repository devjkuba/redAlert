import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import useAuthToken from "@/hooks/useAuthToken";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Organization {
  id: number;
  name: string;
  country: string;
  gpsLat: number;
  gpsLng: number;
  postalCode: string;
  street: string;
  city: string;
  activeUntil: Date;
  subscriptionPaid: boolean;
  subscriptionValidUntil: Date | null;
  hasMonitoring: boolean;
}

export default function EditOrganization() {
  const router = useRouter();
  const { id } = router.query;
  const token = useAuthToken();
  const [org, setOrg] = useState<Organization | null>(null);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    async function fetchData() {
      try {
        const resAccess = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/monitoring-access/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const accessData = await resAccess.json();

        const resAllOrgs = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/adminOrganizations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const allOrgsData = await resAllOrgs.json();

        setOrg(
          allOrgsData?.find((o: Organization) => o.id === Number(id)) || null
        );
        setAllOrgs(allOrgsData);
        setSelectedTargets(
          accessData.map((a: { targetOrg: { id: number } }) => a.targetOrg?.id)
        );
      } catch {
        setError("Nepodařilo se načíst data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, token]);

  const toggleTarget = (targetId: number) => {
    setSelectedTargets((prev) =>
      prev.includes(targetId)
        ? prev.filter((x) => x !== targetId)
        : [...prev, targetId]
    );
  };

  const saveMonitoring = async () => {
    if (!id || !token) return;
    try {
      // načíst stávající
      const resAccess = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/monitoring-access/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const existingAccess = await resAccess.json();

      interface MonitoringAccess {
        id: number;
        targetOrg: { id: number };
      }

      // smazat existující
      await Promise.all(
        (existingAccess as MonitoringAccess[]).map((a) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API}/api/monitoring-access/${a.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        )
      );

      // uložit nové
      if (selectedTargets.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_API}/api/monitoring-access`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            selectedTargets.map((targetId) => ({
              watcherOrgId: Number(id),
              targetOrgId: targetId,
            }))
          ),
        });
      }

      alert("Monitoring úspěšně uložen.");
    } catch {
      alert("Chyba při ukládání monitoringu.");
    }
  };

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full">
      <main className="relative overflow-hidden flex flex-col flex-grow items-center justify-start">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings/organization">
                Organizace & Monitoring
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 pb-7 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner size="lg" className="mt-[20px] bg-black" />
            </div>
          )}
          {!loading && !error && org && (
            <>
              <h2 className="text-xl font-bold mb-4">Editace: {org.name}</h2>
              <h3 className="text-lg font-semibold mb-2">Monitoring</h3>

              <Table className="table-fixed mb-4">
                <TableHeader>
                  <TableRow>
                    <TableCell className="p-1">Organizace</TableCell>
                    <TableCell className="p-1 w-24 text-center">
                      Monitorovat
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrgs.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-sm p-1">{o.name}</TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedTargets.includes(o.id)}
                          onChange={() => toggleTarget(o.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={saveMonitoring}>Uložit monitoring</Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
