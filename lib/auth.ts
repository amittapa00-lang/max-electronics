import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import FacebookProvider from "next-auth/providers/facebook";
import { NextAuthOptions } from "next-auth";

const OAUTH_PROVIDERS = ["google", "line", "facebook"];

/**
 * LINE / Facebook บางบัญชีไม่ส่งอีเมลมาให้ (เช่น ยังไม่ได้ขอสิทธิ์อีเมลจาก LINE หรือสมัคร Facebook ด้วยเบอร์โทร)
 * ระบบผูกผู้ใช้ด้วยอีเมล จึงสร้างอีเมลแทนที่ไม่ซ้ำกันให้ (โดเมน .invalid ส่งเมลไม่ได้จริงตามมาตรฐาน)
 */
function oauthEmail(provider: string, providerAccountId: string, email?: string | null) {
  return email || `${provider}.${providerAccountId}@users.invalid`;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!valid) return null;

        if (!user.emailVerified) {
          throw new Error("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // LINE Login — เปิดใช้เมื่อใส่ LINE_CLIENT_ID / LINE_CLIENT_SECRET ใน .env
    ...(process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET
      ? [
          LineProvider({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET,
            // ขออีเมลด้วย (ต้องเปิดสิทธิ์ Email address permission ใน LINE Developers)
            authorization: { params: { scope: "openid profile email" } },
          }),
        ]
      : []),

    // Facebook Login — เปิดใช้เมื่อใส่ FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET ใน .env
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

 callbacks: {
    async signIn({ user, account }) {
      if (account && OAUTH_PROVIDERS.includes(account.provider)) {
        // อ็อบเจ็กต์ user นี้ถูกส่งต่อไปที่ jwt() — ตั้งอีเมลตรงนี้ให้ token ใช้อีเมลเดียวกับในฐานข้อมูล
        user.email = oauthEmail(account.provider, account.providerAccountId, user.email);

        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              name: user.name || `ลูกค้า ${account.provider.toUpperCase()}`,
              email: user.email,
              image: user.image,
              provider: account.provider,
              emailVerified: true,
            },
          });
        }

        user.id = String(existingUser.id);
        user.role = existingUser.role;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};