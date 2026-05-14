import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'BodegaSans',
  src: '/fonts/Bodega%20Sans%20Black.ttf',
})

Font.register({
  family: 'Gotham',
  fonts: [
    { src: '/fonts/gotham-medium.ttf', fontWeight: 400 },
    { src: '/fonts/gotham_bold.otf',   fontWeight: 700 },
    { src: '/fonts/gotham_black.otf',  fontWeight: 900 },
  ],
})

export type FormBudgetPDFProps = {
  budgetId: string
  clientName: string
  grandTotal: number
  styleName: string
  liters: number
  clientPhone?: string
  clientCep?: string
  validUntil?: string
  storeName?: string
  storeCity?: string
  storeState?: string
  storeDistanciaKm?: number
  addressLine?: string | null
  deliveryDate?: string
  freightValor?: number
  freightIsento?: boolean
  pricePerLiter?: number
  finalPrice?: number
  discount?: number
  paymentMethod?: string
  observations?: string
  chopperNote?: string | null
}

const C = {
  vermelho:  '#c92b1f',
  marrom:    '#6c2d01',
  bege:      '#fee6ce',
  begeClaro: '#f5d9bd',
  laranja:   '#f79946',
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bege,
    paddingBottom: 40,
    fontFamily: 'Gotham',
  },

  // Header
  header: {
    backgroundColor: C.vermelho,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    height: 110,
    width: 110,
    objectFit: 'contain',
  },

  // Info section
  infoRow: {
    flexDirection: 'row',
    marginHorizontal: 40,
    marginBottom: 4,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    flex: 1,
  },
  clientLabel: {
    fontFamily: 'Gotham',
    fontWeight: 700,
    fontSize: 11,
    color: C.marrom,
    marginBottom: 3,
  },
  infoText: {
    fontFamily: 'Gotham',
    fontWeight: 400,
    fontSize: 10,
    color: C.marrom,
    marginBottom: 2,
  },
  infoTextRight: {
    fontFamily: 'Gotham',
    fontWeight: 400,
    fontSize: 10,
    color: C.marrom,
    marginBottom: 2,
    textAlign: 'right',
  },

  // Title
  title: {
    fontFamily: 'BodegaSans',
    fontSize: 38,
    color: C.vermelho,
    textAlign: 'center',
    marginVertical: 20,
  },

  // Table
  tableSection: {
    paddingHorizontal: 40,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tableHeaderDesc: {
    fontFamily: 'BodegaSans',
    fontSize: 14,
    color: C.vermelho,
    flex: 3,
  },
  tableHeaderVal: {
    fontFamily: 'BodegaSans',
    fontSize: 14,
    color: C.vermelho,
    width: 160,
    textAlign: 'right',
  },
  tableBoxRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tableBoxDesc: {
    flex: 3,
    backgroundColor: C.begeClaro,
    borderRadius: 10,
    padding: 16,
    marginRight: 12,
  },
  tableBoxVal: {
    width: 160,
    backgroundColor: C.begeClaro,
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-end',
  },
  tableItem: {
    fontFamily: 'Gotham',
    fontWeight: 400,
    fontSize: 12,
    color: C.marrom,
    marginBottom: 10,
    textAlign: 'center',
  },
  tableValue: {
    fontFamily: 'Gotham',
    fontWeight: 400,
    fontSize: 12,
    color: C.marrom,
    marginBottom: 10,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 28,
  },
  totalLabel: {
    fontFamily: 'BodegaSans',
    fontSize: 14,
    color: C.vermelho,
    marginRight: 12,
  },
  totalBox: {
    backgroundColor: C.laranja,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  totalValue: {
    fontFamily: 'Gotham',
    fontWeight: 700,
    fontSize: 15,
    color: C.marrom,
  },

  // Notes
  notes: {
    paddingHorizontal: 40,
  },
  noteText: {
    fontFamily: 'Gotham',
    fontWeight: 400,
    fontSize: 9,
    color: C.marrom,
    marginBottom: 5,
    lineHeight: 1.5,
  },
})

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const NOTES = [
  '*Chopeira elétrica cortesia',
  '*Equipamentos completos para servir',
  '*Instalação no local',
  '*Retirada após o evento',
  '*Suporte durante o período',
]

export default function FormBudgetPDFDocument(p: FormBudgetPDFProps) {
  const today = fmtDate(new Date().toISOString().split('T')[0])

  const choppSubtotal = p.pricePerLiter != null
    ? p.liters * (p.finalPrice ?? p.pricePerLiter)
    : null

  const showFreight = p.freightIsento != null || p.freightValor != null

  return (
    <Document title={`Orçamento ${p.budgetId}`} author="Germânia Lig Chopp">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Image src="/assets/LIG%20CHOPP_LIG%20CHOPP.png" style={s.logo} />
        </View>

        {/* Info */}
        <View style={s.infoRow}>
          <View style={s.infoLeft}>
            <Text style={s.clientLabel}>Cliente:</Text>
            <Text style={s.infoText}>{p.clientName}</Text>
            {p.addressLine ? <Text style={s.infoText}>{p.addressLine}</Text> : null}
            {p.clientPhone ? <Text style={s.infoText}>{p.clientPhone}</Text> : null}
          </View>
          <View style={s.infoRight}>
            <Text style={s.infoTextRight}>Data: {today}</Text>
            <Text style={s.infoTextRight}>Orçamento N.º {p.budgetId}</Text>
            {p.paymentMethod
              ? <Text style={s.infoTextRight}>Forma de pagamento: {p.paymentMethod}</Text>
              : null}
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>Orçamento</Text>

        {/* Table */}
        <View style={s.tableSection}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableHeaderDesc}>Descrição</Text>
            <Text style={s.tableHeaderVal}>Valor</Text>
          </View>
          <View style={s.tableBoxRow}>
            <View style={s.tableBoxDesc}>
              <Text style={s.tableItem}>{p.liters}L {p.styleName}</Text>
              {showFreight ? <Text style={s.tableItem}>Frete</Text> : null}
            </View>
            <View style={s.tableBoxVal}>
              {choppSubtotal != null
                ? <Text style={s.tableValue}>{fmt(choppSubtotal)}</Text>
                : null}
              {showFreight
                ? <Text style={s.tableValue}>
                    {p.freightIsento ? 'Isento' : fmt(p.freightValor ?? 0)}
                  </Text>
                : null}
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={s.totalRow}>
          <View style={{ flex: 1 }} />
          <Text style={s.totalLabel}>Valor total:</Text>
          <View style={s.totalBox}>
            <Text style={s.totalValue}>{fmt(p.grandTotal)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={s.notes}>
          {NOTES.map(note => (
            <Text key={note} style={s.noteText}>{note}</Text>
          ))}
        </View>

      </Page>
    </Document>
  )
}
