import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },  // ✅ MATCH with login page
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Login attempt:", credentials?.identifier);

        if (!credentials?.identifier || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Missing credentials");
        }

        const identifier = credentials.identifier.trim().toLowerCase();
        console.log("🔍 Searching for:", identifier);

        const foundUsers = await db
          .select()
          .from(users)
          .where(
            or(
              eq(users.email, identifier),
              eq(users.username, identifier)
            )
          )
          .limit(1);

        if (foundUsers.length === 0) {
          console.log("❌ User not found:", identifier);
          throw new Error("Invalid credentials");
        }

        const user = foundUsers[0];
        console.log("👤 User found:", user.email, "Role:", user.role);

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("✅ Password match:", isValid);

        if (!isValid) {
          console.log("❌ Password mismatch for:", user.email);
          throw new Error("Invalid credentials");
        }

        if (user.status === "blocked") {
          console.log("❌ Account blocked:", user.email);
          throw new Error("Account suspended");
        }

        console.log("✅ Login successful for:", user.email);
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DEM";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}