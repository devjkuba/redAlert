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
import Link from "next/link";

const organizationSchema = z.object({
  name: z
    .string({
      required_error: "Jméno organizace je povinné",
      invalid_type_error: "Jméno organizace musí být text",
    })
    .min(2, { message: "Název musí mít alespoň 2 znaky" }),
  street: z
    .string({
      required_error: "Ulice je povinná",
      invalid_type_error: "Ulice musí být text",
    })
    .min(2, { message: "Ulice je povinná" }),
  city: z
    .string({
      required_error: "Město je povinné",
      invalid_type_error: "Město musí být text",
    })
    .min(2, { message: "Město je povinné" }),
  postalCode: z
    .string({
      required_error: "PSČ je povinné",
      invalid_type_error: "PSČ musí být text",
    })
    .min(4, { message: "PSČ je povinné" }),
});

interface OrganizationFormProps {
  onSubmit: (data: z.infer<typeof organizationSchema>) => void;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onSubmit,
}) => {
  const organizationForm = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
  });

  return (
    <Form {...organizationForm}>
      <form
        onSubmit={organizationForm.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-2">
          <FormField
            control={organizationForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Název organizace</FormLabel>
                <FormControl>
                  <Input placeholder="Firma s.r.o." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ... other organization form fields ... */}
          <FormField
            control={organizationForm.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulice</FormLabel>
                <FormControl>
                  <Input placeholder="Příčná 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={organizationForm.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Město</FormLabel>
                <FormControl>
                  <Input placeholder="Praha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={organizationForm.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PSČ</FormLabel>
                <FormControl>
                  <Input placeholder="110 00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Další</Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Už máte účet?{" "}
        <Link href="/login" className="underline">
          Přihlašte se
        </Link>
      </div>
    </Form>
  );
};
