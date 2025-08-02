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
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PhoneInput } from "@/components/ui/phone-input";

export default function EditDevice() {
  const router = useRouter();
  const rawId = router.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API}/api/devices/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setName(data.name ?? "");
          setPhoneNumber(data.phoneNumber ?? "");
        })
        .catch(() => {
          toast.error("Nepodařilo se načíst zařízení.");
        });
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/devices/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          password.trim()
            ? { name, phoneNumber, password }
            : { name, phoneNumber }
        ),
      }
    );

    if (res.ok) {
      toast.success("Zařízení bylo úspěšně uloženo.");
    } else {
      toast.error("Chyba při ukládání zařízení.");
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm("Opravdu chcete toto zařízení smazat?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/devices/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Zařízení bylo úspěšně smazáno.");
        router.push("/settings/devices");
      } else {
        toast.error(data.message || "Chyba při mazání zařízení.");
      }
    } catch (error) {
      console.error("Chyba při mazání zařízení:", error);
      toast.error("Nastala chyba při mazání.");
    }
  };

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
        <Toaster position="bottom-center" />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings/devices">Zařízení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/settings/devices/edit/${id}`}>
                Editace zařízení
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full max-w-4xl px-4 pb-7">
          <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Název zařízení"
                required
              />
              <PhoneInput
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value)}
                placeholder="Telefonní číslo"
                defaultCountry="CZ"
                required
                type="tel"
              />
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
                Smazat zařízení
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
