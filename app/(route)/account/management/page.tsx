"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import EditInformationForm from "../components/edit-information-form";
import RegisterBrokerForm from "../components/register-broker-form";

export default function AccountManagement() {
  const { session } = useAuthStore();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tabs") || "EditInformation"; // 기본 탭 설정
  const router = useRouter();

  if (session === null) {
    return <div>loading...</div>;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "EditInformation":
        return <EditInformationForm session={session} />;
      case "RegisterBroker":
        return <RegisterBrokerForm session={session} />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="container mx-auto max-w-[800px] bg-white shadow-md rounded my-4 p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-4">Account Management</h1>

      <div className="flex space-x-8 flex-col">
        {/* Tabs */}
        <div className="flex  w-full">
          <button
            className={`text-lg  w-1/2 text-center cursor-pointer border-b-2 ${currentTab === "EditInformation" ? "border-orange-500" : ""}`}
            onClick={() => router.push("/account/management?tabs=EditInformation")}
          >
            Edit Information
          </button>
          <button
            className={`text-lg  w-1/2 text-center cursor-pointer border-b-2 ${currentTab === "RegisterBroker" ? "border-orange-500" : ""}`}
            onClick={() => router.push("/account/management?tabs=RegisterBroker")}
          >
            Register as Professional Broker
          </button>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
}
