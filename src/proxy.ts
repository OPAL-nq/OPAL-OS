import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { createServerClient } from "@supabase/ssr";

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/forgot-password"];

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

  // 2. Public routes — allow access, redirect to dashboard if already logged in
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. API routes — let them through (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // 4. Protected routes — redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 5. Fetch user profile for role/plan checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let profile: any = null;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );

      const { data } = await supabase
        .from("profiles")
        .select("role, plan, status")
        .eq("id", user.id)
        .single();
      profile = data;
    } catch {
      profile = null;
    }
  }

  // 6. Admin route protection
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 7. Intensive route protection
  if (intensiveRoutes.some((route) => pathname.startsWith(route))) {
    if (!profile || (profile.plan !== "intensive" && profile.role !== "admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/intensive";
      return NextResponse.redirect(url);
    }
  }

  // 8. Check if account is active
  if (profile && profile.status !== "active") {
    // Inactive users can only access login/signup
    if (
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/).*)",
  ],
};
