import bcrypt from "bcrypt";
import { prisma } from "@/server/db";

// Used to run bcrypt.compare on a nonexistent-user path so lookup timing
// doesn't reveal whether an email is registered (no real account uses this hash).
const DUMMY_HASH = "$2b$10$hEyjX7CmLWHb/CSSaI8M0uSwq6niOvG6Nm9bczYsbGam7l0P6bG3W";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Distinguishable from unexpected errors (DB failures, etc.) so callers can
// safely forward only this message to the client without risking leaking
// internal error details.
export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "DuplicateEmailError";
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });

  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "traveler" | "nri" | "vendor" = "traveler"
) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, name, role },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
