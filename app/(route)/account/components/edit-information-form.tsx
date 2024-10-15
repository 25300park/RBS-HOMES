"use client";

import { useState } from "react";
import UserProfileAvatar from "../components/user-profile-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectionBox from "@/components/ui/select-box";
import { UserLevelOptions } from "@/lib/config/account-options";
import { editUserProfile } from "../management/action";
import { useSession} from "next-auth/react";
export interface EditInformationFormProps {
  session: any;
}

const EditInformationForm = ({ session }: EditInformationFormProps) => {
  const { update } = useSession(); 
  const [name, setName] = useState(session?.user.name);
  const [level, setLevel] = useState(String(session?.user.level));
  const [phone, setPhone] = useState(session?.user.phone);
  const [email, setEmail] = useState(session?.user.email);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(session?.user.image || null);
  const handleSaveChanges = async (e: any) => {
    e.preventDefault();
    
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);

      try {
        const response = await fetch("/api/image-upload/profile", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setImageUrl(data.imageUrl)
      } catch (error) {
        console.error("Image upload failed:", error);
        return;
      }
    }

    // 프로필 수정 API 호출
    try {
      const response = await editUserProfile({
        name,
        phone,
        profileImage: imageUrl, // 업로드된 이미지 URL을 전달 (없으면 null)
        level,
      });

      if (response.status === 200) {
       await update({name, phone, level,  image: imageUrl? imageUrl: null})
        console.log("Profile updated successfully");
      } else {
        console.error("Profile update failed:", response.message);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <form>
      <section className="my-8">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        <div className="flex justify-center my-8">
        <UserProfileAvatar
            imageUrl={imageUrl}
            onImageSelect={setSelectedImage}
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Full Name
            </label>
            <Input
              type="text"
              placeholder={session?.user.name ?? "Enter your name"}
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
      </section>
      <section className="py-8 border-t">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        <div className="my-6">
          <label className="block text-xs mb-1 font-medium text-zinc-500">
            User Type
          </label>
          <SelectionBox
            options={UserLevelOptions}
            selectedValue={level}
            onSelect={(value) => setLevel(value)}
            className="w-full space-x-0 flex gap-2"
            boxClassName="h-11 w-32"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Primary Phone Number
            </label>
            <Input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              placeholder={session?.user.email}
            />
          </div>
        </div>
      </section>
      <div className="flex justify-end">
        <Button
          className="bg-blue-400 text-white hover:bg-blue-300"
          onClick={(e) => handleSaveChanges(e)}
        >
          Save Changes
        </Button>
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
