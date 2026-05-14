'use client'
import { CHOPP_STYLES, type ChoppStyle, type Store } from '@/lib/mockData'
import { type FreightResult, formatCurrency } from '@/lib/freight'
import DownloadIcon from '@/components/DownloadIcon'
import BudgetPrintLayout from '@/components/BudgetPrintLayout'

interface ConfirmationViewProps {
  budgetId: string
  clientName: string
  clientPhone: string
  selectedStyle: ChoppStyle
  liters: number
  validUntil: string
  clientCep: string
  selectedStore: Store & { distanciaKm: number }
  address: { logradouro: string; bairro: string; localidade: string; uf: string } | null
  freightResult: FreightResult | null
  freightValue: number
  freightInput: string
  deliveryDate: string
  pricePerLiter: number
  paymentMethod: string
  discount: number
  discountAmount: number
  extraBarrels: Array<{ liters: number; styleId: string }>
  observations: string
  chopperNote: string | null
  chopperFee?: number
  grandTotal: number
  finalPrice: number
  onBack: () => void
  onGeneratePdf: () => void
}

const CIRCLE_COLORS: Record<string, string> = {
  pilsen: '#DDBB52',
  escura: '#6C2D01',
  black: '#1A0F00',
  vinho: '#8B1C1C',
  'puro-malte': '#C87941',
  'slow-beer': '#E8943A',
  'amber-lager': '#D4783A',
  ipa: '#5A8F3C',
}

function formatDateBR(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

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

function ReadInput({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[16px] font-medium leading-[26px] mb-2" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
        {label}
      </p>
      <div
        className="flex items-center rounded-[8px] border px-4 py-3"
        style={{ borderColor: 'var(--bege-2)', backgroundColor: 'rgba(143,123,101,0.1)' }}
      >
        <span
          className="text-[14px] leading-[22px]"
          style={{ color: value ? 'var(--marrom)' : 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
        >
          {value || '—'}
        </span>
      </div>
    </div>
  )
}

export default function ConfirmationView({
  budgetId,
  clientName,
  clientPhone,
  selectedStyle,
  liters,
  validUntil,
  clientCep,
  selectedStore,
  address,
  freightResult,
  freightValue,
  freightInput,
  deliveryDate,
  pricePerLiter,
  paymentMethod,
  discount,
  discountAmount,
  extraBarrels,
  observations,
  chopperNote,
  chopperFee,
  grandTotal,
  finalPrice,
  onBack,
  onGeneratePdf,
}: ConfirmationViewProps) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const discountNum = discount ?? 0

  return (
    <>
      {/* ── LAYOUT DE IMPRESSÃO — só aparece ao imprimir ── */}
      <div className="print-only">
        <BudgetPrintLayout
          budgetId={budgetId}
          clientName={clientName}
          clientPhone={clientPhone}
          addressLine={address ? `${address.logradouro}, ${address.bairro} — ${address.localidade}/${address.uf}` : null}
          styleName={selectedStyle.name}
          liters={liters}
          paymentMethod={paymentMethod}
          freightValor={freightInput !== '' ? freightValue : freightResult?.valor}
          freightIsento={freightResult?.isento}
          pricePerLiter={pricePerLiter}
          finalPrice={finalPrice}
          grandTotal={grandTotal}
          observations={observations}
          discount={discount}
          discountAmount={discountAmount}
          extraItems={extraBarrels.map(b => {
            const style = (b.styleId ? CHOPP_STYLES.find(s => s.id === b.styleId) : null) ?? selectedStyle
            const unitPrice = b.liters >= 30 ? style.priceAbove30 : style.priceBelow30
            return { liters: b.liters, unitPrice, styleName: style.name }
          })}
          deliveryDate={deliveryDate}
          validUntil={validUntil}
          chopperNote={chopperNote}
          chopperFee={chopperFee}
        />
      </div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div className="no-print px-7 pt-[72px] pb-8">

        {/* Título da página */}
        <div className="mb-8">
          <h1 className="text-[36px] leading-[56px]" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-display)' }}>
            Confira os dados
          </h1>
        </div>

        {/* BLOCO 1 — Dados do cliente */}
        <SectionCard number="1" title="Dados do cliente">
          <div className="grid grid-cols-2 gap-6">
            <ReadInput label="Nome do cliente" value={clientName} />
            <ReadInput label="Telefone" value={clientPhone} />
          </div>
        </SectionCard>

        {/* BLOCO 2 — Produto */}
        <SectionCard number="2" title="Produto">
          {(() => {
            const styleBarrelsMap = new Map<string, number>()
            styleBarrelsMap.set(selectedStyle.id, liters)
            for (const b of extraBarrels) {
              if (!b.styleId || b.liters === 0) continue
              styleBarrelsMap.set(b.styleId, (styleBarrelsMap.get(b.styleId) ?? 0) + b.liters)
            }
            const styleBarrels = [...styleBarrelsMap.entries()].map(([id, l]) => ({
              style: CHOPP_STYLES.find(s => s.id === id) ?? selectedStyle,
              liters: l,
            }))
            const allStyles = styleBarrels.map(sb => sb.style)
            return (
              <>
                <div className="mb-6">
                  <p className="text-[16px] font-medium leading-[26px] mb-2" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                    Estilo de chopp
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {allStyles.map(style => (
                      <div
                        key={style.id}
                        className="inline-flex w-[180px] h-[120px] rounded-[12px] border-2 flex-col items-center justify-center gap-3"
                        style={{ borderColor: 'var(--vermelho)', backgroundColor: 'var(--bege)', boxShadow: '0 2px 8px rgba(201,43,31,0.2)' }}
                      >
                        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: CIRCLE_COLORS[style.id] ?? style.colorHex }} />
                        <p className="text-[14px] leading-[18px] text-center px-2 font-medium" style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-body)' }}>
                          {style.name.replace('Germânia ', '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styleBarrels.length === 1 ? '' : 'grid grid-cols-2 gap-6'}>
                  {styleBarrels.map(({ style, liters: l }) => (
                    <ReadInput key={style.id} label={style.name.replace('Germânia ', '')} value={`${l} L`} />
                  ))}
                </div>
                <div className="mt-6">
                  <ReadInput label="Validade do orçamento" value={formatDateBR(validUntil)} />
                </div>
              </>
            )
          })()}
        </SectionCard>

        {/* BLOCO 3 — Entrega */}
        <SectionCard number="3" title="Entrega">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <ReadInput label="CEP" value={clientCep} />
            <ReadInput
              label="Frete (R$)"
              value={
                freightResult
                  ? freightResult.isento
                    ? 'Isento'
                    : formatCurrency(freightResult.valor)
                  : '—'
              }
            />
            <ReadInput label="Data da entrega" value={formatDateBR(deliveryDate)} />
          </div>

          {selectedStore && (
            <div className="rounded-[16px] px-6 py-5" style={{ backgroundColor: 'var(--laranja)' }}>
              <p className="text-[16px] font-medium" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                {selectedStore.name}
              </p>
              <p className="text-[14px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                {selectedStore.distanciaKm} km de distância
              </p>
              <div className="flex items-center gap-2 mt-1">
                <svg width="12" height="15" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5C5.62 9.5 4.5 8.38 4.5 7S5.62 4.5 7 4.5 9.5 5.62 9.5 7 8.38 9.5 7 9.5z" fill="var(--marrom)"/>
                </svg>
                <p className="text-[14px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                  {selectedStore.address} — {selectedStore.city}/{selectedStore.state}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* BLOCO 4 — Precificação */}
        <SectionCard number="4" title="Precificação">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <ReadInput label="Preço por litro (R$)" value={formatCurrency(pricePerLiter)} />
            <ReadInput label="Forma de pagamento" value={paymentMethod || '—'} />
            <ReadInput
              label="Desconto (%)"
              value={discountNum > 0 ? `${discountNum}%` : 'Sem desconto'}
            />
          </div>

          {discountNum > 0 && (
            <div
              className="rounded-[12px] px-4 py-3 mb-6 text-[14px]"
              style={{ backgroundColor: 'rgba(247,153,70,0.15)', border: '1px solid var(--laranja)', color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
            >
              ⚠ Desconto aplicado — aprovação da Supervisão requerida
            </div>
          )}

          <div className="rounded-[20px] px-6 py-6 flex items-center justify-between" style={{ backgroundColor: 'var(--laranja)' }}>
            <p className="text-[16px] font-medium" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
              Valor total do orçamento
            </p>
            <p className="text-[36px] leading-[56px]" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </SectionCard>

        {/* BLOCO 5 — Observações */}
        <SectionCard number="5" title="Observações">
          {chopperNote && (
            <div
              className="rounded-[8px] px-4 py-3 mb-4 flex items-start gap-2 text-[13px]"
              style={{ backgroundColor: 'rgba(143,123,101,0.12)', color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
            >
              <span className="flex-shrink-0">ℹ</span>
              <span>{chopperNote}</span>
            </div>
          )}
          <p className="text-[16px] font-medium leading-[26px] mb-2" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
            Informações adicionais
          </p>
          <div
            className="rounded-[8px] border px-4 py-3 min-h-[120px]"
            style={{ borderColor: 'var(--bege-2)', backgroundColor: 'rgba(143,123,101,0.1)' }}
          >
            <p
              className="text-[14px] leading-[22px] whitespace-pre-wrap"
              style={{ color: observations ? 'var(--marrom)' : 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
            >
              {observations || 'Nenhuma observação adicionada.'}
            </p>
          </div>
        </SectionCard>

        {/* Rodapé de impressão */}
        <div className="print-only mt-12 pt-4 text-center" style={{ borderTop: '1px solid var(--bege-3)' }}>
          <p className="text-[12px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
            *Este orçamento é válido conforme as condições comerciais vigentes. Lig Chopp Germânia.
          </p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
            Emitido em {today} · Orçamento {budgetId}
          </p>
        </div>

      </div>

      {/* ── RODAPÉ FIXO — oculto na impressão ── */}
      <div
        className="no-print fixed bottom-0 left-[241px] right-0 px-7 py-4 flex items-center justify-between z-10"
        style={{ backgroundColor: 'var(--bege-claro)', borderTop: '1px solid var(--bege-3)' }}
      >
        <p className="text-[14px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
          *Este orçamento será automaticamente encaminhado para o RD Station
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-voltar flex items-center gap-2 rounded-[12px] px-6 py-2 text-[16px] font-medium transition-all cursor-pointer"
            style={{
              border: '1px solid var(--marrom)',
              color: 'var(--marrom)',
              fontFamily: 'var(--font-body)',
            }}
          >
            ← Voltar
          </button>

          <button
            onClick={onGeneratePdf}
            className="btn-laranja flex items-center gap-3 rounded-[12px] px-6 py-2 text-[16px] font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--laranja)',
              color: 'var(--marrom)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <DownloadIcon /> Imprimir / Salvar como PDF
          </button>
        </div>
      </div>
    </>
  )
}
