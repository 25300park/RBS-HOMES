// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

// Prisma의 User 모델 타입 선언
declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Prisma의 User 모델에 맞게 id를 number로 설정
      email: string;
      level: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: number; // Prisma의 User 모델에 맞게 id를 number로 설정
    email: string;
    level: number;
  }
}
