import { createAdminClient } from "./supabase/admin";

// Returns the single owner's user ID — auto-discovered from Supabase Auth.
// Uses admin client so no login is needed anywhere in the app.
export async function getOwnerId(): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  const id = data?.users?.[0]?.id;
  if (!id) throw new Error("No owner account found. Sign up once at /register or create a user in Supabase Auth.");
  return id;
}
