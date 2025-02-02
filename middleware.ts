import { NextResponse } from 'next/server'

export function middleware() {
  const response = NextResponse.next()
  
  response.headers.set('Cache-Control', 'no-store, max-age=0')
  response.headers.set('x-middleware-cache', 'no-cache')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}