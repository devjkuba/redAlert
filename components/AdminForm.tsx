"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useRouter } from "next/router";
import Link from "next/link";
import { PhoneInput } from "./ui/phone-input";

const adminSchema = z
  .object({
    firstName: z
      .string({
        required_error: "Jméno je povinné",
        invalid_type_error: "Jméno musí být text",
      })
      .min(2, { message: "Jméno musí mít alespoň 2 znaky" }),
    lastName: z
      .string({
        required_error: "Příjmení je povinné",
        invalid_type_error: "Příjmení musí být text",
      })
      .min(2, { message: "Příjmení musí mít alespoň 2 znaky" }),
    email: z.string().email({ message: "Neplatná emailová adresa" }),
    phone: z
      .string({
        required_error: "Telefonní číslo je povinné",
        invalid_type_error: "Telefon musí být text",
      })
      .min(10, { message: "Telefonní číslo musí mít alespoň 10 znaků" })
      .regex(/^\+?[1-9]\d{1,14}$/, { message: "Neplatné telefonní číslo" }),
    password: z
      .string({
        required_error: "Heslo je povinné",
        invalid_type_error: "Heslo musí být text",
      })
      .min(6, { message: "Heslo musí mít alespoň 6 znaků" })
      .max(20, { message: "Heslo nemůže mít více než 20 znaků" }),
    confirmPassword: z
      .string({
        required_error: "Potvrzení hesla je povinné",
        invalid_type_error: "Potvrzení hesla musí být text",
      })
      .min(6, { message: "Potvrzení hesla musí mít alespoň 6 znaků" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  });

interface AdminFormProps {
  onSubmit: (data: z.infer<typeof adminSchema>) => void;
}

export const AdminForm: React.FC<AdminFormProps> = ({ onSubmit }) => {
  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
  });

  const router = useRouter();

  return (
    <Form {...adminForm}>
      <form onSubmit={adminForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-2">
          <FormField
            control={adminForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jméno</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jan"
                    {...field}
                    autoComplete=""
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={adminForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Příjmení</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Novák"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={adminForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@firma.cz"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
                  control={adminForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel htmlFor="phone">Telefon</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} defaultCountry="CZ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          <FormField
            control={adminForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Heslo</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="******"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={adminForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">Potvrďte heslo</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="******"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/register")}
          >
            Zpět
          </Button>
          <Button type="submit">Registrovat</Button>
        </div>
        <div className="mt-4 text-center text-sm">
        Už máte účet?{" "}
        <Link href="/login" className="underline">
          Přihlašte se
        </Link>
      </div>
      </form>
    </Form>
  );
};
