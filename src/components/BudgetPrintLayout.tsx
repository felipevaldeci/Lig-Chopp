const C = {
  vermelho:  '#c92b1f',
  marrom:    '#6c2d01',
  bege:      '#fee6ce',
  begeClaro: '#f5d9bd',
  bege2:     '#8f7b65',
  laranja:   '#f79946',
}

export interface BudgetPrintLayoutProps {
  budgetId: string
  clientName: string
  clientPhone?: string
  addressLine?: string | null
  styleName: string
  liters: number
  paymentMethod?: string
  freightValor?: number
  freightIsento?: boolean
  pricePerLiter?: number
  finalPrice?: number
  grandTotal: number
  observations?: string
  discount?: number
  discountAmount?: number
  extraItems?: Array<{ liters: number; unitPrice: number; styleName?: string; quantity?: number }>
  mainQuantity?: number
  deliveryDate?: string
  validUntil?: string
  chopperNote?: string | null
  chopperFee?: number
}

const NOTES = [
  '*Equipamentos completos para servir',
  '*Instalação no local',
  '*Retirada após o evento',
  '*Suporte durante o período',
]

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function BudgetPrintLayout(p: BudgetPrintLayoutProps) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const effectivePrice = p.finalPrice ?? p.pricePerLiter
  const effectiveMainQty = p.mainQuantity ?? 1
  const choppSubtotal = effectivePrice != null ? p.liters * effectiveMainQty * effectivePrice : null
  const showFreight = p.freightIsento != null || p.freightValor != null
  const hasDiscount = (p.discount ?? 0) > 0 && (p.discountAmount ?? 0) > 0
  const extraItems = p.extraItems ?? []

  const rowStyle: React.CSSProperties = { fontSize: 13, color: C.marrom, marginBottom: 8, marginTop: 0, textAlign: 'center' }
  const rowValueStyle: React.CSSProperties = { fontSize: 13, color: C.marrom, marginBottom: 8, marginTop: 0, textAlign: 'center' }

  return (
    <div style={{ backgroundColor: C.bege, fontFamily: 'var(--font-body, sans-serif)', paddingBottom: 24 }}>

      {/* Cabeçalho vermelho */}
      <div style={{
        backgroundColor: C.vermelho,
        borderRadius: 14,
        paddingTop: 18,
        paddingBottom: 18,
        paddingLeft: 24,
        paddingRight: 24,
        margin: '16px 20px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <img
          src="/assets/LIG%20CHOPP_LIG%20CHOPP.png"
          alt="Lig Chopp Germânia"
          style={{ width: 80, height: 80, objectFit: 'contain' }}
        />
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#fff', fontSize: 16, margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-display, sans-serif)' }}>
            0800 110 0420
          </p>
          <p style={{ color: '#fff', fontSize: 16, margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-display, sans-serif)' }}>
            (19) 97146-9226
          </p>
        </div>
      </div>

      {/* Linha de informações */}
      <div style={{ display: 'flex', margin: '0 32px', marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>Cliente:</p>
          <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>{p.clientName}</p>
          {p.addressLine && <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>{p.addressLine}</p>}
          {p.clientPhone && <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>{p.clientPhone}</p>}
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>Data: {today}</p>
          <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>Orçamento N.º {p.budgetId}</p>
          {p.validUntil && (
            <p style={{ fontSize: 11, color: C.marrom, marginBottom: 2, marginTop: 0 }}>Válido até: {fmtDate(p.validUntil)}</p>
          )}
        </div>
      </div>

      {/* Separador superior */}
      <div style={{ borderTop: '1px solid #F5D9BD', margin: '16px 32px' }} />

      {/* Título */}
      <p style={{
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: 26,
        color: C.vermelho,
        textAlign: 'center',
        margin: '0 0 16px',
      }}>
        Orçamento
      </p>

      {/* Tabela */}
      <div style={{ padding: '0 32px' }}>

        {/* Separador */}
        <div style={{ borderTop: '1px solid #F5D9BD', margin: '16px 0' }} />

        {/* Cabeçalho da tabela */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 17, color: C.vermelho, flex: 3, textAlign: 'center' }}>
            Descrição
          </span>
          <span style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 17, color: C.vermelho, width: 140, textAlign: 'center' }}>
            Valor
          </span>
        </div>

        {/* Corpo da tabela */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {/* Coluna descrição */}
          <div style={{
            flex: 3,
            backgroundColor: C.begeClaro,
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <p style={rowStyle}>{effectiveMainQty > 1 ? `${effectiveMainQty}× ` : ''}{p.liters}L {p.styleName}</p>
            {extraItems.map((item, i) => (
              <p key={i} style={rowStyle}>{(item.quantity ?? 1) > 1 ? `${item.quantity}× ` : ''}{item.liters}L {item.styleName ?? p.styleName}</p>
            ))}
            {p.chopperFee != null && <p style={rowStyle}>Taxa de chopeira elétrica</p>}
            {showFreight && <p style={rowStyle}>Frete</p>}
            {hasDiscount && <p style={{ ...rowStyle, color: C.vermelho }}>Desconto {p.discount}%</p>}
          </div>

          {/* Coluna valor */}
          <div style={{
            width: 140,
            backgroundColor: C.begeClaro,
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {choppSubtotal != null && choppSubtotal > 0 && (
              <p style={rowValueStyle}>{fmt(choppSubtotal)}</p>
            )}
            {extraItems.map((item, i) => {
              const v = (item.quantity ?? 1) * item.liters * item.unitPrice * (1 - (p.discount ?? 0) / 100)
              return v > 0 ? <p key={i} style={rowValueStyle}>{fmt(v)}</p> : null
            })}
            {p.chopperFee != null && (
              <p style={rowValueStyle}>{fmt(p.chopperFee)}</p>
            )}
            {showFreight && (
              <p style={rowValueStyle}>
                {p.freightIsento ? 'Isento' : fmt(p.freightValor ?? 0)}
              </p>
            )}
            {hasDiscount && (
              <p style={{ ...rowValueStyle, color: C.vermelho }}>- {fmt(p.discountAmount!)}</p>
            )}
          </div>
        </div>

        {/* Pagamento/Entrega + Total na mesma linha */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 0 }}>
          <div>
            <p style={{ fontSize: 13, color: C.marrom, margin: 0, marginBottom: 3 }}>
              <span style={{ fontWeight: 700 }}>Pagamento: </span>A combinar
            </p>
            {p.deliveryDate && (
              <p style={{ fontSize: 13, color: C.marrom, margin: 0 }}>
                <span style={{ fontWeight: 700 }}>Entrega: </span>{fmtDate(p.deliveryDate)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 17, color: C.vermelho, whiteSpace: 'nowrap' }}>
              Valor total:
            </span>
            <div style={{
              backgroundColor: C.laranja,
              borderRadius: 8,
              padding: '6px 20px',
              minWidth: 130,
              textAlign: 'center',
            }}>
              <span style={{ fontWeight: 700, fontSize: 19, color: C.marrom }}>
                {fmt(p.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações — só exibe se tiver conteúdo */}
      {p.observations && (
        <div style={{ padding: '0 32px', marginBottom: 14 }}>
          <p style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 17, color: C.vermelho, marginBottom: 6, marginTop: 0 }}>
            Observações
          </p>
          <div style={{
            borderRadius: 8,
            border: `1px solid ${C.bege2}`,
            backgroundColor: 'rgba(143,123,101,0.1)',
            padding: '10px 14px',
          }}>
            <p style={{ fontSize: 12, color: C.marrom, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {p.observations}
            </p>
          </div>
        </div>
      )}

      {/* Separador superior das notas */}
      <div style={{ borderTop: '1px solid #F5D9BD', margin: '16px 32px' }} />

      {/* Notas */}
      <div style={{ padding: '0 32px' }}>
        {NOTES.map(note => (
          <p key={note} style={{ fontSize: 10, color: C.marrom, marginBottom: 3, marginTop: 0, lineHeight: 1.4 }}>
            {note}
          </p>
        ))}
      </div>

      {/* Separador + aviso */}
      <div style={{ borderTop: '1px solid #F5D9BD', margin: '16px 32px 0' }} />
      <p style={{ margin: '16px 32px 0', fontSize: 11, color: C.marrom, fontWeight: 700, fontFamily: 'var(--font-body, sans-serif)' }}>
        Este orçamento não garante disponibilidade
      </p>

    </div>
  )
}
