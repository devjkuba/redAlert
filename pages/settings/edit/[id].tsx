import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthToken from "@/hooks/useAuthToken";
import Navbar from "@/components/Navbar";
import useDemo from "@/hooks/useDemo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function EditUser() {
  const router = useRouter();
  const rawId = router.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API}api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.email);
          setRole(["ADMIN", "USER"].includes(data.role) ? data.role : "");
        });
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        password.trim()
          ? { firstName, lastName, email, role, password }
          : { firstName, lastName, email, role }
      ),
    });

    if (res.ok) {
      toast.success("Uživatel byl úspěšně uložen.");
    } else {
      toast.error("Chyba při ukládání uživatele.");
    }
  };

  const handleDelete = async () => {
    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId) return;

    if (!confirm("Opravdu chcete tohoto uživatele smazat?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Uživatel byl úspěšně smazán.");
        router.push("/settings/users");
      } else {
        toast.error(data.message || "Chyba při mazání uživatele.");
      }
    } catch (error) {
      console.error("Error during user deletion:", error);
      toast.error("Nastala chyba při mazání.");
    }
  };

  return (
    <div className="flex min-h-screen !pt-safe !px-safe pb-safe border-0 mx-auto max-w-4xl w-full">
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
        <Toaster position="bottom-center" />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings/users">Uživatelé</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/settings/edit/${id}`}>
                Editace uživatele
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 pb-7">
          <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jméno"
                required
              />
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Příjmení"
                required
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                type="email"
                required
              />
              <Select
                value={role}
                onValueChange={(value) => setRole(value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Vyberte roli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nové heslo (nepovinné)"
                type="password"
              />
              <Button type="submit">Uložit</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Smazat uživatele
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
