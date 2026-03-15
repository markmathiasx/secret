import { createClient } from "@supabase/supabase-js";
<<<<<<< ours
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
=======
import { getSupabaseEnv } from "@/lib/env";

const { url, anon } = getSupabaseEnv();
>>>>>>> theirs

export const supabaseBrowser = url && anon ? createClient(url, anon) : null;
