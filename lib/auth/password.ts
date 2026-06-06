import "server-only";
import { compare, hash } from "bcryptjs";

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) return false;
  return compare(password, passwordHash);
}

export function validatePasswordPolicy(password: unknown) {
  if (typeof password !== "string") {
    return { ok: false as const, message: "Senha inválida." };
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return {
      ok: false as const,
      message: "Use uma senha com pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.",
    };
  }

  return { ok: true as const };
}
