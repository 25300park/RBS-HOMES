"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import { toast } from "@/hooks/use-toast";
import { reservationSchema } from "@/types/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { requestSchedule } from "../action";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ContactButtons } from "@/components/ui/contact-buttons";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  date?: string;
}

interface ReservationFormProps {
  formData: FormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  errors: FormErrors;
  needsDiscussion: boolean;
  setNeedsDiscussion: (value: boolean) => void;
  date: Date | undefined;
  setDate: (date: any) => void;
  isSubmitting: boolean;
  session: any;
}

export interface StickyBoxProps {
  sellType: string;
  price: number | undefined;
  unitId: number;
}

const ReservationForm = React.memo(
  ({
    formData,
    handleChange,
    handleSubmit,
    errors,
    needsDiscussion,
    setNeedsDiscussion,
    date,
    setDate,
    isSubmitting,
    session,
  }: ReservationFormProps) => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 ">
            <Checkbox
              id="needsDiscussion"
              checked={needsDiscussion}
              onCheckedChange={(checked) =>
                setNeedsDiscussion(checked as boolean)
              }
            />
            <Label htmlFor="needsDiscussion">Needs Discussion</Label>
          </div>
            <ContactButtons />
        </div>

        {!needsDiscussion && (
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Preferred Date
            </label>
            <DatePicker
              selected={date}
              onChange={(date: Date | null) => setDate(date)}
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm border rounded-lg shadow"
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              showPopperArrow={false}
              wrapperClassName="w-full"
              customInput={
                <input className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
              }
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!!session?.user?.name}
            className="mt-1"
            required
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!session?.user?.email}
            className="mt-1"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={!!session?.user?.phone}
            className="mt-1"
            required
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="message"
            className="text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="mt-1 h-24 resize-none"
            required
          />
          {errors.message && (
            <p className="text-sm text-red-500 mt-1">{errors.message}</p>
          )}
        </div>
      </div>

      <DrawerFooter className="p-0 py-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full bg-orange-400 text-white py-3 rounded-lg transition-colors",
            isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-500"
          )}
        >
          {isSubmitting ? "Submitting..." : "Reserve"}
        </button>
      </DrawerFooter>
    </form>
  )
);

ReservationForm.displayName = "ReservationForm";

const StickyBox = ({
  price,
  sellType,
  unitId,
}: StickyBoxProps): React.ReactNode => {
  const { data: session } = useSession();
  const [date, setDate] = useState<Date>();
  const [needsDiscussion, setNeedsDiscussion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: session?.user?.phone || "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const requestData = {
        ...formData,
        date,
        needsDiscussion,
        unitId,
        userId: session?.user?.id ? session.user.id : undefined,
      } as const;

      const result = await requestSchedule(requestData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Reservation request sent successfully",
        });

        if (session?.user) {
          setFormData((prev) => ({
            ...prev,
            message: "",
          }));
        } else {
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: "",
          });
        }

        setDate(undefined);
        setNeedsDiscussion(false);
        setIsOpen(false);
      } else {
        if ("validationErrors" in result) {
          const formattedErrors: Record<string, string> = {};
          result.validationErrors?.forEach(({ field, message }) => {
            formattedErrors[field] = message;
          });
          setErrors(formattedErrors);

          toast({
            title: "Validation Error",
            description: "Please check the form for errors",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to submit reservation",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof z.ZodError
            ? "Please check the form for errors"
            : "Failed to submit reservation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = React.useCallback(
    () => (
      <ReservationForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        needsDiscussion={needsDiscussion}
        setNeedsDiscussion={setNeedsDiscussion}
        date={date}
        setDate={setDate}
        isSubmitting={isSubmitting}
        session={session}
      />
    ),
    [
      formData,
      handleChange,
      handleSubmit,
      errors,
      needsDiscussion,
      setNeedsDiscussion,
      date,
      setDate,
      isSubmitting,
      session,
    ]
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t shadow-lg z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900">
              Schedule a visit
            </p>
            <p className="text-xs text-gray-500">
              Make an appointment to view the property
            </p>
          </div>
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <button className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors">
                Reserve
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[100dvh] rounded-none">
              <DrawerHeader className="border-b">
                <DrawerTitle>Make a Reservation</DrawerTitle>
                <div className="flex flex-col gap-1 mt-4">
                  <p className="text-xl font-semibold text-gray-900">
                    ₱
                    {Number(price)?.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                    <span className="ml-2 font-light text-lg">
                      for {sellType}
                    </span>
                  </p>
                </div>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1 pt-3 px-4">
                {renderForm()}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[500px] border sticky top-24 self-start p-6 shadow-lg rounded-lg flex flex-col gap-4 md:hidden">
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold text-gray-900">
          ₱
          {Number(price)?.toLocaleString("en-US", {
            minimumFractionDigits: 0,
          })}
          <span className="ml-2 font-light text-lg">for {sellType}</span>
        </p>
        <p className="text-sm text-gray-500">
          Please fill in the details below to make a reservation
        </p>
      </div>

      {renderForm()}
    </div>
  );
};

export default StickyBox;
