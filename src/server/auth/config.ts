import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      phoneNumber: string | null;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [GoogleProvider],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: async ({ session, user }) => {
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          phoneNumber: dbUser?.phoneNumber ?? null,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
