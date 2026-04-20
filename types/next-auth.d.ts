import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      twoFactorEnabled?: boolean;
      passwordUpdatedAt?: string | null;
      sessionIssuedAt?: number;
    };
  }

  interface User {
    role?: string;
    twoFactorEnabled?: boolean;
    passwordUpdatedAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    twoFactorEnabled?: boolean;
    passwordUpdatedAt?: string | null;
    sessionIssuedAt?: number;
  }
}
