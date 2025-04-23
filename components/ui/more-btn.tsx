"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/use-modal-store";

const MoreBtn = () => {
  const { openModal } = useModalStore();

  return (
    <HoverCard openDelay={0.5}>
      <HoverCardTrigger className="cursor-pointer">more</HoverCardTrigger>

      <HoverCardContent
        align="end"
        className="w-[300px] bg-white shadow-lg rounded-lg p-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-1">Welcome to RBS Homes</h3>
          <p className="text-sm text-gray-500">
            Sign in to access your account
          </p>
        </div>

        <Button
          onClick={() => openModal("complain")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-3"
        >
       dddd
        </Button>



        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          <p>By signing in, you can:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Save your favorite properties</li>
            <li>Get personalized recommendations</li>
            <li>Contact property owners directly</li>
            <li>Manage your profile and preferences</li>
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MoreBtn;
