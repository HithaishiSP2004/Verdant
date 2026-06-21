import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing logic between createServerClient and
  // getUser. A simple mistake can write guard loops causing stack overflows.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authentication gate redirects:
  // If no user exists and request is targeted to /sanctuary, redirect to login page.
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/sanctuary')
  ) {
    // Bypass authentication redirect if running in local sandbox mode or development
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('local-sandbox') ||
      process.env.NODE_ENV === 'development'
    ) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user is logged in but browsing landing, redirect to sanctuary.
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/sanctuary';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
