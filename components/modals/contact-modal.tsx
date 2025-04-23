"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
// import { sendContactForm } from "@/app/actions/contact-actions"; 

const ContactModal = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // const response = await sendContactForm(formData);
      // if (response.success) {
      //   toast({ description: "Message sent successfully!" });
      //   onClose();
      // } else {
      //   toast({ description: response.message, variant: "destructive" });
      // }
    } catch (error) {
      toast({ description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full mx-4 shadow-xl">
      <div className="flex flex-col md:flex-row">
        {/* 왼쪽 지도 섹션 */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <div className="absolute inset-0 z-10 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white p-4">
            <h2 className="text-2xl font-bold mb-2">구글맵</h2>
            <h3 className="text-xl font-medium mb-4">회사 주소 위치표시</h3>
          </div>
          {/* 지도 임베드 또는 이미지 */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.802548850011!2d121.04932371483892!3d14.550636189833683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8efd99aad53%3A0xb64b39847a866fde!2sBGC%20Corporate%20Center!5e0!3m2!1sen!2sph!4v1650450051693!5m2!1sen!2sph"
            className="w-full h-full absolute inset-0"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* 오른쪽 폼 섹션 */}
        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">WE'RE HERE TO HELP</h2>
          <p className="text-sm text-gray-700 mb-4">
            Unit 3306, High Street South Corporate Plaza Tower2,
            <br />
            11TH AVE, COR 26th St, BGC, Taguig, Metro Manila
          </p>

          <div className="mb-6">
            <p className="text-sm font-medium">
              Office: <span className="font-bold">02. 8421. 4458</span><br />
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
              By submitting this form you agree that RBS-HOMES, its affiliates or
              associated third parties may contact you, including with calls or texts, by
              using the phone number you have provided and in accordance with our Privacy
              Policy. Message/data rates may apply. Your consent is not a condition to
              access real estate services.
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