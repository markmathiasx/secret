import { createClient } from "@supabase/supabase-js";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl();
const anonKey = getSupabaseAnonKey();
=======
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
=======
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
=======
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
=======
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
>>>>>>> theirs

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
>>>>>>> theirs

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
>>>>>>> theirs

const url = getSupabaseUrl();
const key = getSupabaseAnonKey();
>>>>>>> theirs

export const supabaseBrowser =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
    : null;
=======
import { getSupabaseEnv } from "@/lib/env";

const { url, anon } = getSupabaseEnv();

export const supabaseBrowser = url && anon ? createClient(url, anon) : null;
>>>>>>> theirs
=======
import { getSupabaseEnv } from "@/lib/env";

const { url, anon } = getSupabaseEnv();

export const supabaseBrowser = url && anon ? createClient(url, anon) : null;
>>>>>>> theirs
