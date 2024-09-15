"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  session: any;
}

export default function Sidebar({ session }: SidebarProps) {
  return (
    <aside className="h-[calc(100vh-5rem)] w-64 bg-white shadow-lg border-r">
      <div className="flex flex-col h-full">
        <div className="flex justify-start w-full gap-2 py-6 px-4">
          <img
            src={session?.user?.image || "/default-avatar.png"}
            alt={session?.user?.name || "User"}
            className="rounded-full w-16 h-16"
          />
          <div>
            <h3 className="text-xl font-semibold mt-2">
              {session?.user?.name || "Guest"}
            </h3>
            <p className="text-sm text-gray-500">
              {/* {session ? `${session.user.level} level` : "0"} */}
              유저 인증단계 설정
            </p>
          </div>
        </div>
        <div className="flex flex-col h-full justify-between py-4 border-t">
          <div className="">ddddd</div>

          <Button
            variant="outline"
            className="mt-6 w-full flex"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

// {/* Customer Management */}
{
  /* <div className="mt-4 bg-gray-100 p-4 w-full text-center rounded-md">
<p className="font-bold">Account Balance</p>
<p>Main Account: $0</p>
<p>Promotional Account: $0</p>
<Button variant="outline" className="mt-2">
  Deposit Funds
</Button>
</div> */
}
// <li>
//   <div className="flex justify-between items-center">
//     <p>Customer Management</p>
//     <span className="text-red-500">New</span>
//   </div>
// </li>

// {/* Membership Package */}
// <li>
//   <p>Membership Package</p>
//   <ul className="ml-4 space-y-2">
//     <li>Purchase Membership</li>
//   </ul>
// </li>

// {/* Pro Account */}
// <li>
//   <p>Pro Account</p>
//   <ul className="ml-4 space-y-2">
//     <li>Purchase Pro Account</li>
//   </ul>
// </li>

// {/* Financial Management */}
// <li>
//   <p>Financial Management</p>
//   <ul className="ml-4 space-y-2">
//     <li>Account Balance Information</li>
//     <li>Transaction History</li>
//     <li>Promotions</li>
//     <li>Add Funds to Account</li>
//   </ul>
// </li>
