import { redirect } from "next/navigation";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current Supabase auth user, or null. Does not touch the database.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Ensures a row exists in `public.User` mirroring the Supabase auth user.
 * Idempotent. This is the single point where an auth identity becomes an
 * application user — all app data is keyed off this `User` via Prisma.
 */
export async function syncUser(authUser: AuthUser): Promise<User> {
  const email = authUser.email ?? "";

  // If a row already exists for this email under a different id (e.g. the Supabase
  // auth account was re-created with a new id), realign it to the current auth id
  // instead of failing on the unique email constraint. Owned projects follow via
  // the `onUpdate: Cascade` foreign key.
  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail && existingByEmail.id !== authUser.id) {
      return prisma.user.update({
        where: { email },
        data: { id: authUser.id },
      });
    }
  }

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: { email },
    create: { id: authUser.id, email },
  });
}

/**
 * Guard for the authenticated area. Redirects to /login when signed out,
 * otherwise returns both the auth user and the mirrored application user.
 */
export async function requireUser(): Promise<{
  authUser: AuthUser;
  user: User;
}> {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login");
  }
  const user = await syncUser(authUser);
  return { authUser, user };
}
