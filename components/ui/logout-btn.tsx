"use client";

import { ConfirmDialog } from "./confirm-dialog";
import { LuLogOut } from "react-icons/lu";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const handleLogout = () => {
    signOut();
  };

  return (
    <ConfirmDialog
      title="Logout"
      description="Are you sure you want to log out? You will need to log in again to access your account."
      confirmText="Logout"
      cancelText="Cancel"
      onConfirm={handleLogout}
    >
      <div className="flex items-center py-2 px-4 bg-gray-50 mt-8 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100">
        <LuLogOut className="w-5 h-5 mr-2" />
        <p>Logout</p>
      </div>
    </ConfirmDialog>
  );
}

export default LogoutButton;
