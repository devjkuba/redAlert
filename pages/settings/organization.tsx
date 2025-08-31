import Navbar from "@/components/Navbar";
import useDemo from "@/hooks/useDemo";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useOrganizations } from "@/hooks/useOrganizations";

export default function AdminOrganizations() {
  const { organizations, loading, error } = useOrganizations();
  const { isDemoActive } = useDemo();

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-6xl w-full">
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
        <Breadcrumb className="w-full max-w-6xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Organizace & Monitoring</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-6xl px-4 pb-7 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner size="lg" className="mt-[20px] bg-black" />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && organizations && organizations.length === 0 ? (
            <p className="text-center text-gray-500">
              Žádné organizace k zobrazení.
            </p>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableCell className="p-1">Název</TableCell>
                  <TableCell className="p-1">Město</TableCell>
                  <TableCell className="p-1">Stát</TableCell>
                  <TableCell className="p-1">Monitoring</TableCell>
                  <TableCell className="p-1 text-right">Akce</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="text-xs p-1">{org.name}</TableCell>
                    <TableCell className="text-xs p-1">{org.city}</TableCell>
                    <TableCell className="text-xs p-1">{org.country}</TableCell>
                    <TableCell className="text-xs p-1">
                      {org.hasMonitoring
                        ? `Ano ${
                            org.monitoringCount || 0
                          } organizace`
                        : "Ne"}
                    </TableCell>
                    <TableCell className="text-xs p-1">
                      <Link href={`/settings/edit-organization/${org.id}`}>
                        <Button variant="outline" size="sm">
                          Editovat
                        </Button>
                      </Link>
                    </TableCell>
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
