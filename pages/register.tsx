// register-1.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/OrganizationForm";

export default function Register1() {
  const [organizationData, setOrganizationData] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  const handleOrganizationSubmit = (data: Record<string, unknown>) => {
    console.log("Organization Data:", data);
    console.log(organizationData);
    sessionStorage.setItem("organizationData", JSON.stringify(data));
    setOrganizationData(data);
    router.push("/register-2"); // Přesměrování na druhou stránku
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="../logo.png" alt="Logo" className="h-20" />
          </div>
          <CardTitle className="text-2xl">Registrace organizace</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationForm onSubmit={handleOrganizationSubmit} />
          <Toaster position="bottom-center" />
        </CardContent>
      </Card>
    </div>
  );
}
