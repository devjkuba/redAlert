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
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button"; // Předpokládám, že máte tlačítka v UI komponentách
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function AdminUsers() {
  const { data: user } = useUser();
  const { users, loading, error } = useUsers(Number(user?.organizationId));
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
              <BreadcrumbLink>Uživatelé</BreadcrumbLink>
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
          {!loading && !error && users && users.length === 0 ? (
            <p className="text-center text-gray-500">
              Žádní uživatelé k zobrazení.
            </p>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableCell className="p-1">Jméno</TableCell>
                  <TableCell className="p-1">Email</TableCell>
                  <TableCell className="p-1 w-12">Role</TableCell>
                  <TableCell className="p-1">Datum registrace</TableCell>
                  <TableCell className="p-1">Akce</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs p-1">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell
                      className="text-xs p-1 w-32 truncate hover:overflow-visible hover:whitespace-normal hover:bg-white hover:z-10"
                      title={user.email}
                    >
                      <span className="truncate" title={user.email}>
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs p-1 !w-10 truncate">
                      {user.role}
                    </TableCell>
                    <TableCell className="text-xs p-1">
                      {new Date(user.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs p-1">
                      <Link href={`/settings/edit/${user.id}`}>
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
