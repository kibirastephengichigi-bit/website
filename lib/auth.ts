import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import NextAuth from "next-auth";

// Import db only when needed in non-edge contexts
let db: any = null;

async function getDb() {
  if (!db) {
    try {
      const { db: importedDb } = await import("@/lib/db");
      db = importedDb;
    } catch {
      db = null;
    }
  }
  return db;
}

const providers = [];

providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      // Admin credentials: stephen_admin / admin123
      if (credentials?.username === "stephen_admin" && credentials?.password === "admin123") {
        return {
          id: "admin-1",
          email: "admin@stephenasatsa.com",
          name: "Dr. Stephen Asatsa",
          role: "ADMIN",
        };
      }

      // Also support email/password for other admin users from database
      if (!credentials?.username || !credentials?.password) {
        return null;
      }

      const database = await getDb();
      if (!database) {
        return null;
      }

      const user = await database.user.findUnique({
        where: { email: credentials.username as string },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.email = user.email;
      }
      // Add OAuth provider info
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Allow credentials and Google signin
      if (account?.provider === "credentials" || account?.provider === "google") {
        return true;
      }
      return false;
    },
  },
});
