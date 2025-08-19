import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // atenção: service role key só no servidor
    { cookies: { get: (name) => req.cookies.get(name)?.value } }
  );

  // 1. Recupera sessão
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl;

  if (!user && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (user) {
    // 2. Busca profile do usuário logado
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_admin")
      .eq("id", user.id) // ou .eq("user_id", user.id) dependendo do modelo
      .single();

    // 3. Protege rota admin
    if (url.pathname.startsWith("/dashboard/admin")) {
      if (!profile?.is_admin && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard/admin/:path*"],
};
