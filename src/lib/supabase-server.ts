import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client (Server Components / Route Handlers).
 * Lê a sessão dos cookies → RLS aplicada com o usuário autenticado.
 * Como usa next/headers cookies(), só funciona em contexto server —
 * é a guarda que garante que estes getters nunca rodem no client.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component — ignorável quando há middleware
            // refrescando a sessão.
          }
        },
      },
    },
  );
}
