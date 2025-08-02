import useUser from "@/hooks/useUser";
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
import { useDevices } from "@/hooks/useDevices";

export default function AdminDevices() {
  const { data: user } = useUser();
  const { devices, loading, error } = useDevices(Number(user?.organizationId));
  const { isDemoActive } = useDemo();

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full">
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
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Zařízení</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 pb-7 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner size="lg" className="mt-[20px] bg-black" />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && devices && devices.length === 0 ? (
            <p className="text-center text-gray-500">
              Žádná zařízení k zobrazení.
            </p>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableCell className="p-1">Telefonní číslo</TableCell>
                  <TableCell className="p-1">Název</TableCell>
                  <TableCell className="p-1">Registrace</TableCell>
                  <TableCell className="p-1">Akce</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="text-xs p-1">{device.phoneNumber}</TableCell>
                    <TableCell className="text-xs p-1">{device.name}</TableCell>
                    <TableCell className="text-xs p-1">
                      {new Date(device.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs p-1">
                      <Link href={`/settings/edit-device/${device.id}`}>
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
