"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { toast, Toaster } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneInput } from "@/components/ui/phone-input";

const formSchema = z
  .object({
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(6, { message: "Heslo musí mít alespoň 6 znaků" })
      .regex(/[a-zA-Z0-9]/, { message: "Heslo musí být alfanumerické" }),
    botField: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phoneNumber) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "Zadejte e-mail nebo telefon",
      });
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "Neplatná e-mailová adresa",
      });
    }
    if (data.phoneNumber && !/^\+?\d{6,15}$/.test(data.phoneNumber)) {
      ctx.addIssue({
        path: ["phoneNumber"],
        code: z.ZodIssueCode.custom,
        message: "Neplatné telefonní číslo",
      });
    }
  });

export default function LoginPreview() {
  const { t } = useTranslation();
  const [botField, setBotField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      password: "",
      botField: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (botField) {
      console.warn("Detekován bot! Přihlášení zablokováno.");
      return;
    }

    const body =
      loginMethod === "email"
        ? { email: values.email, password: values.password }
        : { phoneNumber: values.phoneNumber, password: values.password };

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Přihlášení úspěšné!");
        localStorage.setItem("token", data.token);
        router.push("/alert");
      } else if (res.status === 401) {
        toast.error("Neplatné přihlašovací údaje. Zkuste to znovu.");
      } else {
        toast.error(data.message || "Přihlášení se nezdařilo.");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Chyba při odesílání formuláře. Zkuste to znovu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe">
      <div className="border-0 mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src="../logo.png" alt="Logo" className="w-48 h-auto mb-2" />
          </div>
          <CardTitle className="text-2xl">Přihlášení</CardTitle>
          <CardDescription>
            Přihlaste se pomocí e-mailu nebo telefonního čísla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={loginMethod}
            onValueChange={(val) => setLoginMethod(val as "email" | "phone")}
            className="mb-2"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Telefon</TabsTrigger>
            </TabsList>
          </Tabs>
          {isLoading ? (
            <div className="flex justify-center items-center mt-8">
              <Spinner size="lg" className="bg-black" />
            </div>
          ) : (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid gap-4">
                    {loginMethod === "email" && (
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="jmeno@domena.cz"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {loginMethod === "phone" && (
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <PhoneInput type="tel" {...field} defaultCountry="CZ" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="grid gap-1">
                          <div className="flex justify-between items-center">
                            <FormLabel htmlFor="password">Heslo</FormLabel>
                            {/* <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Zapomněli jste heslo?
                        </Link> */}
                          </div>
                          <FormControl>
                            <PasswordInput
                              id="password"
                              placeholder="******"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input
                      type="text"
                      name="botField"
                      value={botField}
                      onChange={(e) => setBotField(e.target.value)}
                      style={{ display: "none" }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <Button type="submit">{t("login")}</Button>
                  </div>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                {t("register_prompt")}
                <br />
                <Link href="/register" className="underline">
                  Zaregistrujte vaši organizaci
                </Link>
              </div>
              {/* <div className="mt-8 flex items-center gap-2 text-sm">
            <span>{t("language_label")}</span>
            <LanguageDropdown />
          </div> */}
            </>
          )}
        </CardContent>
        <Toaster position="bottom-center" />
      </div>
    </div>
  );
}
