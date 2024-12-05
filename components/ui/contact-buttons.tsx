"use client";

import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function ContactButtons() {
  const officeNumber = "02 8511 5715";
  const mobileNumber = "0955 689 7394";

  return (
    <div className="flex gap-2 ">
      <Button
        variant="outline"
        asChild
        className="flex items-center gap-2 text-gray-700 text-xs"
      >
        <a href={`tel:${officeNumber.replace(/\s/g, '')}`}>
          <Phone className="h-3 w-3" />
          <span>{officeNumber}</span>
        </a>
      </Button>

      <Button
        variant="outline"
        asChild
        className="flex items-center gap-2 text-gray-700 text-xs"
      >
        <a href={`tel:${mobileNumber.replace(/\s/g, '')}`}>
          <Phone className="h-3 w-3" />
          <span>{mobileNumber}</span>
        </a>
      </Button>
    </div>
  );
}