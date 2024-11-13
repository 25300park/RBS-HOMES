"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalStore } from "@/store/use-modal-store";
import { signIn } from "next-auth/react";
import { signup, login, resetPassword } from "@/lib/action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useCooldown } from "@/hooks/use-cooldown";

type AuthModeType = "login" | "signup" | "reset";

const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const { modalType } = useModalStore();
  const { pending } = useFormStatus();
  const [authMode, setAuthMode] = useState<AuthModeType>(
    modalType === "signup" ? "signup" : "login"
  );
  const { toast } = useToast();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const { isInCooldown, timer, startCooldown } = useCooldown({
    cooldownTime: 60,
    onCooldownEnd: () => {
      toast({ description: "You can now request another password reset." });
    },
  });

  const [state, action] = useFormState<any, FormData>(
    authMode === "login"
      ? login
      : authMode === "signup"
      ? signup
      : resetPassword,
    undefined
  );

  useEffect(() => {
    if (state?.message) {
      toast({
        description: state.message,
        variant: state.status === 200 ? "default" : "destructive",
      });

      if (state.status === 200) {
        if (authMode === "reset") {
          setAuthMode("login");
          onClose();
        } else {
          signIn("credentials", {
            email: state.email,
            password: state.password,
            redirect: true,
          })
            .then((result) => {
              if (!result?.error) {
                router.push("/");
              } else {
                toast({
                  description: "Login failed. Please try again.",
                  variant: "destructive",
                });
              }
            })
            .finally(() => onClose());
        }
      }
    }
  }, [state, authMode, onClose, router, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authMode === "reset" && isInCooldown) {
      toast({
        description: `Please wait ${timer} seconds before requesting another password reset.`,
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);

    if (authMode === "signup") {
      setPendingFormData(formData);
      setShowConfirm(true);
    } else {
      if (authMode === "reset") {
        startCooldown();
      }
      action(formData);
    }
  };

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">
              Verify Your Email Address
            </h3>
            <div className="text-sm text-gray-600 mb-4 space-y-2">
              <p>
                Please make sure your email address is correct. This email will
                be used for:
              </p>
              <ul className="list-disc pl-6">
                <li>Account recovery if you forget your password</li>
                <li>Important security notifications</li>
                <li>Account verification</li>
              </ul>
              <p className="font-medium mt-2">
                Double-check that you have entered your email correctly before
                proceeding.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingFormData(null);
                }}
              >
                Check Again
              </Button>
              <Button
                onClick={() => {
                  if (pendingFormData) {
                    action(pendingFormData);
                    setShowConfirm(false);
                    setPendingFormData(null);
                  }
                }}
              >
                Confirm & Create Account
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {authMode === "login"
            ? "Sign In"
            : authMode === "signup"
            ? "Sign Up"
            : "Reset Password"}
        </h2>
        <p className="text-gray-600">
          {authMode === "login"
            ? "Please sign in to your account."
            : authMode === "signup"
            ? "Create an account to get started."
            : "Enter your email to reset password."}
        </p>
      </div>

      {authMode !== "reset" && (
        <div className="mb-6">
          <Button
            onClick={() => signIn("google", { redirect: true })}
            className="flex items-center justify-center w-full py-2 mb-4 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            Continue with Google
          </Button>
          <div className="relative text-center text-gray-600">
            <span className="bg-white px-2 relative z-10">or</span>
            <div className="absolute top-1/2 left-0 w-full border-t border-gray-300"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          className="mb-4 w-full"
        />

        {authMode !== "reset" && (
          <Input
            name="password"
            type="password"
            placeholder="Password"
            className="mb-4 w-full"
          />
        )}

        {authMode === "signup" && (
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="mb-4 w-full"
          />
        )}

        {state?.errors && (
          <div className="text-sm text-red-500">
            {Object.entries(state.errors).map(([field, errors]: any) => (
              <p key={field}>
                {field}: {errors?.join(", ")}
              </p>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={pending || (authMode === "reset" && isInCooldown)}
        >
          {pending
            ? "Processing..."
            : authMode === "reset"
            ? isInCooldown
              ? `Wait ${timer}s`
              : "Send Temporary Password"
            : authMode === "login"
            ? "Login"
            : "Sign Up"}
        </Button>
      </form>

      <div className="text-sm mt-6 text-center text-gray-600 space-y-2">
        {authMode === "login" && (
          <>
            <p>
              Don&apos;t have an account?{" "}
              <span
                onClick={() => setAuthMode("signup")}
                className="text-blue-500 cursor-pointer"
              >
                Sign up
              </span>
            </p>
            <p>
              <span
                onClick={() => setAuthMode("reset")}
                className="text-blue-500 cursor-pointer"
              >
                Forgot password?
              </span>
            </p>
          </>
        )}

        {authMode === "signup" && (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setAuthMode("login")}
              className="text-blue-500 cursor-pointer"
            >
              Log in
            </span>
          </p>
        )}

        {authMode === "reset" && (
          <p>
            Remember your password?{" "}
            <span
              onClick={() => setAuthMode("login")}
              className="text-blue-500 cursor-pointer"
            >
              Back to login
            </span>
          </p>
        )}
      </div>
    </>
  );
};

export default AuthModal;
