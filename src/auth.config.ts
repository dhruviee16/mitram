import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config: no Credentials provider here, since it depends on
 * Prisma + bcrypt (Node-only). Middleware uses this directly; the full
 * config in `src/auth.ts` extends it with the actual provider for
 * Node-runtime contexts (API routes, server components).
 */
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
