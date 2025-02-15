"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const countries = [
  { value: "Czech Republic", label: "Česká republika" },
  { value: "Slovakia", label: "Slovensko" },
];

interface CountrySelectProps {
  value: string | undefined; // Make value optional
  onChange: (value: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const selectedCountry = countries.find((c) => c.value === value); // Store found country

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedCountry ? selectedCountry.label : "Vyberte zemi"} {/* Use selectedCountry */}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Hledat zemi..." />
          <CommandEmpty>Nenalezeno</CommandEmpty>
          <CommandGroup>
            {countries.map((c) => (
              <CommandItem
                key={c.value}
                value={c.value}
                onSelect={() => onChange(c.value)}
              >
                {c.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === c.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}