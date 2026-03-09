import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Auth0Provider from "next-auth/providers/auth0";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          field: user.field,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Credentials login — user from authorize() has field
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.field = (user as unknown as Record<string, unknown>).field;
      }

      // Auth0 login — look up or create user in our DB
      if (account?.provider === "auth0" && profile?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: (profile.name as string) || "User",
              email: profile.email,
              field: "design",
            },
          });
        }

        token.id = dbUser.id;
        token.field = dbUser.field;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id;
        (session.user as unknown as Record<string, unknown>).field = token.field;
      }
      return session;
    },
  },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
});
