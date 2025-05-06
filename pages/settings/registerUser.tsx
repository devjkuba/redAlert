// components/RegisterUser.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import useAuthToken from "@/hooks/useAuthToken";
import useDemo from "@/hooks/useDemo";

export default function RegisterUser() {
  const router = useRouter();
  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });

    if (res.ok) {
      toast.success("Uživatel byl úspěšně zaregistrován.");
      router.push("/settings/users"); // Přesměrování na seznam uživatelů
    } else {
      toast.error("Chyba při registraci uživatele.");
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
                placeholder="Email"
                type="email"
                required
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Heslo"
                type="password"
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
              <Button type="submit">Registrovat</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
