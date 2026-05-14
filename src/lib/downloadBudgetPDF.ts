import type { BudgetPDFProps } from '@/components/BudgetPDFDocument'

export async function downloadBudgetPDF(budget: BudgetPDFProps) {
  const [{ pdf }, { default: BudgetPDFDocument }, { createElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/BudgetPDFDocument'),
    import('react'),
  ])

  const blob = await pdf(createElement(BudgetPDFDocument, budget)).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orcamento-${budget.id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
