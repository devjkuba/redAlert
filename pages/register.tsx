"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/OrganizationForm";

export default function Register1() {
  const [organizationData, setOrganizationData] = useState<Record<string, unknown>>({});
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem("organizationData");
    if (storedData) {
      setOrganizationData(JSON.parse(storedData));
    }
  }, []);

  console.log(organizationData);

  const handleOrganizationSubmit = (data: Record<string, unknown>) => {
    sessionStorage.setItem("organizationData", JSON.stringify(data));
    setOrganizationData(data);
    router.push("/register-2"); 
  };

  return (
    <div className="flex min-h-screen p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="../logo.png" alt="Logo" className="h-20" />
          </div>
          <CardTitle className="text-2xl">Registrace organizace</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationForm defaultValues={organizationData} onSubmit={handleOrganizationSubmit} />
          <Toaster position="bottom-center" />
        </CardContent>
      </Card>
    </div>
  );
}
