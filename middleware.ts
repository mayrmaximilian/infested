import { type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");
  const isAppRoute = req.nextUrl.pathname.startsWith("/app");

  if (!session && isAppRoute) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};
