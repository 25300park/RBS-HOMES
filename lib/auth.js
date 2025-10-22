import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// IP 주소를 정확하게 추출하는 헬퍼 함수
const getClientIp = (req) => {
  // IP에서 포트 제거하는 함수
  const cleanIp = (ip) => {
    if (!ip) return "unknown";
    
    if (ip.includes("[")) {
      return ip.split("]")[0] + "]";
    }
    return ip.split(":")[0];
  };

  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (cfConnectingIp) {
    return cleanIp(cfConnectingIp);
  }

  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return cleanIp(ips[0].trim());
  }

  const xRealIp = req.headers["x-real-ip"];
  if (xRealIp) {
    return cleanIp(xRealIp);
  }

  const directIp = req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
  return cleanIp(directIp);
};

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
        const clientIp = getClientIp(req);

        if (!credentials?.email || !credentials?.password) {
          await prisma.loginLog.create({
            data: {
              ip: clientIp,
              attemptStatus: "fail",
              userId: null,
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
              ip: clientIp,
              attemptStatus: "fail",
              userId: null,
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
              ip: clientIp,
              attemptStatus: "fail",
              userId: user.id,
            },
          });
          throw new Error("Incorrect password");
        }

        // 로그인 성공 기록
        await prisma.loginLog.create({
          data: {
            ip: clientIp,
            attemptStatus: "success",
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
          license: user.license,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.level = token.level;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.status = token.status;
        session.user.license = token.license;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session !== null) {
        const { name, phone, image, level, license } = session;
        token.name = name;
        token.phone = phone;
        token.image = image;
        token.level = level;
        token.license = license;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.level = user.level;
        token.phone = user.phone;
        token.image = user.image;
        token.status = user.status;
        token.license = user.license;
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