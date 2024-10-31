"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import EditInformationForm from "../components/edit-information-form";
import RegisterBrokerForm from "../components/register-broker-form";
import { LodaingUi } from "@/components/ui/loading-ui";
import { useToast } from "@/hooks/use-toast";

export default function AccountManagement() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const currentTab = searchParams.get("tabs") || "EditInformation";
  
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      // 토스트 메시지 표시
      toast({
        description: message,
        variant: "destructive",
      });

      // 현재 URL에서 message 파라미터만 제거
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("message");
      
      // 새로운 URL로 replace (히스토리에 추가하지 않음)
      const newPathname = window.location.pathname + 
        (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '');
      router.replace(newPathname);
    }
  }, [searchParams, toast, router]);

  if (session === null) {
    return <LodaingUi />;
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
      <h1 className="text-2xl font-semibold mb-4">Account Management</h1>
      <div className="flex space-x-8 flex-col">
        {renderTabContent()}
      </div>
    </div>
  );
}

        {/* Tabs */}
        {/* <div className="flex  w-full">
          <button
            className={`text-lg  w-1/2 text-center cursor-pointer border-b-2 ${
              currentTab === "EditInformation" ? "border-orange-500" : ""
            }`}
            onClick={() =>
              router.push("/account/management?tabs=EditInformation")
            }
          >
            Edit Information
          </button>
          <button
            className={`text-lg  w-1/2 text-center cursor-pointer border-b-2 ${
              currentTab === "RegisterBroker" ? "border-orange-500" : ""
            }`}
            onClick={() =>
              router.push("/account/management?tabs=RegisterBroker")
            }
          >
            Register as Professional Broker
          </button>
        </div> */}
