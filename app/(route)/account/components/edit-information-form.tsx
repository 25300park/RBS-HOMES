"use client";

import { useState } from "react";
import UserProfileAvatar from "../components/user-profile-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectionBox from "@/components/ui/select-box";
import { UserLevelOptions } from "@/lib/config/account-options";

export interface EditInformationFormProps {
  session: any;
}

const EditInformationForm = ({
  session,
}: EditInformationFormProps): React.ReactNode => {
  const [fullName, setFullName] = useState(session?.user.name);
  const [userLevel, setUserLevel] = useState(String(session?.user.level));
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(session?.user.email);
  const handleSaveChanges = () => {};

  return (
    <form>
      {/* Personal Information */}
      <section className="my-8">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        <div className="flex justify-center my-8">
          <UserProfileAvatar admin={session.user} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs mb-1 font-medium text-zinc-500">
              Full Name
            </label>
            <Input
              type="text"
              placeholder={session?.user.name ?? "Enter your name"}
              value={fullName ?? ""}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
      </section>
      {/* Contact Information */}
      <section className=" py-8 border-t">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
        <div className=" my-6">
          <label className="block text-xs mb-1 font-medium text-zinc-500">
            User Type
          </label>
          <SelectionBox
            options={UserLevelOptions}
            selectedValue={userLevel}
            onSelect={(value) => setUserLevel(value)}
            className="w-full space-x-0 flex gap-2"
            boxClassName="h-11 w-32"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Primary Phone Number */}
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
            <div className="text-orange-500 text-sm mt-2 font-semibold">
              If you want to sell your home, you need to provide your phone
              number.
            </div>
          </div>

          {/* Email */}
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
      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button
          className="bg-blue-400 text-white hover:bg-blue-300"
          onClick={handleSaveChanges}
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
