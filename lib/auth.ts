import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

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

        const user =
          await prisma.user.findUnique({
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
          throw new Error(
            "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
          );
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
      clientId:
        process.env.GOOGLE_CLIENT_ID!,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.role =
          (user as {
            role?: string;
          }).role;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        (
          session.user as {
            role?: string;
          }
        ).role =
          token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret:
    process.env.NEXTAUTH_SECRET,
};