import bcrypt from "bcrypt";
import prisma from "./database";

export async function ensureAdminExists(): Promise<void> {
  const email    = process.env.ADMIN_SEED_EMAIL    ?? "admin@leads.local";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  });

  console.log(`[bootstrap] admin created: ${email}`);
}
