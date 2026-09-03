import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { createServerClient } from "@supabase/ssr";

// Auth routes — unauthenticated only (redirect to dashboard if already logged in)
const authRoutes = ["/login", "/signup", "/forgot-password"];

// Public routes — accessible by anyone without authentication
const publicRoutes = [
  "/",
  "/mentorat",
  "/checkout",
  "/manifest.webmanifest",
  "/manifest.json",
  "/.well-known/apple-developer-merchantid-domain-association",
];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Routes that require intensive plan
const intensiveRoutes = [
  "/intensive/coaching",
  "/intensive/follow-up",
  "/intensive/objectives",
  "/intensive/reports",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh the Supabase session (token refresh)
  const { user, supabaseResponse } = await updateSession(request);

  // 2. Root route: redirect logged-in members to dashboard, let visitors view the landing page
  if (pathname === "/") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. Auth routes — allow access, redirect to dashboard if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 4. Public routes (e.g. /checkout) — allow access for all visitors
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // 5. API routes — let them through (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // 6. Protected routes — redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 7. Role & plan verification ONLY for restricted routes (admin / intensive)
  // This avoids redundant database roundtrips on standard platform routes (dashboard, trading, etc.)
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isIntensiveRoute = intensiveRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute || isIntensiveRoute) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, plan, status")
          .eq("id", user.id)
          .single();

        if (isAdminRoute && (!profile || profile.role !== "admin")) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }

        if (isIntensiveRoute && (!profile || (profile.plan !== "intensive" && profile.role !== "admin"))) {
          const url = request.nextUrl.clone();
          url.pathname = "/intensive";
          return NextResponse.redirect(url);
        }
      } catch {
        // Fallback safely to non-blocking response
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|icons/|manifest|apple-touch-icon|\\.well-known).*)",
  ],
};
