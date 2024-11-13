"use client";

import { useState } from "react";
import UserProfileAvatar from "../components/user-profile-upload";
import { Input } from "@/components/ui/input";
import SelectionBox from "@/components/ui/select-box";
import { UserLevelOptions } from "@/lib/config/account-options";
import { editUserProfile } from "../(auth)/management/action";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "@/components/ui/submit-btn";
import { useModalStore } from "@/store/use-modal-store";

export interface EditInformationFormProps {
  session: any;
}

const EditInformationForm = ({ session }: EditInformationFormProps) => {
  const { update } = useSession();
  const { toast } = useToast();
  const { openModal } = useModalStore();
  const [name, setName] = useState(session?.user.name || "");
  const [level, setLevel] = useState(String(session?.user.level || 1));
  const [phone, setPhone] = useState(session?.user.phone || "");
  const [email, setEmail] = useState(session?.user.email || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(session?.user.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveChanges = async (e: any) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    let uploadedImageUrl = imageUrl;

    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);

      try {
        const response = await fetch("/api/image-upload/profile", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok || !data.imageUrl) {
          throw new Error("Image upload failed");
        }

        uploadedImageUrl = data.imageUrl;
        setSelectedImage(null);
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({
          variant: "destructive",
          title: "Image upload failed",
          description: "please try again later",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await editUserProfile({
        name,
        phone,
        profileImage: uploadedImageUrl,
        level,
      });

      if (response.status === 200) {
        await update({ name, phone, level, image: uploadedImageUrl });
        toast({
          title: response.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Profile update failed",
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Error Saving",
        description: "please contact the administrator",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="">
      <section className="my-8 md:my-6">
        <h2 className="text-xl font-bold mb-4 md:mb-3">Personal Information</h2>
        <div className="flex justify-center my-8 md:my-6">
          <UserProfileAvatar
            imageUrl={imageUrl || null}
            onImageSelect={setSelectedImage}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-4">
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Full Name
            </label>
            <Input
              type="text"
              placeholder={session?.user.name ?? "Enter your name"}
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            {session?.user.level !== 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  openModal("editPassword");
                }}
                className="py-2 px-4  rounded-md text-white bg-orange-400"
              >
                Change Password
              </button>
            )}
          </div>
        </div>
      </section>

      {session?.user.level === 0 ? (
        "Admin User"
      ) : (
        <section className="py-8 md:py-6 border-t">
          <h2 className="text-xl font-bold mb-4 md:mb-3">
            Contact Information
          </h2>
          <div className="my-6 md:my-4">
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              User Type
            </label>
            <SelectionBox
              options={UserLevelOptions}
              selectedValue={level}
              onSelect={(value) => setLevel(value)}
              className="w-full space-x-0 flex gap-2 md:gap-1"
              boxClassName="h-11 w-32 md:h-10 md:text-sm"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-4">
            <div>
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Primary Phone Number
              </label>
              <Input
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:mt-2">
              <label className="block text-xs mb-1 font-medium text-zinc-500">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                placeholder={session?.user.email}
                className="w-full bg-gray-50"
              />
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-end pt-4">
        <SubmitButton
          isSubmitting={isSubmitting}
          onClick={handleSaveChanges}
          label="Save Changes"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default EditInformationForm;
// {/* Invoice Information */}
// <section className=" py-8 border-t">
//   <h2 className="text-xl font-bold mb-4">Invoice Information</h2>

//   <div className="grid grid-cols-2 gap-6">
//     {/* Buyer Name */}
//     <div>
//       <label className="block text-xs mb-1 font-medium text-zinc-500">
//         Buyer Name
//       </label>
//       <Input
//         type="text"
//         placeholder="Enter buyer's name"
//         value={buyerName}
//         onChange={(e) => setBuyerName(e.target.value)}
//       />
//     </div>

//     {/* Email for Invoice */}
//     <div>
//       <label className="block text-xs mb-1 font-medium text-zinc-500">
//         Email for Invoice
//       </label>
//       <Input
//         type="email"
//         placeholder="Enter invoice email"
//         value={invoiceEmail}
//         onChange={(e) => setInvoiceEmail(e.target.value)}
//       />
//     </div>

//     {/* Company Name */}
//     <div>
//       <label className="block text-xs mb-1 font-medium text-zinc-500">
//         Company Name
//       </label>
//       <Input
//         type="text"
//         placeholder="Enter company name"
//         value={companyName}
//         onChange={(e) => setCompanyName(e.target.value)}
//       />
//     </div>

//     {/* Tax Code */}
//     <div>
//       <label className="block text-xs mb-1 font-medium text-zinc-500">Tax Code</label>
//       <Input
//         type="text"
//         placeholder="e.g., 1234567890 or 1234567890-123"
//         value={invoiceTaxCode}
//         onChange={(e) => setInvoiceTaxCode(e.target.value)}
//       />
//       <p className="text-gray-500 text-sm">
//         Tax code must be 10 or 13 digits
//       </p>
//     </div>

//     {/* Address */}
//     <div className="col-span-2">
//       <label className="block text-xs mb-1 font-medium text-zinc-500">Address</label>
//       <Input
//         type="text"
//         placeholder="Enter your address"
//         value={address}
//         onChange={(e) => setAddress(e.target.value)}
//       />
//     </div>
//   </div>
// </section>
