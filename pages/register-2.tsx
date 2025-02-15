// register-2.tsx
"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminForm } from "@/components/AdminForm";

export default function Register2() {
  const [organizationData, setOrganizationData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const storedOrganizationData = sessionStorage.getItem("organizationData");
    if (storedOrganizationData) {
      setOrganizationData(JSON.parse(storedOrganizationData));
    }
  }, []);

  const handleAdminSubmit = (data: Record<string, unknown>) => {
    console.log("Admin Data:", data);
    const combinedData = {
      ...organizationData,
      ...data,
    };
    console.log("Combined Data:", combinedData);
    toast.success("Registrace úspěšná!");
    // sessionStorage.removeItem("organizationData");
    // router.push("/success"); // Přejít na stránku úspěchu nebo jinou dle potřeby
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-sm">
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
