"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalStore } from "@/store/use-modal-store";
import { signIn } from "next-auth/react"; // NextAuth를 통한 자동 로그인 처리
import { signup, login } from "@/lib/action"; // 서버 액션
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const { modalType } = useModalStore();
  const { pending } = useFormStatus();
  const [authMode, setAuthMode] = useState<"login" | "signup">(
    modalType === "signup" ? "signup" : "login"
  );
  const { toast } = useToast();
  const router = useRouter();

  // useFormState로 로그인 및 회원가입 상태 관리
  const [state, action] = useFormState(
    authMode === "login" ? login : signup,
    undefined
  );
  console.log(111, authMode)
  useEffect(() => {
    if (state?.message) {
      toast({ description: state.message });

      if (state.status === 200) {
        signIn("credentials", {
          email: state.email,
          password: state.password,
          redirect: false,
        })
          .then((result) => {
            if (!result?.error) {
              router.push("/");
            } else {
              toast({
                description: "Login failed. Please try again.",
              });
            }
          })
          .finally(() => onClose());
      }
    }
  }, [state?.message, state?.status, toast, router]);

  // 구글 로그인 처리 및 토스트 메시지 띄우기
  const handleGoogleSignIn = async () => {
    const result = await signIn("google", { redirect: false });
    if (!result?.error) {
      toast({
        description: "Google login successful!",
      });
      router.push("/"); // 로그인 성공 후 리다이렉트
    } else {
      toast({
        description: `Google login failed: ${result.error}`,
        variant: "destructive", // 실패 시 빨간색 토스트 메시지
      });
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          {authMode === "login" ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-gray-600">
          {authMode === "login"
            ? "Please sign in to your account."
            : "Create an account to get started."}
        </p>
      </div>

      {/* 구글 로그인 버튼 */}
      <div className="mb-6">
        <Button
          onClick={handleGoogleSignIn} // 구글 로그인 핸들러 사용
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

      {/* 로그인/회원가입 폼 */}
      <form action={action} className="grid gap-4 py-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          className="mb-4 w-full"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          className="mb-4 w-full"
        />

        {authMode === "signup" && (
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="mb-4 w-full"
          />
        )}

        {/* 에러 메시지 출력 */}
        {state?.errors && (
          <div className="text-sm text-red-500">
            {Object.entries(state.errors).map(([field, errors]) => (
              <p key={field}>
                {field}: {errors.join(", ")}
              </p>
            ))}
          </div>
        )}

        {/* 제출 버튼 */}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? "Processing..."
            : authMode === "login"
            ? "Login"
            : "Sign Up"}
        </Button>
      </form>

      {/* 로그인/회원가입 모드 전환 */}
      <p className="text-sm mt-6 text-center text-gray-600">
        {authMode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => setAuthMode("signup")}
              className="text-blue-500 cursor-pointer"
            >
              Sign up
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span
              onClick={() => setAuthMode("login")}
              className="text-blue-500 cursor-pointer"
            >
              Log in
            </span>
          </>
        )}
      </p>

      {/* 모달 닫기 버튼 */}
      <Button
        onClick={onClose}
        className="mt-6 w-full bg-gray-100 hover:bg-gray-200"
      >
        Close
      </Button>
    </>
  );
};

export default AuthModal;
