import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export const ADMIN_ROLES = ["admin", "coordenacao", "secretaria"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type UserRole = AdminRole | "docente";

type ApiAuthOptions = {
  roles?: readonly AdminRole[];
  allowInternalSecret?: boolean;
};

type ApiAuthSuccess = {
  ok: true;
  role: UserRole | "internal";
  userId: string | null;
  internal: boolean;
};

type ApiAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

function getInternalSecret() {
  return process.env.UFOP_INTERNAL_API_SECRET ?? "";
}

function hasValidInternalSecret(request: Request) {
  const expected = getInternalSecret();
  if (!expected) return false;

  const headerSecret = request.headers.get("x-internal-secret") ?? "";
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerSecret = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  return headerSecret === expected || bearerSecret === expected;
}

export function forbidden(message = "Permissao insuficiente") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthorized(message = "Autenticacao obrigatoria") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireApiAuth(
  request: Request,
  options: ApiAuthOptions = {},
): Promise<ApiAuthResult> {
  if (options.allowInternalSecret && hasValidInternalSecret(request)) {
    return { ok: true, role: "internal", userId: null, internal: true };
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, response: unauthorized() };
  }

  if (!options.roles) {
    return { ok: true, role: "docente", userId: user.id, internal: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole | null }>();

  if (profileError) {
    return { ok: false, response: forbidden("Perfil administrativo nao configurado para este usuario") };
  }

  const role = profile?.role ?? "docente";
  if (options.roles && !options.roles.includes(role as AdminRole)) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, role, userId: user.id, internal: false };
}
