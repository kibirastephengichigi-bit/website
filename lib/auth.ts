import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { db, hasDatabaseUrl } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

const providers =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

const authConfig: NextAuthConfig = {
  adapter: hasDatabaseUrl && db ? PrismaAdapter(db) : undefined,
  session: { strategy: "database" },
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role || "USER";
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }
      return session;
    },
    async signIn({ user }) {
      return Boolean(user.email);
    },
  },
  events: {
    async createUser({ user }) {
      if (!db) return;
      await db.userPreference.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      });
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
