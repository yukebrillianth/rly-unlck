import { NextResponse } from "next/server";
import { withAuth } from "@/auth/edge";
import { getLocaleFromRequest, setLocaleCookie } from "@/lib/locale/server";

export const middleware = withAuth(async (req) => {
  const { nextUrl } = req;
  const newUrl = nextUrl.clone();
  const pathname = newUrl.pathname;

  // Hard bypass for all Next.js internal asset requests (defensive redundancy
  // even though the matcher should already exclude these). If we ever end up
  // here, return immediately so static file serving isn't disrupted.
  if (pathname.startsWith("/_next/")) {
    const res = NextResponse.next();
    res.headers.set("x-middleware-bypass", "true");
    return res;
  }

  const isLoggedIn = req.auth?.user?.email;
  // if the user is already logged in, don't let them access the login page
  if (/^\/(login)/.test(pathname) && isLoggedIn) {
    newUrl.pathname = "/";
    return NextResponse.redirect(newUrl);
  }

  const locale = getLocaleFromRequest(req);

  newUrl.pathname = `/${locale}${pathname}`;

  const res = NextResponse.rewrite(newUrl);

  setLocaleCookie(req, res, locale);

  res.headers.set("x-locale", locale);
  res.headers.set("x-pathname", pathname);
  res.headers.set("x-middleware-hit", "true");

  return res;
});

export const config = {
  // Exclude API routes, Next.js internal assets (any _next path), public static assets and files with extensions
  matcher: ["/((?!api|_next/|static|.*\\.).*)"],
};
