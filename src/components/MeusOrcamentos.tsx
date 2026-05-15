'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHOPP_STYLES } from '@/lib/mockData'
import { formatCurrency } from '@/lib/freight'
import StyledSelect from '@/components/StyledSelect'
import DatePicker from '@/components/DatePicker'
import DownloadIcon from '@/components/DownloadIcon'
import type { BudgetPDFProps } from '@/components/BudgetPDFDocument'

interface BudgetRecord extends BudgetPDFProps {
  vendedorEmail: string
  clientePhone: string
  rdStatus: string
  details?: {
    mainLiters?: number
    extraItems?: Array<{ liters: number; unitPrice: number; styleName?: string }>
    editedAt?: string
  } | null
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const PER_PAGE = 10

export default function MeusOrcamentos({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [budgets, setBudgets] = useState<BudgetRecord[]>([])
  const [filterCliente, setFilterCliente] = useState('')
  const [filterEstilo, setFilterEstilo] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null)
  const [page, setPage] = useState(1)
  const [editHovered, setEditHovered] = useState<string | null>(null)
  const [hoveredPagBtn, setHoveredPagBtn] = useState<'prev' | 'next' | null>(null)

  useEffect(() => {
    fetch('/api/budgets')
      .then(r => r.json())
      .then(data => setBudgets(Array.isArray(data) ? data : []))
  }, [])

  const myBudgets = budgets.filter(b => b.vendedorEmail === userEmail)

  const filtered = myBudgets.filter(b => {
    if (filterCliente && !b.cliente.toLowerCase().includes(filterCliente.toLowerCase())) return false
    if (filterEstilo) {
      const allStyles = [b.estilo, ...(b.details?.extraItems?.map(i => i.styleName ?? '') ?? [])]
      if (!allStyles.includes(filterEstilo)) return false
    }
    if (filterDate && !b.createdAt.startsWith(filterDate)) return false
    return true
  })

  useEffect(() => { setPage(1) }, [filterCliente, filterEstilo, filterDate])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalValue = filtered.reduce((sum, b) => sum + b.total, 0)
  const estiloOptions = CHOPP_STYLES.map(s => ({ value: s.name, label: s.name.replace('Germânia ', '') }))
  const hasFilters = !!(filterCliente || filterEstilo || filterDate)

  function clearFilters() {
    setFilterCliente('')
    setFilterEstilo('')
    setFilterDate('')
  }

  return (
    <div className="px-7 pt-[72px] pb-8">
      {/* Título */}
      <div className="mb-8">
        <h1
          className="text-[36px] leading-[56px]"
          style={{ color: 'var(--cor-titulo)', fontFamily: 'var(--font-display)' }}
        >
          Meus Orçamentos
        </h1>
        <p
          className="text-[16px] leading-[26px]"
          style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
        >
          Histórico dos seus orçamentos gerados
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Orçamentos', value: String(filtered.length), sub: `de ${myBudgets.length} total` },
          { label: 'Volume total', value: formatCurrency(totalValue), sub: 'soma filtrada' },
          {
            label: 'Enviados ao CRM',
            value: String(filtered.filter(b => b.rdStatus === 'Enviado').length),
            sub: `de ${filtered.length} orçamentos`,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-[20px] px-6 py-5"
            style={{ backgroundColor: 'var(--bege-claro)' }}
          >
            <p
              className="text-[14px] font-medium mb-1"
              style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
            >
              {card.label}
            </p>
            <p
              className="text-[28px] leading-9"
              style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}
            >
              {card.value}
            </p>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
            >
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div
        className="rounded-[20px] px-6 py-5 mb-4 flex flex-wrap gap-4 items-end"
        style={{ backgroundColor: 'var(--bege-claro)' }}
      >
        <div className="min-w-[200px]">
          <p className="text-[14px] font-medium mb-2" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
            Cliente
          </p>
          <div
            className="flex items-center gap-2 rounded-[8px] border px-4 py-3 w-full"
            style={{ borderColor: 'var(--bege-2)', backgroundColor: 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bege-2)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={filterCliente}
              onChange={e => setFilterCliente(e.target.value)}
              placeholder="Buscar por cliente..."
              className="flex-1 bg-transparent outline-none text-[14px] leading-[22px]"
              style={{ color: filterCliente ? 'var(--marrom)' : 'var(--bege-2)', fontFamily: 'var(--font-body)', minWidth: 0 }}
            />
          </div>
        </div>
        <div className="min-w-[160px]">
          <p
            className="text-[14px] font-medium mb-2"
            style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
          >
            Estilo
          </p>
          <StyledSelect
            value={filterEstilo}
            onChange={setFilterEstilo}
            options={estiloOptions}
            placeholder="Todos"
          />
        </div>

        <div className="min-w-[160px]">
          <p
            className="text-[14px] font-medium mb-2"
            style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}
          >
            Data do Orçamento
          </p>
          <DatePicker value={filterDate} onChange={setFilterDate} />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[14px] font-medium px-4 py-2 rounded-[8px] cursor-pointer transition-opacity hover:opacity-70"
            style={{
              color: 'var(--vermelho)',
              border: '1px solid var(--vermelho)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Limpar filtros ×
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-[20px] overflow-hidden" style={{ backgroundColor: 'var(--bege-claro)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bege-3)' }}>
              <th className="text-left text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Data</th>
              <th className="text-left text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)', minWidth: '170px' }}>Orçamento</th>
              <th className="text-left text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Cliente</th>
              <th className="text-left text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Estilo</th>
              <th className="text-right text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Litros</th>
              <th className="text-right text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>Total</th>
              <th className="text-center text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>RD Station</th>
              <th className="text-[12px] font-medium uppercase tracking-wide px-4 py-3" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-12 text-[14px]"
                  style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}
                >
                  Nenhum orçamento encontrado.
                </td>
              </tr>
            ) : paginated.map(budget => (
              <tr
                key={budget.id}
                style={{ borderBottom: '1px solid var(--bege-3)' }}
                className="transition-colors hover:bg-[rgba(143,123,101,0.1)]"
              >
                <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                  {formatDate(budget.createdAt)}
                </td>
                <td className="px-4 py-3 text-[12px] font-mono" style={{ color: 'var(--marrom)', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>
                  {budget.id}
                </td>
                <td className="px-4 py-3 text-[14px] font-medium" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                  {budget.cliente}
                </td>
                <td className="px-4 py-3 text-[14px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                  {(() => {
                    const main = budget.estilo.replace('Germânia ', '')
                    const extras = (budget.details?.extraItems ?? [])
                      .map(i => i.styleName?.replace('Germânia ', '') ?? '')
                      .filter(Boolean)
                    return [...new Set([main, ...extras])].join(' + ')
                  })()}
                </td>
                <td className="px-4 py-3 text-[14px] text-right" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                  {(() => {
                    if (!budget.details) return `${budget.litros}L`
                    const main = budget.details.mainLiters ?? budget.litros
                    const extra = (budget.details.extraItems ?? []).reduce((s, i) => s + i.liters, 0)
                    return `${main + extra}L`
                  })()}
                </td>
                <td className="px-4 py-3 text-[14px] text-right font-medium" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                  {formatCurrency(budget.total)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: budget.rdStatus === 'Enviado' ? 'rgba(52,168,83,0.15)' : 'rgba(201,43,31,0.15)',
                      color: budget.rdStatus === 'Enviado' ? '#1a7a35' : 'var(--vermelho)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {budget.rdStatus === 'Enviado' ? '✓' : '!'} {budget.rdStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBudget(budget)}
                      className="btn-ver text-[13px] font-medium px-3 py-1 rounded-[8px] cursor-pointer transition-all"
                      style={{ backgroundColor: '#f79946', color: '#6c2d01', fontFamily: 'var(--font-body)' }}
                    >
                      Ver →
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/novo?edit=${budget.id}`)}
                      onMouseEnter={() => setEditHovered(budget.id)}
                      onMouseLeave={() => setEditHovered(null)}
                      className="flex items-center gap-1 text-[13px] font-medium px-3 py-1 rounded-[8px] cursor-pointer transition-all"
                      style={{
                        border: editHovered === budget.id ? '1px solid var(--laranja)' : '1px solid var(--marrom)',
                        color: 'var(--marrom)',
                        backgroundColor: editHovered === budget.id ? 'var(--laranja)' : 'transparent',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            onMouseEnter={() => setHoveredPagBtn('prev')}
            onMouseLeave={() => setHoveredPagBtn(null)}
            className="px-3 py-1 rounded-[8px] text-[13px] font-medium cursor-pointer disabled:opacity-40 transition-all"
            style={{
              border: hoveredPagBtn === 'prev' ? '1px solid var(--laranja)' : '1px solid var(--bege-2)',
              color: 'var(--marrom)',
              backgroundColor: hoveredPagBtn === 'prev' ? 'var(--laranja)' : 'transparent',
              fontFamily: 'var(--font-body)',
            }}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="w-8 h-8 rounded-[8px] text-[13px] font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: n === page ? 'var(--laranja)' : 'transparent',
                color: n === page ? 'var(--marrom)' : 'var(--bege-2)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            onMouseEnter={() => setHoveredPagBtn('next')}
            onMouseLeave={() => setHoveredPagBtn(null)}
            className="px-3 py-1 rounded-[8px] text-[13px] font-medium cursor-pointer disabled:opacity-40 transition-all"
            style={{
              border: hoveredPagBtn === 'next' ? '1px solid var(--laranja)' : '1px solid var(--bege-2)',
              color: 'var(--marrom)',
              backgroundColor: hoveredPagBtn === 'next' ? 'var(--laranja)' : 'transparent',
              fontFamily: 'var(--font-body)',
            }}
          >
            Próximo →
          </button>
        </div>
      )}

      {/* Drawer de detalhes */}
      {selectedBudget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedBudget(null)} />
          <div
            className="relative w-96 h-full shadow-2xl overflow-y-auto flex flex-col"
            style={{ backgroundColor: 'var(--bege)' }}
          >
            <div
              className="sticky top-0 px-6 py-5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--bege-3)', backgroundColor: 'var(--bege)' }}
            >
              <div>
                <h3
                  className="text-[20px]"
                  style={{ color: 'var(--cor-titulo)', fontFamily: 'var(--font-display)' }}
                >
                  Detalhes
                </h3>
                <p className="text-[12px] font-mono mt-0.5" style={{ color: 'var(--bege-2)' }}>
                  {selectedBudget.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBudget(null)}
                className="text-2xl leading-none cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: 'var(--bege-2)' }}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 flex-1 space-y-3">
              {[
                { label: 'Data', value: formatDate(selectedBudget.createdAt) },
                { label: 'Cliente', value: selectedBudget.cliente },
                { label: 'Estilo', value: selectedBudget.estilo },
                { label: 'Quantidade', value: `${selectedBudget.litros} litros` },
                { label: 'RD Station', value: selectedBudget.rdStatus },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start gap-4">
                  <span className="text-[14px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                    {row.label}
                  </span>
                  <span className="text-[14px] font-medium text-right" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
                    {row.value}
                  </span>
                </div>
              ))}

              {selectedBudget.details?.editedAt && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[12px]" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                    ✏ Editado em {formatDate(selectedBudget.details.editedAt)}
                  </span>
                </div>
              )}

              <div className="rounded-[16px] px-5 py-4 text-center mt-4" style={{ backgroundColor: 'var(--bege-claro)' }}>
                <p className="text-[14px] mb-1" style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                  Valor total
                </p>
                <p className="text-[28px]" style={{ color: 'var(--cor-titulo)', fontFamily: 'var(--font-display)' }}>
                  {formatCurrency(selectedBudget.total)}
                </p>
              </div>

              <a
                href={`/print/${selectedBudget.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-laranja w-full rounded-[12px] py-2.5 text-[14px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 no-underline"
                style={{
                  backgroundColor: 'var(--laranja)',
                  color: 'var(--marrom)',
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                }}
              >
                <DownloadIcon /> Imprimir / Salvar como PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
