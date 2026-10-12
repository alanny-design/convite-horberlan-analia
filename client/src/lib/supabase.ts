import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** false quando as variáveis VITE_SUPABASE_* não foram definidas no build */
export const isSupabaseConfigured = Boolean(url && key);

// Só o Storage é usado (sem login), então não há sessão para persistir
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, { auth: { persistSession: false } })
  : null;
