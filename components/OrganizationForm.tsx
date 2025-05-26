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
import LocationSelector from "@/components/ui/location-input";
import Link from "next/link";
import { useState, useEffect } from "react";
import getCoordinates from "@/lib/getCoordinates";

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
  postalCode: z
    .string({
      required_error: "PSČ je povinné",
      invalid_type_error: "PSČ musí být text",
    })
    .min(4, { message: "PSČ je povinné" }),
  location: z.tuple([
      z.string({
        required_error: 'Country is required',
      }),
      z.string().optional(),
    ]),
});

interface OrganizationFormProps {
  onSubmit: (data: z.infer<typeof organizationSchema>) => void;
}

export const OrganizationForm: React.FC<OrganizationFormProps & { defaultValues?: Partial<z.infer<typeof organizationSchema>> }> = ({
  onSubmit,
  defaultValues,
}) => {
  const [countryName, setCountryName] = useState<string>(defaultValues?.location?.[0] || "Czech Republic");
  const [stateName, setStateName] = useState<string>(defaultValues?.location?.[1] || '');

  const organizationForm = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  useEffect(() => {
    const storedValues = sessionStorage.getItem('organizationData');
    if (storedValues) {
      const parsedValues = JSON.parse(storedValues);
      organizationForm.reset(parsedValues);
      setCountryName(parsedValues.location?.[0] || "Czech Republic");
      setStateName(parsedValues.location?.[1] || '');
    }
  }, [organizationForm]);

  const handleSubmit = async (data: z.infer<typeof organizationSchema>) => {
    const city = stateName || countryName;
    const coordinates = await getCoordinates(data.street, city);

    const combinedData = {
      ...data,
      gps: coordinates,
    };

    sessionStorage.setItem("organizationData", JSON.stringify(combinedData));
    onSubmit(combinedData);
  };

  return (
    <Form {...organizationForm}>
      <form
        onSubmit={organizationForm.handleSubmit(handleSubmit)}
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Země</FormLabel>
                <FormControl>
                <LocationSelector
                onCountryChange={(country) => {
                  setCountryName(country?.name || '')
                  organizationForm.setValue(field.name, [
                    country?.name || '',
                    stateName || '',
                  ])
                }}
                onStateChange={(state) => {
                  setStateName(state?.name || '')
                  organizationForm.setValue(field.name, [
                    countryName || '',
                    state?.name || '',
                  ])
                }}
              />
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
