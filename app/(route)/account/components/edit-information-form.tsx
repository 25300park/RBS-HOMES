"use client";

import { useState } from "react";
import UserProfileAvatar from "../components/user-profile-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface EditInformationFormProps {
  session: any;
}

const EditInformationForm = ({
  session,
}: EditInformationFormProps): React.ReactNode => {
  const [fullName, setFullName] = useState(session?.user.name);
  const [taxCode, setTaxCode] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [email, setEmail] = useState(session?.user.email);
  const [buyerName, setBuyerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceTaxCode, setInvoiceTaxCode] = useState("");
  const [address, setAddress] = useState("");

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
            <label className="block text-sm mb-1 text-gray-700">
              Full Name
            </label>
            <Input
              type="text"
              placeholder={session?.user.name ?? "Enter your name"}
              value={fullName ?? ""}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Personal Tax Code */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Personal Tax Code
            </label>
            <Input
              type="text"
              placeholder="e.g., 1234567890 or 1234567890-123"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              Tax code must be 10 or 13 digits
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className=" py-8 border-t">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Primary Phone Number */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Primary Phone Number
            </label>
            <Input
              type="text"
              placeholder="Enter your phone number"
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
            />
            <button className="text-red-500 mt-2 font-semibold">
              + Add Phone Number
            </button>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">Email</label>
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

      {/* Invoice Information */}
      <section className=" py-8 border-t">
        <h2 className="text-xl font-bold mb-4">Invoice Information</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Buyer Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Buyer Name
            </label>
            <Input
              type="text"
              placeholder="Enter buyer's name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
          </div>

          {/* Email for Invoice */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Email for Invoice
            </label>
            <Input
              type="email"
              placeholder="Enter invoice email"
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Company Name
            </label>
            <Input
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Tax Code */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">Tax Code</label>
            <Input
              type="text"
              placeholder="e.g., 1234567890 or 1234567890-123"
              value={invoiceTaxCode}
              onChange={(e) => setInvoiceTaxCode(e.target.value)}
            />
            <p className="text-gray-500 text-sm">
              Tax code must be 10 or 13 digits
            </p>
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="block text-sm mb-1 text-gray-700">Address</label>
            <Input
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
