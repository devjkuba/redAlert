"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminForm } from "@/components/AdminForm";

export default function Register2() {
  const [organizationData, setOrganizationData] = useState<Record<string, unknown> | null>(null);
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
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedData),
      });

      if (response.ok) {
        const result = await response.json();
        const { token } = result; 
        localStorage.setItem('token', token);

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
    <div className="flex min-h-screen p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="../logo.png" alt="Logo" className="h-20" />
          </div>
          <CardTitle className="text-2xl">Registrace správce</CardTitle>
        </CardHeader>
        <CardContent>
            <AdminForm onSubmit={handleAdminSubmit} />
          <Toaster position="bottom-center" />
        </CardContent>
      </Card>
    </div>
  );
}
