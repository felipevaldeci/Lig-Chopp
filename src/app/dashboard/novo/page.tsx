import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import BudgetForm from '@/components/BudgetForm'

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null

  const { edit } = await searchParams
  let initialData = null

  if (edit) {
    const { data } = await supabase.from('budgets').select('*').eq('id', edit).single()
    if (data?.details) {
      const d = data.details
      initialData = {
        originalId: edit,
        clientName: data.cliente ?? '',
        clientPhone: data.cliente_phone ?? '',
        clientCep: d.clientCep ?? '',
        styleName: data.estilo ?? '',
        mainLiters: d.mainLiters ?? data.litros ?? 0,
        mainQuantity: d.mainQuantity ?? 1,
        pricePerLiter: d.pricePerLiter ?? 0,
        discount: d.discount ?? 0,
        observations: d.observations ?? '',
        validUntil: d.validUntil ?? '',
        deliveryDate: d.deliveryDate ?? '',
        paymentMethod: d.paymentMethod ?? '',
        installments: d.installments ?? 1,
        extraBarrels: (d.extraItems ?? []).map((b: { liters: number; styleId?: string; quantity?: number }) => ({
          liters: b.liters,
          styleId: b.styleId ?? '',
          quantity: b.quantity ?? 1,
        })),
        freightValor: d.freightValor ?? null,
        freightIsento: d.freightIsento ?? null,
        chopperIsento: d.chopperIsento ?? null,
        chopperFeeVal: d.chopperFee ?? null,
      }
    }
  }

  return <BudgetForm user={user} initialData={initialData} />
}
