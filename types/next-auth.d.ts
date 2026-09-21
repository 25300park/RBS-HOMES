// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      level: number;
      phone: string;
      isSuperAdmin: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    id: number;
    email: string;
    level: number;
    phone: string;
    isSuperAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    level: number;
    phone: string;
    isSuperAdmin: boolean;
  }
}