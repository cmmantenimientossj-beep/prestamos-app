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
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Permitir el acceso libre a la pantalla de login sin auto-redirecciones al panel
    if (isAuthPage) {
      return null;
    }

    // Redirección si visitamos rutas protegidas sin logueo
    if (!isAuth) {
      return NextResponse.redirect(new URL(`/login`, req.url));
    }

    // Aislamiento: El Cobrador (PWA Mobile) NO tiene acceso a /admin
    if (isAdminRoute && token.role !== "ADMIN" && token.role !== "ADMIN_VIEWER") {
      return NextResponse.redirect(new URL('/mis-rutas', req.url));
    }

    // Bloqueo estricto de Modificaciones para ADMIN_VIEWER
    // Todas las Server Actions y mutate endpoints utilizan método POST o DELETE
    if (token.role === "ADMIN_VIEWER" && (req.method === "POST" || req.method === "DELETE" || req.method === "PUT" || req.method === "PATCH")) {
      return new NextResponse("Acceso Denegado: Modo Sólo Lectura", { status: 403 });
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
    "/login",
    "/admin/:path*", 
    "/mis-rutas/:path*", 
    "/historial/:path*",
    "/nuevo-prestamo/:path*", 
    "/resumen/:path*"
  ]
}
