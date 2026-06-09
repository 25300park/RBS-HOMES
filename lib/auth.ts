import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const clientIp = "unknown";

        if (!credentials?.email || !credentials?.password) {
          await prisma.loginLog.create({
            data: { ip: clientIp, attemptStatus: "fail", userId: null },
          });
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          await prisma.loginLog.create({
            data: { ip: clientIp, attemptStatus: "fail", userId: null },
          });
          throw new Error("No user found with the given email");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          await prisma.loginLog.create({
            data: { ip: clientIp, attemptStatus: "fail", userId: user.id },
          });
          throw new Error("Incorrect password");
        }

        await prisma.loginLog.create({
          data: { ip: clientIp, attemptStatus: "success", userId: user.id },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          phone: user.phone,
          image: user.image,
          status: user.status,
          license: user.license,
        } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as number;
        session.user.email = token.email as string;
        session.user.level = token.level as number;
        session.user.phone = token.phone as string;
        session.user.image = token.image as string;
        (session.user as any).status = token.status as number;
        (session.user as any).license = token.license as string;
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
        token.id = user.id as number;
        token.email = user.email as string;
        token.level = (user as any).level as number;
        token.phone = (user as any).phone as string;
        token.image = user.image as string;
        token.status = (user as any).status as number;
        token.license = (user as any).license as string;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { secret: process.env.NEXTAUTH_SECRET },
};

export { authOptions };