import type { FormBudgetPDFProps } from '@/components/FormBudgetPDFDocument'

export async function downloadFormBudgetPDF(data: FormBudgetPDFProps) {
  const [{ pdf }, { default: FormBudgetPDFDocument }, { createElement }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/FormBudgetPDFDocument'),
    import('react'),
  ])

  const blob = await pdf(createElement(FormBudgetPDFDocument, data)).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orcamento-${data.budgetId}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
