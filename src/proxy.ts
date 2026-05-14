import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie.value)
      const dest = user.role === 'coordenador' ? '/dashboard/coordenador' : '/dashboard/novo'
      return NextResponse.redirect(new URL(dest, request.url))
    } catch {
      // Invalid cookie — allow login
    }
  }

  if (pathname.startsWith('/dashboard/coordenador') && sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie.value)
      if (user.role !== 'coordenador') {
        return NextResponse.redirect(new URL('/dashboard/novo', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
