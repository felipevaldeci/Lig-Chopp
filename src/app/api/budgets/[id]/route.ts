import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  const user = session ? JSON.parse(session.value) : null

  if (!user || user.role !== 'coordenador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { error } = await supabase.from('budgets').update({
    cliente: body.cliente,
    cliente_phone: body.clientePhone ?? '',
    estilo: body.estilo,
    litros: body.litros,
    total: body.total,
    details: { ...body.details, editedAt: new Date().toISOString() },
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
