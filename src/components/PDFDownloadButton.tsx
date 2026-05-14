'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FormBudgetPDFDocument from '@/components/FormBudgetPDFDocument'
import type { BudgetPDFProps } from '@/components/BudgetPDFDocument'
import DownloadIcon from '@/components/DownloadIcon'

export default function PDFDownloadButton({ budget }: { budget: BudgetPDFProps }) {
  return (
    <PDFDownloadLink
      document={
        <FormBudgetPDFDocument
          budgetId={budget.id}
          clientName={budget.cliente}
          styleName={budget.estilo}
          liters={budget.litros}
          grandTotal={budget.total}
        />
      }
      fileName={`orcamento-${budget.id}.pdf`}
      className="btn-laranja w-full rounded-[12px] py-2.5 text-[14px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 no-underline"
      style={{
        backgroundColor: 'var(--laranja)',
        color: 'var(--marrom)',
        fontFamily: 'var(--font-body)',
        textDecoration: 'none',
      }}
    >
      {({ loading, error }) =>
        error ? 'Erro ao gerar PDF' : loading ? 'Gerando…' : <><DownloadIcon /> Baixar PDF</>
      }
    </PDFDownloadLink>
  )
}
