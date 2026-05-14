import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const { data: user, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user || user.password_hash !== password) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role }

  const response = NextResponse.json({ success: true, user: session })
  response.cookies.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
