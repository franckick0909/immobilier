import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  
  // Routes publiques
  const publicRoutes = ['/auth/login', '/auth/register']
  // Routes qui nécessitent une authentification
  const authRoutes = ['/dashboard', '/profile']
  // Routes admin
  const adminRoutes = ['/admin']
  
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirection si déjà connecté et essaie d'accéder aux pages d'auth
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirection si non connecté et essaie d'accéder aux routes protégées
  if (!isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Vérification des droits admin
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register'
  ]
}