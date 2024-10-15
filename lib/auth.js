import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          await prisma.loginLog.create({
            data: {
              ip:
                req.headers["x-forwarded-for"] || req.connection.remoteAddress,
              attemptStatus: "fail", // 로그인 실패
              userId: null, // 실패 시 유저 없음
            },
          });
          throw new Error("Missing credentials");
        }

        // 이메일로 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          await prisma.loginLog.create({
            data: {
              ip:
                req.headers["x-forwarded-for"] || req.connection.remoteAddress,
              attemptStatus: "fail", // 로그인 실패
              userId: null, // 실패 시 유저 없음
            },
          });
          throw new Error("No user found with the given email");
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          await prisma.loginLog.create({
            data: {
              ip:
                req.headers["x-forwarded-for"] || req.connection.remoteAddress,
              attemptStatus: "fail", // 로그인 실패
              userId: user.id, // 실패 시 유저 ID 기록
            },
          });
          throw new Error("Incorrect password");
        }

        // 로그인 성공 기록
        await prisma.loginLog.create({
          data: {
            ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            attemptStatus: "success", // 로그인 성공
            userId: user.id,
          },
        });
        // 사용자 정보 반환
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          phone: user.phone,
          image: user.image,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email; // 세션에 이메일 저장
        session.user.level = token.level;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.status = token.status;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session !== null) {
        const { name, phone, image, level } = session;
        token.name = name;
        token.phone = phone;
        token.image = image;
        token.level = level;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email; // JWT에 이메일 저장
        token.level = user.level;
        token.phone = user.phone;
        token.image = user.image;
        token.status = user.status;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};

export { authOptions };
