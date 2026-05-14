'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { CHOPP_STYLES, type ChoppStyle, type Store } from '@/lib/mockData'
import { calcularFrete, calcularTaxaChopeira, formatCurrency, type FreightResult } from '@/lib/freight'
import ConfirmationView from '@/components/ConfirmationView'
import StyledSelect from '@/components/StyledSelect'
import DatePicker from '@/components/DatePicker'

interface InitialData {
  originalId?: string
  clientName: string
  clientPhone: string
  clientCep: string
  styleName: string
  mainLiters: number
  pricePerLiter: number
  discount: number
  observations: string
  validUntil: string
  deliveryDate: string
  paymentMethod: string
  installments: number
  extraBarrels: Array<{ liters: number; styleId: string }>
}

interface BudgetFormProps {
  user: { name: string; email: string; role: string } | null
  initialData?: InitialData | null
}

interface CepResult {
  nearestStore: Store & { distanciaKm: number }
  allStores: Array<Store & { distanciaKm: number }>
  address: { logradouro: string; bairro: string; localidade: string; uf: string }
}

function generateBudgetId() {
  const now = new Date()
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `ORC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${rand}`
}

const CIRCLE_COLORS: Record<string, string> = {
  pilsen: '#DDBB52',
  escura: '#6C2D01',
  black: '#1A0F00',
  vinho: '#7A4E8B',
  'puro-malte': '#30552E',
  'slow-beer': '#E8943A',
  'amber-lager': '#D4783A',
  ipa: '#5A8F3C',
}

const STYLE_ORDER = ['pilsen', 'escura', 'vinho', 'puro-malte', 'black', 'ipa', 'amber-lager', 'slow-beer']

const LITER_OPTIONS = [
  { value: '10', label: '10L' },
  { value: '15', label: '15L' },
  { value: '20', label: '20L' },
  { value: '30', label: '30L' },
  { value: '50', label: '50L' },
]

const PAYMENT_OPTIONS = [
  { value: 'pix',     label: 'PIX' },
  { value: 'debito',  label: 'Cartão de Débito' },
  { value: 'credito', label: 'Cartão de Crédito' },
]

const INSTALLMENT_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}x sem juros`,
}))

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative mt-12">
      <div
        className="absolute -top-[18px] left-0 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: 'var(--marrom)' }}
      >
        <span className="text-2xl leading-none" style={{ color: 'var(--bege)', fontFamily: 'var(--font-display)' }}>
          {number}
        </span>
      </div>
      <div className="rounded-[24px] px-6 pt-10 pb-8" style={{ backgroundColor: 'var(--bege-claro)' }}>
        <h2 className="text-[28px] leading-9 mb-6" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] font-medium leading-[26px] mb-2" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
      {children}
    </p>
  )
}

function FieldInput({
  value, onChange, placeholder, type = 'text', readOnly = false, maxLength,
}: {
  value: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  maxLength?: number
}) {
  return (
    <div
      className="flex items-center rounded-[8px] border px-4 py-3"
      style={{ borderColor: 'var(--bege-2)', backgroundColor: readOnly ? 'rgba(143,123,101,0.1)' : 'transparent' }}
    >
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-transparent outline-none text-[14px] leading-[22px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        style={{ color: value ? 'var(--marrom)' : 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
      />
    </div>
  )
}

// ── BudgetForm ────────────────────────────────────────────────────────────────

export default function BudgetForm({ user, initialData }: BudgetFormProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null)

  const [choppStyles, setChoppStyles] = useState<ChoppStyle[]>(CHOPP_STYLES)

  // Block 1
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Block 2
  const [selectedStyle, setSelectedStyle] = useState<ChoppStyle | null>(null)
  const [liters, setLiters] = useState<number | ''>('')
  const [extraBarrels, setExtraBarrels] = useState<Array<{ liters: number; styleId: string }>>([])
  const [validUntil, setValidUntil] = useState('')

  // Block 3
  const [clientCep, setClientCep] = useState('')
  const [cepResult, setCepResult] = useState<CepResult | null>(null)
  const [selectedStore, setSelectedStore] = useState<(Store & { distanciaKm: number }) | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [showStoreSelector, setShowStoreSelector] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')

  // Block 4
  const [pricePerLiter, setPricePerLiter] = useState<number | ''>('')
  const [extraStylePrices, setExtraStylePrices] = useState<Record<string, number | ''>>({})
  const [freightInput, setFreightInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'debito' | 'credito' | ''>('')
  const [installments, setInstallments] = useState(1)
  const [discount, setDiscount] = useState<number | ''>(0)

  // Block 5
  const [observations, setObservations] = useState('')

  // Confirmation / submission
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [budgetId, setBudgetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [successBudgetId, setSuccessBudgetId] = useState<string | null>(null)
  const [showPdfSuccess, setShowPdfSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/sheets')
      .then(r => r.json())
      .then(data => { if (data.styles?.length) setChoppStyles(data.styles) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!initialData) return
    setClientName(initialData.clientName)
    setClientPhone(initialData.clientPhone)
    setClientCep(initialData.clientCep)
    const style = CHOPP_STYLES.find(s => s.name === initialData.styleName)
    if (style) setSelectedStyle(style)
    setLiters(initialData.mainLiters)
    setPricePerLiter(initialData.pricePerLiter)
    setDiscount(initialData.discount)
    setObservations(initialData.observations)
    setValidUntil(initialData.validUntil)
    setDeliveryDate(initialData.deliveryDate)
    setPaymentMethod(initialData.paymentMethod as 'pix' | 'debito' | 'credito' | '')
    setInstallments(initialData.installments)
    setExtraBarrels(initialData.extraBarrels)
  }, [initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollRight(el.scrollWidth > el.clientWidth)
  }, [choppStyles])

  useEffect(() => {
    if (!selectedStyle) { setPricePerLiter(''); return }
    const qty = typeof liters === 'number' ? liters : 0
    setPricePerLiter(qty >= 30 ? selectedStyle.priceAbove30 : selectedStyle.priceBelow30)
  }, [selectedStyle, liters])

  useEffect(() => {
    setExtraStylePrices(prev => {
      const next: Record<string, number | ''> = {}
      for (const b of extraBarrels) {
        if (!b.styleId || b.styleId === selectedStyle?.id) continue
        if (prev[b.styleId] !== undefined) { next[b.styleId] = prev[b.styleId]; continue }
        const style = choppStyles.find(s => s.id === b.styleId)
        if (style) next[b.styleId] = b.liters >= 30 ? style.priceAbove30 : style.priceBelow30
      }
      return next
    })
  }, [extraBarrels, selectedStyle?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const litersNum = typeof liters === 'number' ? liters : 0
  const priceNum = typeof pricePerLiter === 'number' ? pricePerLiter : 0
  const discountNum = typeof discount === 'number' ? discount : 0
  const finalPrice = priceNum * (1 - discountNum / 100)

  const extraSubTotal = extraBarrels.reduce((sum, b) => {
    if (b.liters === 0) return sum
    const style = b.styleId ? choppStyles.find(s => s.id === b.styleId) : selectedStyle
    if (!style) return sum
    if (b.styleId === selectedStyle?.id) return sum + b.liters * finalPrice
    const tablePrice = b.liters >= 30 ? style.priceAbove30 : style.priceBelow30
    const p = typeof extraStylePrices[b.styleId] === 'number' ? extraStylePrices[b.styleId] as number : tablePrice
    return sum + b.liters * p * (1 - discountNum / 100)
  }, 0)

  const extraSubTotalNoDiscount = extraBarrels.reduce((sum, b) => {
    if (b.liters === 0) return sum
    const style = b.styleId ? choppStyles.find(s => s.id === b.styleId) : selectedStyle
    if (!style) return sum
    if (b.styleId === selectedStyle?.id) return sum + b.liters * priceNum
    const tablePrice = b.liters >= 30 ? style.priceAbove30 : style.priceBelow30
    const p = typeof extraStylePrices[b.styleId] === 'number' ? extraStylePrices[b.styleId] as number : tablePrice
    return sum + b.liters * p
  }, 0)

  const totalAllLiters = litersNum + extraBarrels.reduce((s, b) => s + b.liters, 0)
  const subTotal = litersNum * finalPrice + extraSubTotal
  const chopperFee = totalAllLiters > 0 ? calcularTaxaChopeira('eletrica', totalAllLiters) : 0

  const freightResult: FreightResult | null = selectedStore && totalAllLiters > 0
    ? calcularFrete(selectedStore.distanciaKm, totalAllLiters, selectedStore.region)
    : null

  useEffect(() => {
    if (freightResult) {
      setFreightInput(freightResult.isento ? '0' : freightResult.valor.toFixed(2).replace('.', ','))
    } else {
      setFreightInput('')
    }
  }, [freightResult?.valor, freightResult?.isento]) // eslint-disable-line react-hooks/exhaustive-deps

  const freightValue = freightInput !== '' ? parseFloat(freightInput.replace(',', '.')) || 0 : 0
  const grandTotal = subTotal + chopperFee + freightValue
  const discountWarning = discountNum > 0 ? 'Qualquer desconto requer aprovação da Supervisão de Televendas' : ''
  const canSubmit = !!clientName && !!selectedStyle && litersNum > 0 && !!selectedStore

  const isDecember = new Date().getMonth() === 11
  const chopperNote = totalAllLiters > 0
    ? chopperFee > 0 || isDecember
      ? 'Taxa de chopeira elétrica: R$ 60,00'
      : 'Taxa de chopeira elétrica: isenta'
    : null

  const paymentLabel = paymentMethod === 'pix' ? 'PIX'
    : paymentMethod === 'debito' ? 'Cartão de Débito'
    : paymentMethod === 'credito' ? `Cartão de Crédito — ${installments}x sem juros`
    : ''

  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`/api/cep?cep=${clean}`)
      const data = await res.json()
      if (!res.ok) {
        setCepError(res.status === 503
          ? 'Carregando lojas... Aguarde alguns segundos e tente novamente.'
          : data.error ?? 'Erro ao consultar CEP. Tente novamente.')
        return
      }
      setCepResult(data)
      setSelectedStore(data.nearestStore)
    } catch {
      setCepError('Erro ao consultar CEP. Tente novamente.')
    } finally {
      setCepLoading(false)
    }
  }, [])

  useEffect(() => {
    if (clientCep.replace(/\D/g, '').length === 8) {
      lookupCep(clientCep)
    } else {
      setCepResult(null); setSelectedStore(null); setCepError('')
    }
  }, [clientCep, lookupCep])

  function handleCarouselScroll() {
    if (isScrollingRef.current) return
    const el = carouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  async function handleAvançar() {
    if (!canSubmit) return
    const isEditing = !!initialData?.originalId
    const id = isEditing ? initialData!.originalId! : generateBudgetId()
    setBudgetId(id)
    setShowConfirmation(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const address = cepResult?.address
    const discountAmount = discountNum > 0 ? (litersNum * priceNum + extraSubTotalNoDiscount) * (discountNum / 100) : 0

    await fetch(isEditing ? `/api/budgets/${id}` : '/api/budgets', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        createdAt: new Date().toISOString(),
        vendedor: user?.name ?? '',
        vendedorEmail: user?.email ?? '',
        cliente: clientName,
        clientePhone: clientPhone,
        estilo: selectedStyle?.name ?? '',
        litros: totalAllLiters,
        total: grandTotal,
        details: {
          addressLine: address ? `${address.logradouro}, ${address.bairro} — ${address.localidade}/${address.uf}` : null,
          validUntil: validUntil || null,
          freightValor: freightResult?.valor,
          freightIsento: freightResult?.isento,
          pricePerLiter: priceNum,
          finalPrice,
          discount: discountNum,
          discountAmount,
          deliveryDate: deliveryDate || null,
          observations: observations || null,
          chopperNote,
          extraItems: extraBarrels.map(b => {
            const style = b.styleId ? choppStyles.find(s => s.id === b.styleId) : selectedStyle
            const tablePrice = style ? (b.liters >= 30 ? style.priceAbove30 : style.priceBelow30) : 0
            const unitPrice = (b.styleId === selectedStyle?.id)
              ? priceNum
              : (typeof extraStylePrices[b.styleId] === 'number' ? extraStylePrices[b.styleId] as number : tablePrice)
            return { liters: b.liters, unitPrice, styleName: style?.name ?? '' }
          }),
          clientCep,
          mainLiters: litersNum,
          paymentMethod,
          installments,
        },
      }),
    })
  }

  function handleBack() {
    setShowConfirmation(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSuccessBudgetId(generateBudgetId())
    setIsSubmitting(false)
  }

  function handleReset() {
    setClientName(''); setClientPhone(''); setClientCep('')
    setCepResult(null); setSelectedStore(null); setCepError('')
    setSelectedStyle(null); setLiters(''); setPricePerLiter('')
    setExtraBarrels([]); setExtraStylePrices({})
    setDiscount(0); setObservations(''); setSuccessBudgetId(null)
    setValidUntil(''); setDeliveryDate(''); setPaymentMethod('')
    setInstallments(1); setFreightInput('')
    setShowConfirmation(false); setBudgetId(null)
    setShowPdfSuccess(false)
  }

  if (showPdfSuccess && budgetId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-7 py-12">
        <div className="rounded-[24px] p-10 text-center max-w-md w-full" style={{ backgroundColor: 'var(--bege-claro)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--laranja)' }}>
            <span className="text-3xl font-bold" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}>✓</span>
          </div>
          <h2 className="text-[28px] leading-9 mb-2"
            style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-display)' }}>
            Orçamento processado!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
            Orçamento{' '}
            <span className="font-mono font-medium" style={{ color: 'var(--marrom)' }}>{budgetId}</span>{' '}
            gerado com sucesso.
          </p>
          <button
            onClick={handleReset}
            className="btn-laranja w-full rounded-[12px] py-3 text-[16px] font-medium transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
          >
            + Criar novo orçamento
          </button>
        </div>
      </div>
    )
  }

  if (showConfirmation && budgetId && selectedStyle && selectedStore) {
    return (
      <ConfirmationView
        budgetId={budgetId}
        clientName={clientName}
        clientPhone={clientPhone}
        selectedStyle={selectedStyle}
        liters={litersNum}
        validUntil={validUntil}
        clientCep={clientCep}
        selectedStore={selectedStore}
        address={cepResult?.address ?? null}
        freightResult={freightResult}
        deliveryDate={deliveryDate}
        pricePerLiter={priceNum}
        paymentMethod={paymentLabel}
        discount={discountNum}
        discountAmount={discountNum > 0 ? (litersNum * priceNum + extraSubTotalNoDiscount) * (discountNum / 100) : 0}
        extraBarrels={extraBarrels}
        observations={observations}
        chopperNote={chopperNote}
        grandTotal={grandTotal}
        finalPrice={finalPrice}
        onBack={handleBack}
        onGeneratePdf={() => {
          const litersLabel = [
            `${litersNum}L ${selectedStyle.name}`,
            ...extraBarrels.map(b => {
              const style = CHOPP_STYLES.find(s => s.id === b.styleId) ?? selectedStyle
              return `${b.liters}L ${style.name}`
            }),
          ].join(' + ')
          const prevTitle = document.title
          document.title = `${clientName}_${litersLabel}`
          window.print()
          document.title = prevTitle
          setShowPdfSuccess(true)
        }}
      />
    )
  }

  if (successBudgetId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-7 py-12">
        <div className="rounded-[24px] p-10 text-center max-w-md w-full" style={{ backgroundColor: 'var(--bege-claro)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--laranja)' }}>
            <span className="text-3xl font-bold" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}>✓</span>
          </div>
          <h2 className="text-[28px] leading-9 mb-2" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-display)' }}>
            Orçamento gerado!
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Número do orçamento:</p>
          <p className="text-[24px] font-bold mb-6" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}>
            {successBudgetId}
          </p>
          <div className="rounded-[12px] p-4 text-sm text-left space-y-2 mb-6" style={{ backgroundColor: 'var(--bege-3)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--bege-2)' }}>Cliente</span>
              <span className="font-medium" style={{ color: 'var(--marrom)' }}>{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--bege-2)' }}>Estilo</span>
              <span className="font-medium" style={{ color: 'var(--marrom)' }}>{selectedStyle?.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--bege-2)' }}>Quantidade</span>
              <span className="font-medium" style={{ color: 'var(--marrom)' }}>{totalAllLiters} litros</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-1" style={{ borderColor: 'var(--bege-2)' }}>
              <span className="font-semibold" style={{ color: 'var(--marrom)' }}>Total</span>
              <span className="font-bold" style={{ color: 'var(--vermelho)' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="btn-laranja w-full rounded-[12px] py-2.5 text-[16px] font-medium transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
          >
            Novo Orçamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-7 pt-[72px] pb-8">
        <div className="mb-8">
          <h1 className="text-[36px] leading-[56px]" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-display)' }}>
            Novo Orçamento
          </h1>
          <p className="text-[16px] leading-[26px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
            Preencha os dados abaixo para gerar um orçamento
          </p>
        </div>

        {/* BLOCO 1 — Dados do cliente */}
        <SectionCard number="1" title="Dados do cliente">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <FieldLabel>Nome do cliente</FieldLabel>
              <FieldInput
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <FieldInput
                value={clientPhone}
                onChange={e => setClientPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </SectionCard>

        {/* BLOCO 2 — Produto */}
        <SectionCard number="2" title="Produto">
          {/* Beer style carousel */}
          <div className="mb-6">
            <FieldLabel>Estilo de chopp</FieldLabel>
            <div className="flex items-center gap-2 overflow-hidden">
              {canScrollLeft && (
                <button
                  onClick={() => {
                    const el = carouselRef.current
                    if (!el) return
                    isScrollingRef.current = true
                    setCanScrollLeft(false)
                    setCanScrollRight(el.scrollWidth > el.clientWidth)
                    el.scrollTo({ left: 0, behavior: 'smooth' })
                    setTimeout(() => { isScrollingRef.current = false }, 600)
                  }}
                  className="btn-seta flex-shrink-0 w-[37px] h-[37px] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)' }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" style={{ transform: 'rotate(180deg)' }}>
                    <path d="M15.8045 7.49522L9.80468 13.7949C9.67959 13.9262 9.50993 14 9.33303 14C9.15612 14 8.98647 13.9262 8.86138 13.7949C8.73629 13.6635 8.66601 13.4854 8.66601 13.2996C8.66601 13.1139 8.73629 12.9358 8.86138 12.8044L13.7237 7.69996H0.666645C0.48984 7.69996 0.320276 7.62622 0.195256 7.49495C0.0702357 7.36368 0 7.18564 0 7C0 6.81436 0.0702357 6.63632 0.195256 6.50505C0.320276 6.37378 0.48984 6.30004 0.666645 6.30004H13.7237L8.86138 1.19557C8.73629 1.06423 8.66601 0.886095 8.66601 0.70035C8.66601 0.514606 8.73629 0.336469 8.86138 0.205128C8.98647 0.0737866 9.15612 0 9.33303 0C9.50993 0 9.67959 0.0737866 9.80468 0.205128L15.8045 6.50478C15.8665 6.56978 15.9156 6.64698 15.9492 6.73196C15.9827 6.81693 16 6.90801 16 7C16 7.09198 15.9827 7.18307 15.9492 7.26804C15.9156 7.35302 15.8665 7.43021 15.8045 7.49522Z" fill="currentColor"/>
                  </svg>
                </button>
              )}
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex gap-4 overflow-x-auto pb-2 pr-1 flex-1 min-w-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' } as React.CSSProperties}
              >
                {[...choppStyles]
                  .sort((a, b) => {
                    const ai = STYLE_ORDER.indexOf(a.id), bi = STYLE_ORDER.indexOf(b.id)
                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
                  })
                  .map(style => {
                    const isSelected = selectedStyle?.id === style.id
                    const isHovered = hoveredStyle === style.id
                    return (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(isSelected ? null : style)}
                        onMouseEnter={() => setHoveredStyle(style.id)}
                        onMouseLeave={() => setHoveredStyle(null)}
                        className="flex-none w-[194px] h-[127px] rounded-[12px] border transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                        style={{
                          borderColor: 'var(--bege-2)',
                          backgroundColor: (isSelected || isHovered) ? 'rgba(108,45,1,0.06)' : 'transparent',
                          boxShadow: 'none',
                        }}
                      >
                        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: CIRCLE_COLORS[style.id] ?? style.colorHex }} />
                        <p className="text-[16px] leading-[26px] text-center px-2" style={{
                          color: isSelected ? 'var(--marrom)' : 'var(--bege-2)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: '500',
                        }}>
                          {style.name.replace('Germânia ', '')}
                        </p>
                      </button>
                    )
                  })}
              </div>
              {canScrollRight && (
                <button
                  onClick={() => {
                    const el = carouselRef.current
                    if (!el) return
                    isScrollingRef.current = true
                    setCanScrollRight(false)
                    setCanScrollLeft(true)
                    el.scrollTo({ left: 99999, behavior: 'smooth' })
                    setTimeout(() => { isScrollingRef.current = false }, 600)
                  }}
                  className="btn-seta flex-shrink-0 w-[37px] h-[37px] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)' }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <path d="M15.8045 7.49522L9.80468 13.7949C9.67959 13.9262 9.50993 14 9.33303 14C9.15612 14 8.98647 13.9262 8.86138 13.7949C8.73629 13.6635 8.66601 13.4854 8.66601 13.2996C8.66601 13.1139 8.73629 12.9358 8.86138 12.8044L13.7237 7.69996H0.666645C0.48984 7.69996 0.320276 7.62622 0.195256 7.49495C0.0702357 7.36368 0 7.18564 0 7C0 6.81436 0.0702357 6.63632 0.195256 6.50505C0.320276 6.37378 0.48984 6.30004 0.666645 6.30004H13.7237L8.86138 1.19557C8.73629 1.06423 8.66601 0.886095 8.66601 0.70035C8.66601 0.514606 8.73629 0.336469 8.86138 0.205128C8.98647 0.0737866 9.15612 0 9.33303 0C9.50993 0 9.67959 0.0737866 9.80468 0.205128L15.8045 6.50478C15.8665 6.56978 15.9156 6.64698 15.9492 6.73196C15.9827 6.81693 16 6.90801 16 7C16 7.09198 15.9827 7.18307 15.9492 7.26804C15.9156 7.35302 15.8665 7.43021 15.8045 7.49522Z" fill="currentColor"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <FieldLabel>Litros</FieldLabel>
              <StyledSelect
                value={String(liters)}
                onChange={v => setLiters(v === '' ? '' : Number(v))}
                options={LITER_OPTIONS}
              />
            </div>
            <div>
              <FieldLabel>Validade do orçamento</FieldLabel>
              <DatePicker value={validUntil} onChange={setValidUntil} />
            </div>
          </div>

          {/* Extra barrels */}
          {liters !== '' && selectedStyle && (
            <div className="mt-4">
              {extraBarrels.map((barrel, i) => {
                const barrelStyle = barrel.styleId ? choppStyles.find(s => s.id === barrel.styleId) : null
                const barrelPrice = barrelStyle
                  ? (barrel.liters >= 30 ? barrelStyle.priceAbove30 : barrelStyle.priceBelow30)
                  : null
                return (
                  <div key={i} className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                      <StyledSelect
                        value={barrel.styleId}
                        onChange={v => {
                          const updated = [...extraBarrels]
                          updated[i] = { ...updated[i], styleId: v }
                          setExtraBarrels(updated)
                        }}
                        options={[...choppStyles]
                          .sort((a, b) => {
                            const ai = STYLE_ORDER.indexOf(a.id), bi = STYLE_ORDER.indexOf(b.id)
                            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
                          })
                          .map(s => ({ value: s.id, label: s.name.replace('Germânia ', '') }))}
                        placeholder="Estilo"
                      />
                    </div>
                    <div className="flex-1">
                      <StyledSelect
                        value={barrel.liters ? String(barrel.liters) : ''}
                        onChange={v => {
                          const updated = [...extraBarrels]
                          updated[i] = { ...updated[i], liters: Number(v) }
                          setExtraBarrels(updated)
                        }}
                        options={LITER_OPTIONS}
                        placeholder="Litros"
                      />
                    </div>
                    {barrel.liters > 0 && barrelPrice != null && (
                      <p className="text-[13px] flex-shrink-0" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                        R$ {barrelPrice.toFixed(2).replace('.', ',')}/L
                      </p>
                    )}
                    <button
                      onClick={() => setExtraBarrels(extraBarrels.filter((_, j) => j !== i))}
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[14px] cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: 'rgba(108,45,1,0.12)', color: 'var(--marrom)' }}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
              <button
                onClick={() => setExtraBarrels([...extraBarrels, { liters: 0, styleId: '' }])}
                className="mt-3 flex items-center gap-2 text-[14px] font-medium hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[16px]" style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)' }}>
                  +
                </span>
                Adicionar outro barril
              </button>
            </div>
          )}
        </SectionCard>

        {/* BLOCO 3 — Precificação */}
        <SectionCard number="3" title="Precificação">
          {(() => {
            const uniqueExtraStyleIds = [...new Set(
              extraBarrels.filter(b => b.styleId && b.styleId !== selectedStyle?.id).map(b => b.styleId)
            )]
            const hasExtraStyles = uniqueExtraStyleIds.length > 0
            return (
              <>
                {hasExtraStyles ? (
                  <>
                    <div className={`grid ${uniqueExtraStyleIds.length >= 2 ? 'grid-cols-3' : 'grid-cols-2'} gap-6 mb-6`}>
                      <div>
                        <FieldLabel>Preço por litro{selectedStyle ? ` — ${selectedStyle.name.replace('Germânia ', '')}` : ''} (R$)</FieldLabel>
                        <FieldInput
                          type="number"
                          value={pricePerLiter}
                          onChange={e => setPricePerLiter(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="0,00"
                        />
                      </div>
                      {uniqueExtraStyleIds.map(styleId => {
                        const s = choppStyles.find(st => st.id === styleId)
                        return (
                          <div key={styleId}>
                            <FieldLabel>Preço por litro — {s?.name.replace('Germânia ', '') ?? styleId} (R$)</FieldLabel>
                            <FieldInput
                              type="number"
                              value={extraStylePrices[styleId] ?? ''}
                              onChange={e => setExtraStylePrices(prev => ({ ...prev, [styleId]: e.target.value === '' ? '' : Number(e.target.value) }))}
                              placeholder="0,00"
                            />
                          </div>
                        )
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <FieldLabel>Forma de pagamento</FieldLabel>
                        <StyledSelect
                          value={paymentMethod}
                          onChange={v => { setPaymentMethod(v as typeof paymentMethod); setInstallments(1) }}
                          options={PAYMENT_OPTIONS}
                        />
                      </div>
                      <div>
                        <FieldLabel>Desconto (%)</FieldLabel>
                        <FieldInput
                          type="number"
                          value={discount}
                          onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <FieldLabel>Preço por litro (R$)</FieldLabel>
                      <FieldInput
                        type="number"
                        value={pricePerLiter}
                        onChange={e => setPricePerLiter(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <FieldLabel>Forma de pagamento</FieldLabel>
                      <StyledSelect
                        value={paymentMethod}
                        onChange={v => { setPaymentMethod(v as typeof paymentMethod); setInstallments(1) }}
                        options={PAYMENT_OPTIONS}
                      />
                    </div>
                    <div>
                      <FieldLabel>Desconto (%)</FieldLabel>
                      <FieldInput
                        type="number"
                        value={discount}
                        onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {paymentMethod === 'credito' && (
            <div className="mb-6">
              <FieldLabel>Parcelamento</FieldLabel>
              <StyledSelect
                value={String(installments)}
                onChange={v => setInstallments(Number(v))}
                options={INSTALLMENT_OPTIONS}
                placeholder=""
              />
            </div>
          )}

          {discountWarning && (
            <div
              className="flex items-start gap-3 rounded-[12px] px-4 py-3"
              style={{ backgroundColor: 'rgba(247,153,70,0.2)', border: '1px solid var(--laranja)' }}
            >
              <span style={{ color: 'var(--laranja)' }}>⚠</span>
              <p className="text-[14px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>{discountWarning}</p>
            </div>
          )}
        </SectionCard>

        {/* BLOCO 4 — Entrega */}
        <SectionCard number="4" title="Entrega">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <FieldLabel>CEP</FieldLabel>
              <div className="relative">
                <FieldInput
                  value={clientCep}
                  onChange={e => setClientCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {cepLoading && (
                  <div className="absolute right-4 top-3.5">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--bege-2)' }} />
                  </div>
                )}
              </div>
              {cepError && (
                <p className="text-xs mt-1" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-body)' }}>{cepError}</p>
              )}
            </div>
            <div>
              <FieldLabel>Frete (R$)</FieldLabel>
              <FieldInput
                value={freightInput}
                onChange={e => setFreightInput(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <FieldLabel>Data da entrega</FieldLabel>
              <DatePicker value={deliveryDate} onChange={setDeliveryDate} />
            </div>
          </div>

          {selectedStore && cepResult && (
            <div className="rounded-[16px] px-6 py-5" style={{ backgroundColor: 'var(--laranja)' }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-[16px] font-medium leading-[22px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                      {selectedStore.name}
                    </p>
                    <p className="text-[14px] leading-[22px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                      {selectedStore.distanciaKm} km de distância
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                        <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5C5.62 9.5 4.5 8.38 4.5 7S5.62 4.5 7 4.5 9.5 5.62 9.5 7 8.38 9.5 7 9.5z" fill="var(--marrom)"/>
                      </svg>
                      <p className="text-[14px] leading-[22px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                        {selectedStore.address} — {selectedStore.city}/{selectedStore.state}
                      </p>
                    </div>
                  </div>
                  {cepResult.address && (
                    <div style={{ borderLeft: '1px solid rgba(108,45,1,0.2)', paddingLeft: '1rem' }}>
                      <p className="text-[13px] font-medium leading-[20px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                        Endereço do cliente
                      </p>
                      <p className="text-[13px] leading-[20px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                        {[cepResult.address.logradouro, cepResult.address.bairro].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-[13px] leading-[20px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                        {cepResult.address.localidade}/{cepResult.address.uf}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowStoreSelector(!showStoreSelector)}
                  className="text-[14px] font-medium flex-shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
                >
                  {showStoreSelector ? 'Fechar ▲' : 'Trocar'}
                </button>
              </div>
              {showStoreSelector && (
                <div className="mt-4 pt-4 space-y-1" style={{ borderTop: '1px solid rgba(108,45,1,0.3)' }}>
                  {cepResult.allStores.map(store => (
                    <button
                      key={store.id}
                      onClick={() => { setSelectedStore(store); setShowStoreSelector(false) }}
                      className="w-full text-left px-4 py-2.5 rounded-[8px] text-[14px] cursor-pointer transition-colors"
                      style={{
                        backgroundColor: selectedStore.id === store.id ? 'rgba(108,45,1,0.15)' : 'transparent',
                        color: 'var(--marrom)',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(108,45,1,0.2)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = selectedStore.id === store.id ? 'rgba(108,45,1,0.15)' : 'transparent' }}
                    >
                      <span className="font-medium">{store.name}</span>
                      <span className="ml-2 opacity-70">{store.distanciaKm} km · {store.region}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* BLOCO 5 — Observações */}
        <SectionCard number="5" title="Observações">
          <div>
            {chopperNote && (
              <div
                className="rounded-[8px] px-4 py-3 mb-3 text-[13px] flex items-start gap-2"
                style={{ backgroundColor: 'rgba(143,123,101,0.12)', color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
              >
                <span className="mt-0.5 flex-shrink-0">ℹ</span>
                <span>{chopperNote}</span>
              </div>
            )}
            <FieldLabel>Informações adicionais</FieldLabel>
            <div className="rounded-[8px] border px-4 py-3" style={{ borderColor: 'var(--bege-2)' }}>
              <textarea
                value={observations}
                onChange={e => setObservations(e.target.value)}
                rows={6}
                className="obs-textarea w-full bg-transparent outline-none text-[14px] leading-[22px] resize-none"
                style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
                placeholder="Digite observações sobre o orçamento, condições especiais, prazos de entrega, etc"
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* RODAPÉ FIXO */}
      <div
        className="fixed bottom-0 left-[241px] right-0 px-7 py-4 flex items-center justify-between z-10"
        style={{ backgroundColor: 'var(--bege-claro)', borderTop: '1px solid var(--bege-3)' }}
      >
        <p className="text-[14px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
          *Este orçamento será automaticamente encaminhado para o RD Station
        </p>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[12px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
              Valor total
            </span>
            <span className="text-[24px] leading-none" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}>
              {litersNum > 0 && priceNum > 0 ? formatCurrency(grandTotal) : 'R$ 0,00'}
            </span>
          </div>
          <button
            onClick={handleAvançar}
            disabled={!canSubmit}
            className="btn-laranja flex items-center gap-3 rounded-[12px] px-6 py-2 text-[16px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
          >
            Avançar
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M15.8045 7.49522L9.80468 13.7949C9.67959 13.9262 9.50993 14 9.33303 14C9.15612 14 8.98647 13.9262 8.86138 13.7949C8.73629 13.6635 8.66601 13.4854 8.66601 13.2996C8.66601 13.1139 8.73629 12.9358 8.86138 12.8044L13.7237 7.69996H0.666645C0.48984 7.69996 0.320276 7.62622 0.195256 7.49495C0.0702357 7.36368 0 7.18564 0 7C0 6.81436 0.0702357 6.63632 0.195256 6.50505C0.320276 6.37378 0.48984 6.30004 0.666645 6.30004H13.7237L8.86138 1.19557C8.73629 1.06423 8.66601 0.886095 8.66601 0.70035C8.66601 0.514606 8.73629 0.336469 8.86138 0.205128C8.98647 0.0737866 9.15612 0 9.33303 0C9.50993 0 9.67959 0.0737866 9.80468 0.205128L15.8045 6.50478C15.8665 6.56978 15.9156 6.64698 15.9492 6.73196C15.9827 6.81693 16 6.90801 16 7C16 7.09198 15.9827 7.18307 15.9492 7.26804C15.9156 7.35302 15.8665 7.43021 15.8045 7.49522Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
