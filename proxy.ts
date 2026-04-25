import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_session'
const SESSION_VALUE = process.env.ADMIN_SECRET || 'tatara_admin_session_2026'

const protectedAdminRoutes = [
  '/admin/dashboard',
  '/admin/orders',
  '/admin/products',
  '/admin/stock',
]

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedAdminRoutes.some((route) => pathname.startsWith(route))

  if (isProtected) {
    const session = request.cookies.get(COOKIE_NAME)
    if (session?.value !== SESSION_VALUE) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
