import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  const subdomain = hostname.split('.')[0]
  
  if (subdomain === 'localhost:3000' || !hostname.includes('.')) {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = process.env.NODE_ENV === 'development' ? 'localhost:3000' : process.env.NEXT_PUBLIC_HOST
    return NextResponse.redirect(new URL(`${protocol}://utah.${host}${url.pathname}`))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-subdomain', subdomain)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 