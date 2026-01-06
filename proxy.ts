import { type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "infested2026";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check for password protection
  const passwordCookie = req.cookies.get("app_password");
  const isPasswordPage = pathname === "/password";
  const isPasswordValid = passwordCookie?.value === ADMIN_PASSWORD;

  // If password page, allow access
  if (isPasswordPage) {
    const res = NextResponse.next({
      request: {
        headers: req.headers,
      },
    });
    return res;
  }

  // If no valid password, redirect to password page for all routes except /password
  if (!isPasswordValid) {
    return NextResponse.redirect(new URL("/password", req.url));
  }

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
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = pathname.startsWith("/auth");
  const isAppRoute = pathname.startsWith("/app");

  if (!user && isAppRoute) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|public|favicon.ico|api).*)", "/"],
};
