import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (client components).
 * Persiste a sessão em cookies (via @supabase/ssr) para que os
 * Server Components / middleware consigam ler a sessão e a RLS
 * seja aplicada com o usuário real. Usado por: login, auth/confirm,
 * AppShell (signOut).
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
