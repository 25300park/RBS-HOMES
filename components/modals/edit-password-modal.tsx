"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editPassword } from "@/app/(route)/account/(auth)/management/action";
import { useToast } from "@/hooks/use-toast";

const EditPasswordModal = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [state, action] = useFormState<any, FormData>(editPassword, undefined);

  useEffect(() => {
    if (state?.message) {
      toast({ description: state.message });
      if (state.status === 200) {
        onClose();
      }
    }
  }, [state?.message, state?.status]);

  return (
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
        <p className="text-gray-600 mt-1">
          Please enter your current password and new password.
        </p>
      </div>

      <form action={action} className="grid gap-4">
        <div className="space-y-4">
          <div>
            <Input
              type="password"
              name="prevPassword"
              placeholder="Current Password"
              className="w-full"
              required
            />
            {state?.errors?.prevPassword && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.prevPassword.join(", ")}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="w-full"
              required
            />
            {state?.errors?.newPassword && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.newPassword.join(", ")}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              name="newPasswordCheck"
              placeholder="Confirm New Password"
              className="w-full"
              required
            />
            {state?.errors?.newPasswordCheck && (
              <p className="text-sm text-red-500 mt-1">
                {state.errors.newPasswordCheck.join(", ")}
              </p>
            )}
          </div>
        </div>

        {state?.errors?.form && (
          <div className="text-sm text-red-500 text-center">
            {state.errors.form.join(", ")}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Change Password
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>Password requirements:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Minimum 6 characters long</li>
          <li>Must include at least one number</li>
          <li>Must include at least one letter</li>
        </ul>
      </div>
    </div>
  );
};

export default EditPasswordModal;
