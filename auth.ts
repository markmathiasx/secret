import 'server-only';
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canUserAccessRole, getPublicRole, getUserByEmail, shouldAutoVerifyEmail, verifyPasswordHash, verifyTwoFactorCode } from "@/lib/marketplace-auth";
import { getAuthSecret } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["buyer", "seller", "admin"]).optional().default("buyer"),
  twoFactorCode: z.string().optional(),
});

const providers: Provider[] = [
  Credentials({
    name: "Email e senha",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
      role: { label: "Perfil", type: "text" },
      twoFactorCode: { label: "2FA", type: "text" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password, role, twoFactorCode } = parsed.data;
      const user = await getUserByEmail(email);

      if (!user?.email || !user.isActive || !user.passwordHash) return null;
      if (!canUserAccessRole(user.role, role)) return null;
      if (!shouldAutoVerifyEmail() && !user.emailVerified && role !== "admin") return null;

      const passwordOk = await verifyPasswordHash(password, user.passwordHash);
      if (!passwordOk) return null;

      if (user.twoFactorEnabled) {
        if (!twoFactorCode) return null;
        const valid2fa = await verifyTwoFactorCode(user.id, twoFactorCode);
        if (!valid2fa) return null;
      }

      return {
        id: user.id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        role: getPublicRole(user.role),
        twoFactorEnabled: user.twoFactorEnabled,
        passwordUpdatedAt: user.passwordUpdatedAt?.toISOString() || null,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: getAuthSecret(),
  trustHost: true,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role || "buyer";
        token.twoFactorEnabled = Boolean((user as { twoFactorEnabled?: boolean }).twoFactorEnabled);
        token.passwordUpdatedAt = (user as { passwordUpdatedAt?: string | null }).passwordUpdatedAt || null;
        token.sessionIssuedAt = Math.floor(Date.now() / 1000);
      } else if (typeof token.sessionIssuedAt !== "number") {
        token.sessionIssuedAt = typeof token.iat === "number" ? token.iat : Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || token.sub || "");
        session.user.role = String(token.role || "buyer");
        session.user.twoFactorEnabled = Boolean(token.twoFactorEnabled);
        session.user.passwordUpdatedAt = typeof token.passwordUpdatedAt === "string" ? token.passwordUpdatedAt : null;
        session.user.sessionIssuedAt = typeof token.sessionIssuedAt === "number" ? token.sessionIssuedAt : undefined;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.email) {
        await prisma.user.updateMany({
          where: {
            email: user.email.toLowerCase(),
          },
          data: {
            emailVerified: new Date(),
          },
        });
      }

      return true;
    },
  },
});
