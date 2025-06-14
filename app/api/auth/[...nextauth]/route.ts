// Extend the session type to include user ID and accessToken
import { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

// Debug: Check if environment variables are loaded
console.log("Auth Config Check:", {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in attempt:", { user, account, profile });
      // Check if the email is a berkeley.edu email
      const isBerkeleyEmail = user.email?.endsWith("@berkeley.edu");

      if (!isBerkeleyEmail) {
        // Return false to display a default error message
        return false;
        // Or return a URL to redirect to an error page
        // return '/unauthorized'
      }

      return true;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      if (session.user) {
        session.user.id = token.sub!;
      }
      // Add the Supabase access token to the session if it is a string
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { token, user, account });
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
        };
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
