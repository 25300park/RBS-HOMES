"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendContactForm } from "@/lib/action";

const ContactModal = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // High Street South Corporate Plaza Tower 2 coordinates
  const latitude = 14.5508;
  const longitude = 121.0505;

  // Static Google Map URL
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=600x600&maptype=roadmap&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${
    process.env.NEXT_PUBLIC_GOOGLE_KEY || "YOUR_API_KEY"
  }`;

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Call server action function
      const response = await sendContactForm(formData);
      console.log(response);
      if (response.success) {
        toast({ description: response.message });
        setTimeout(() => onClose(), 1000);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An error occurred while submitting your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg md:overflow-scroll w-full">
      <div className="flex md:flex-col-reverse">
        <div className="w-full relative md:h-auto">
          <img
            src={staticMapUrl}
            alt="Office Location Map"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            WE&apos;RE HERE TO HELP
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Unit 3306, High Street South Corporate Plaza Tower2,
            <br />
            11TH AVE, COR 26th St, BGC, Taguig, Metro Manila
          </p>

          <div className="mb-6">
            <p className="text-sm font-medium">
              Office: <span className="font-bold">02. 8421. 4458</span>
              <br />
              Mobile: <span className="font-bold">0954. 349. 3042</span>
            </p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="NAME"
              className="border-gray-300"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="EMAIL"
              className="border-gray-300"
              required
            />
            <Input
              name="phone"
              placeholder="PHONE"
              className="border-gray-300"
              required
            />
            <Textarea
              name="message"
              placeholder="MESSAGE"
              className="border-gray-300 min-h-[120px]"
              required
            />

            <div className="text-xs text-gray-600 mt-2">
              By submitting this form you agree that RBS-HOMES, its affiliates
              or associated third parties may contact you, including with calls
              or texts, by using the phone number you have provided and in
              accordance with our Privacy Policy. Message/data rates may apply.
              Your consent is not a condition to access real estate services.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2"
            >
              {isSubmitting ? "SENDING..." : "SEND"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
