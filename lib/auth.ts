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
          throw new Error("Missing credentials");
        }

        // Demo Login Helper for Local Development & Instant Preview
        if (credentials.password === "demo" || credentials.email.endsWith("@demo.com")) {
          const roleLevels: Record<string, { name: string; level: number }> = {
            "landlord@demo.com": { name: "Landlord Demo", level: 4 },
            "tenant@demo.com": { name: "Tenant Demo", level: 5 },
            "agent@demo.com": { name: "Agent Demo", level: 2 },
            "buyer@demo.com": { name: "Buyer Demo", level: 1 },
          };

          const roleInfo = roleLevels[credentials.email] || { name: "Demo User", level: 1 };
          
          let demoUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!demoUser) {
            demoUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: roleInfo.name,
                level: roleInfo.level,
                phone: "+63 917 123 4567",
                image: "/assets/images/default-avatar.png",
                password: await bcrypt.hash("demo", 10),
              },
            });
          } else if (!demoUser.phone) {
            demoUser = await prisma.user.update({
              where: { id: demoUser.id },
              data: { phone: "+63 917 123 4567" },
            });
          }

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            level: demoUser.level,
            phone: demoUser.phone,
            image: demoUser.image,
            status: demoUser.status,
            license: demoUser.license,
            isSuperAdmin: demoUser.isSuperAdmin,
          } as any;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("No user found with the given email");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          phone: user.phone,
          image: user.image,
          status: user.status,
          license: user.license,
          isSuperAdmin: user.isSuperAdmin,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              level: 1,
            },
          });
        }

        console.log("[AUTH DEBUG] signIn - dbUser.id:", dbUser.id, typeof dbUser.id);
        // Google의 profile.sub(문자열)가 아니라 우리 DB의 실제 User.id로 교체
        user.id = dbUser.id;
        console.log("[AUTH DEBUG] signIn - user.id after assign:", user.id, typeof user.id);
        (user as any).level = dbUser.level;
        (user as any).phone = dbUser.phone;
        (user as any).status = dbUser.status;
        (user as any).license = dbUser.license;
        (user as any).isSuperAdmin = dbUser.isSuperAdmin;
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as number;
        session.user.email = token.email as string;
        session.user.level = token.level as number;
        session.user.phone = token.phone as string;
        session.user.image = token.image as string;
        (session.user as any).status = token.status as number;
        (session.user as any).license = token.license as string;
        (session.user as any).isSuperAdmin = token.isSuperAdmin as boolean;
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
        console.log("[AUTH DEBUG] jwt - received user:", JSON.stringify(user));
        token.id = user.id as number;
        console.log("[AUTH DEBUG] jwt - token.id after assign:", token.id);
        token.email = user.email as string;
        token.level = (user as any).level as number;
        token.phone = (user as any).phone as string;
        token.image = user.image as string;
        token.status = (user as any).status as number;
        token.license = (user as any).license as string;
        token.isSuperAdmin = (user as any).isSuperAdmin as boolean;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { secret: process.env.NEXTAUTH_SECRET },
};

export { authOptions };