"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminForm } from "@/components/AdminForm";
import Cookies from "js-cookie";

export default function Register2() {
  const [organizationData, setOrganizationData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedOrganizationData = sessionStorage.getItem("organizationData");
    if (storedOrganizationData) {
      setOrganizationData(JSON.parse(storedOrganizationData));
    }
  }, []);

  const handleAdminSubmit = async (data: Record<string, unknown>) => {
    if (!organizationData) {
      toast.error("Organizační údaje chybí. Prosím, vyplňte první krok.");
      return;
    }

    const combinedData = {
      ...data,
      organizationData,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(combinedData),
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        const { token } = result;
        Cookies.set("token", token, {
          expires: 365, // platnost 1 rok
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        toast.success("Registrace úspěšná!");
        sessionStorage.removeItem("organizationData");
        router.push("/alert"); // Přejde na stránku s úspěchem
      } else {
        const result = await response.json();
        toast.error(result.message || "Registrace selhala.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Nastala chyba při odesílání dat.");
    }
  };

  return (
    <div className="flex h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe">
      <div className="border-0 mx-auto max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="../logo.png" alt="Logo" className="w-48 h-auto mb-2" />
          </div>
          <CardTitle className="text-2xl">Registrace správce</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminForm onSubmit={handleAdminSubmit} />
          <Toaster position="bottom-center" />
        </CardContent>
      </div>
    </div>
  );
}
