import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";

// Cached for 1 hour — owner ID never changes, no need to re-fetch every request
export const getOwnerId = unstable_cache(
  async (): Promise<string> => {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const id = data?.users?.[0]?.id;
    if (!id) throw new Error("No owner account found. Create a user in Supabase Auth.");
    return id;
  },
  ["owner-id"],
  { revalidate: 3600 }
);
