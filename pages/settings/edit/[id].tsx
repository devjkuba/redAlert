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

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API}api/users/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFirstName(data.firstName);
          setLastName(data.lastName);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${process.env.NEXT_PUBLIC_API}api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, password }),
    });
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
        <div className="w-full max-w-4xl px-4 pb-7">
          <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Editace uživatele</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jméno"
              />
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Příjmení"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nové heslo (nepovinné)"
                type="password"
              />
              <Button type="submit">Uložit</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
