import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isRoot = req.nextUrl.pathname === '/';

    if (isRoot) {
      if (isAuth) {
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/mis-rutas', req.url));
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Si ya estamos autenticados y tratamos de ir a loguear, reedirijimos al panel correcto.
    if (isAuthPage) {
      if (isAuth) {
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/mis-rutas', req.url));
      }
      return null;
    }

    // Redirección si visitamos rutas protegidas sin logueo
    if (!isAuth) {
      return NextResponse.redirect(new URL(`/login`, req.url));
    }

    // Aislamiento: El Cobrador (PWA Mobile) NO tiene acceso a /admin
    if (isAdminRoute && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL('/mis-rutas', req.url));
    }
    
  },
  {
    callbacks: {
      async authorized() {
        // Return true lets the middleware explicitly handle everything without next-auth failing fast.
        return true;
      },
    },
  }
)

export const config = {
  matcher: [
    "/",
    "/admin/:path*", 
    "/mis-rutas/:path*", 
    "/nuevo-prestamo/:path*", 
    "/resumen/:path*"
  ]
}
