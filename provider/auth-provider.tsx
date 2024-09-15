"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useAuthStore } from "@/store/use-auth-store";

interface Props {
  children: React.ReactNode;
  session: any;
}

const AuthProvider = ({ children, session }: Props) => {
  const { setSession } = useAuthStore();

  // 세션이 있으면 store에 저장
  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default AuthProvider;
