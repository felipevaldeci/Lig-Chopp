import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const budgets = data.map(b => ({
    id: b.id,
    createdAt: b.created_at,
    vendedor: b.vendedor,
    vendedorEmail: b.vendedor_email,
    cliente: b.cliente,
    clientePhone: b.cliente_phone ?? '',
    estilo: b.estilo,
    litros: b.litros,
    total: Number(b.total),
    rdStatus: b.rd_status ?? 'Pendente',
    details: b.details ?? null,
  }))

  return NextResponse.json(budgets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const year = new Date().getFullYear()
  const { data: existingIds } = await supabase
    .from('budgets')
    .select('id')
    .like('id', `ORC-${year}-%`)

  const seqs = (existingIds ?? [])
    .map((r: { id: string }) => r.id.split('-'))
    .filter((parts: string[]) => parts.length === 3)
    .map((parts: string[]) => parseInt(parts[2], 10))
    .filter((n: number) => !isNaN(n))

  const next = seqs.length > 0 ? Math.max(...seqs) + 1 : 1
  const id = `ORC-${year}-${String(next).padStart(3, '0')}`

  const { error } = await supabase.from('budgets').insert({
    id,
    created_at: body.createdAt,
    vendedor: body.vendedor,
    vendedor_email: body.vendedorEmail,
    cliente: body.cliente,
    cliente_phone: body.clientePhone ?? '',
    estilo: body.estilo,
    litros: body.litros,
    total: body.total,
    rd_status: 'Pendente',
    details: body.details ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id })
}
