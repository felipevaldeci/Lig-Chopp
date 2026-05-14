import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

export type BudgetPDFProps = {
  id: string
  createdAt: string
  vendedor: string
  cliente: string
  estilo: string
  litros: number
  total: number
  rdStatus: string
}

const C = {
  vermelho: '#c92b1f',
  laranja: '#f79946',
  marrom: '#6c2d01',
  bege: '#fee6ce',
  bege2: '#8f7b65',
  begeClaro: '#f5d9bd',
  bege3: '#dec3a6',
  verde: '#1a7a35',
  verdeAlpha: 'rgba(52,168,83,0.12)',
  vermelhoAlpha: 'rgba(201,43,31,0.12)',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#fff', paddingBottom: 64 },

  header: {
    backgroundColor: C.vermelho,
    paddingVertical: 24,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { color: C.bege, fontSize: 20, fontFamily: 'Helvetica-Bold' },
  headerSub:   { color: C.bege, fontSize: 10, marginTop: 4, opacity: 0.8 },
  headerId:    { color: C.bege, fontSize: 9, fontFamily: 'Helvetica', opacity: 0.7, marginTop: 4 },

  body: { paddingVertical: 28, paddingHorizontal: 32 },

  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.bege2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.bege3,
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  label: { fontSize: 11, color: C.bege2, fontFamily: 'Helvetica' },
  value: { fontSize: 11, color: C.marrom, fontFamily: 'Helvetica-Bold' },

  divider: { height: 1, backgroundColor: C.begeClaro, marginVertical: 18 },

  totalBox: {
    backgroundColor: C.begeClaro,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  totalLabel: { fontSize: 11, color: C.bege2, fontFamily: 'Helvetica' },
  totalValue: { fontSize: 24, color: C.marrom, fontFamily: 'Helvetica-Bold' },

  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 8, color: C.bege2 },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
})

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function BudgetPDFDocument({ id, createdAt, vendedor, cliente, estilo, litros, total, rdStatus }: BudgetPDFProps) {
  const enviado = rdStatus === 'Enviado'

  return (
    <Document title={`Orçamento ${id}`} author="Germânia Lig Chopp">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Germânia Lig Chopp</Text>
            <Text style={s.headerSub}>Orçamento de Chopp</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.headerSub, { opacity: 1 }]}>{formatDate(createdAt)}</Text>
            <Text style={s.headerId}>{id}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>

          <Text style={s.sectionTitle}>Dados do Orçamento</Text>
          <View style={s.row}>
            <Text style={s.label}>Vendedor</Text>
            <Text style={s.value}>{vendedor}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Cliente</Text>
            <Text style={s.value}>{cliente}</Text>
          </View>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Produto</Text>
          <View style={s.row}>
            <Text style={s.label}>Estilo</Text>
            <Text style={s.value}>{estilo}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Volume</Text>
            <Text style={s.value}>{litros} litros</Text>
          </View>

          {/* Total */}
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Valor total</Text>
            <Text style={s.totalValue}>{formatCurrency(total)}</Text>
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>cervejariagermania.com.br</Text>
          <View style={[s.badge, { backgroundColor: enviado ? C.verdeAlpha : C.vermelhoAlpha }]}>
            <Text style={[s.badgeText, { color: enviado ? C.verde : C.vermelho }]}>
              {enviado ? '✓ Enviado ao CRM' : '! Erro no CRM'}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
