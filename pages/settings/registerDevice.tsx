"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import useAuthToken from "@/hooks/useAuthToken";
import useDemo from "@/hooks/useDemo";
import useUser from "@/hooks/useUser";
import router from "next/router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PhoneInput } from "@/components/ui/phone-input";

const registerDeviceSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Název zařízení je povinný" })
      .max(50, { message: "Název zařízení je příliš dlouhý" }),
    phoneNumber: z.string().min(4, { message: "Telefonní číslo je povinné" }),
    password: z
      .string()
      .min(6, { message: "Heslo musí mít alespoň 6 znaků" })
      .max(20, { message: "Heslo nemůže být delší než 20 znaků" }),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  });

type RegisterDeviceFormData = z.infer<typeof registerDeviceSchema>;

export default function RegisterDevice() {
  const { data: user } = useUser();
  const organizationId = user?.organizationId;
  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterDeviceFormData>({
    resolver: zodResolver(registerDeviceSchema),
  });

  const phoneNumberValue = watch("phoneNumber") || "";

  const onSubmit = async (data: RegisterDeviceFormData) => {
    if (!organizationId) {
      toast.error("Organizace není dostupná.");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/register-device`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber,
          password: data.password,
          confirmPassword: data.confirmPassword,
          organizationId,
        }),
      }
    );

    if (res.ok) {
      toast.success("Zařízení bylo úspěšně zaregistrováno.");
      router.push("/settings/devices");
    } else {
      toast.error("Chyba při registraci zařízení.");
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
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Nastavení</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Registrace zařízení</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Toaster position="bottom-center" />
        <div className="max-w-md w-full mx-auto mt-4 px-4 pb-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("name")}
              placeholder="Název zařízení"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <span className="text-red-500">{errors.name.message}</span>
            )}
            <PhoneInput
              value={phoneNumberValue}
              onChange={(value) => setValue("phoneNumber", value)}
              placeholder="Telefonní číslo"
              className={errors.phoneNumber ? "border-red-500" : ""}
              defaultCountry="CZ"
            />

            {errors.phoneNumber && (
              <span className="text-red-500">{errors.phoneNumber.message}</span>
            )}

            <Input
              {...register("password")}
              placeholder="Heslo"
              type="password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}

            <Input
              {...register("confirmPassword")}
              placeholder="Potvrďte heslo"
              type="password"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <span className="text-red-500">
                {errors.confirmPassword.message}
              </span>
            )}

            <Button type="submit">Registrovat zařízení</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
