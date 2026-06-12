import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Cria o cliente Supabase para o middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = serializeCookieHeader(name, value, options);
            request.headers.append("Cookie", cookieString);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza a sessão (refresh token se necessário) e obtém o usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas públicas — não exigem autenticação
  const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/signup/") ||
    pathname.startsWith("/forgot-password/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    // Arquivos estáticos
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname);

  // Usuário NÃO autenticado tentando acessar rota protegida
  if (!user && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Usuário autenticado tentando acessar login/signup — redireciona para dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
