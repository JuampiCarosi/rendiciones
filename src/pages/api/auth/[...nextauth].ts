import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

// const allowedEmails = env.ALLOWED_EMAILS?.split(",");

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        session.user.isAdmin = (user.isAdmin as boolean) ?? false;
      }
      return { ...session, ...user };
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ account, profile }) {
      if (env.NEXTAUTH_TEST_MODE === "true") return true;
      if (account?.provider !== "google" || !profile?.email) return false;
      if (profile.email.endsWith("@cldproyectos.com")) return true;

      const allowedEmails = (
        await prisma.allowedEmails.findMany({
          select: {
            email: true,
          },
        })
      ).map((user) => user.email);

      return Boolean(allowedEmails?.includes(profile.email));
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      id: "google",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
};

export default NextAuth(authOptions);
