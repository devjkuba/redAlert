import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import useAuthToken from "@/hooks/useAuthToken";
import useDemo from "@/hooks/useDemo";
import useUser from "@/hooks/useUser";
import router from "next/router";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const registerUserSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "Jméno musí mít alespoň 2 znaky" })
      .max(50, { message: "Jméno nemůže být delší než 50 znaků" }),
    lastName: z
      .string()
      .min(2, { message: "Příjmení musí mít alespoň 2 znaky" })
      .max(50, { message: "Příjmení nemůže být delší než 50 znaků" }),
    email: z.string().email({ message: "Neplatná emailová adresa" }),
    password: z
      .string()
      .min(6, { message: "Heslo musí mít alespoň 6 znaků" })
      .max(20, { message: "Heslo nemůže být delší než 20 znaků" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Potvrzení hesla musí mít alespoň 6 znaků" }),
    role: z.string().min(1, { message: "Role je povinná" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  });

interface RegisterUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function RegisterUser() {
  const { data: user } = useUser();
  const organizationId = user?.organizationId;

  const token = useAuthToken();
  const { isDemoActive } = useDemo();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data: RegisterUserFormData): Promise<void> => {
    // Kontrola, zda je organizationId k dispozici
    if (!organizationId) {
      toast.error("Organizace není dostupná.");
      return;
    }

    const res: Response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/register-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role,
          organizationId,
        }),
      }
    );

    if (res.ok) {
      toast.success("Uživatel byl úspěšně zaregistrován.");

      router.push("/settings/users");
    } else {
      toast.error("Chyba při registraci uživatele.");
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
              <BreadcrumbLink>Registrace uživatele</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Toaster position="bottom-center" />
        <div className="w-full max-w-4xl px-4 pb-7">
          <div className="max-w-md mx-auto mt-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                {...register("firstName")}
                placeholder="Jméno"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <span className="text-red-500">{errors.firstName.message}</span>
              )}

              <Input
                {...register("lastName")}
                placeholder="Příjmení"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <span className="text-red-500">{errors.lastName.message}</span>
              )}

              <Input
                {...register("email")}
                placeholder="Email"
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
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
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role je povinná" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={`w-full ${
                        errors.role ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Vyberte roli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="USER">USER</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <span className="text-red-500">{errors.role.message}</span>
              )}
              <Button type="submit">Registrovat</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
