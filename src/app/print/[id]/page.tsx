import { cache } from 'react'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import BudgetPrintLayout from '@/components/BudgetPrintLayout'
import AutoPrint from '@/components/AutoPrint'

type BudgetRow = Awaited<ReturnType<typeof getBudget>>

const getBudget = cache(async (id: string) => {
  const { data } = await supabase.from('budgets').select('*').eq('id', id).single()
  return data
})

function buildTitle(data: NonNullable<BudgetRow>): string {
  const d = data.details ?? {}
  const mainLiters = d.mainLiters ?? data.litros
  const extraItems: Array<{ liters: number; styleName?: string }> = d.extraItems ?? []
  const litersLabel = [
    `${mainLiters}L ${data.estilo}`,
    ...extraItems.map((item: { liters: number; styleName?: string }) => `${item.liters}L ${item.styleName ?? data.estilo}`),
  ].join(' + ')
  return `${data.cliente}_${litersLabel}`
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getBudget(id)
  if (!data) return { title: 'Orçamento' }
  return { title: buildTitle(data) }
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getBudget(id)

  if (!data) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#6c2d01' }}>
        Orçamento não encontrado.
      </div>
    )
  }

  const d = data.details ?? {}

  return (
    <>
      <AutoPrint />
      <BudgetPrintLayout
        budgetId={data.id}
        clientName={data.cliente}
        clientPhone={data.cliente_phone ?? ''}
        addressLine={d.addressLine ?? null}
        styleName={data.estilo}
        liters={d.mainLiters ?? data.litros}
        grandTotal={Number(data.total)}
        pricePerLiter={d.pricePerLiter}
        finalPrice={d.finalPrice}
        freightValor={d.freightValor}
        freightIsento={d.freightIsento}
        discount={d.discount}
        discountAmount={d.discountAmount}
        deliveryDate={d.deliveryDate ?? undefined}
        validUntil={d.validUntil ?? undefined}
        observations={d.observations ?? undefined}
        chopperNote={d.chopperNote ?? null}
        extraItems={d.extraItems ?? []}
      />
    </>
  )
}
