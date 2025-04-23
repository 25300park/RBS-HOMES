"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/use-modal-store";

const HeaderGuestProfile = () => {
  const { openModal } = useModalStore();

  return (
    <HoverCard openDelay={0.5}>
      <HoverCardTrigger className="cursor-pointer">
        <div className="flex bg-white items-center py-1 px-3 justify-between border rounded-3xl gap-2">
          <img src="/assets/icons/alarm.png" alt="alarm" />
          <div className="w-[34px] h-[34px] rounded-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        className="w-[300px] bg-white shadow-lg rounded-lg p-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-1">Welcome to RBS Homes</h3>
          <p className="text-sm text-gray-500">Sign in to access your account</p>
        </div>

        <Button 
          onClick={() => openModal("login")} 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-3"
        >
          LOGIN
        </Button>
        
        <Button 
          onClick={() => openModal("signup")} 
          variant="outline" 
          className="w-full border-gray-300"
        >
          SIGN UP
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

export default HeaderGuestProfile;