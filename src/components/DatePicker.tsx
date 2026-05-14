'use client'
import { useState, useEffect, useRef } from 'react'

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT = ['D','S','T','Q','Q','S','S']

function buildCalendarDays(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<{ date: Date; cur: boolean }> = []
  for (let i = firstDow - 1; i >= 0; i--)
    days.push({ date: new Date(year, month, -i), cur: false })
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(year, month, d), cur: true })
  while (days.length < 42) {
    const prev = days[days.length - 1].date
    days.push({ date: new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1), cur: false })
  }
  return days
}

export default function DatePicker({
  value, onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && value) {
      const parts = value.split('-')
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0]))
        setViewMonth(parseInt(parts[1]) - 1)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const parts = value ? value.split('-') : null
  const displayText = parts && parts.length === 3
    ? `${parts[2].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${parts[0]}`
    : ''

  const todayIso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const days = buildCalendarDays(viewYear, viewMonth)

  function selectDay(date: Date) {
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    onChange(iso)
    setOpen(false)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-[8px] border px-4 py-3 cursor-pointer text-[14px] leading-[22px] transition-colors"
        style={{
          borderColor: open ? 'var(--marrom)' : 'var(--bege-2)',
          backgroundColor: open ? 'rgba(108,45,1,0.06)' : 'transparent',
          color: displayText ? 'var(--marrom)' : 'var(--bege-2)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>{displayText || 'dd/mm/aaaa'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ color: '#8F7B65', flexShrink: 0 }}>
          <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM5 7V6H19V7H5Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          className="absolute z-50 rounded-[16px] p-4"
          style={{
            top: 'calc(100% + 4px)',
            right: 0,
            width: '288px',
            backgroundColor: 'var(--bege-claro)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            border: '1px solid var(--bege-3)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)' }}
            >
              <svg width="7" height="11" viewBox="0 0 7 11" fill="currentColor">
                <path d="M6.41 1.41L5 0L0 5.5L5 11L6.41 9.59L2.83 5.5L6.41 1.41Z"/>
              </svg>
            </button>
            <span className="text-[15px] font-medium" style={{ color: 'var(--marrom)', fontFamily: 'var(--font-body)' }}>
              {MONTHS_PT[viewMonth]} de {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--laranja)', color: 'var(--marrom)' }}
            >
              <svg width="7" height="11" viewBox="0 0 7 11" fill="currentColor">
                <path d="M0.59 1.41L2 0L7 5.5L2 11L0.59 9.59L4.17 5.5L0.59 1.41Z"/>
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_PT.map((d, i) => (
              <div key={i} className="text-center text-[12px] py-1 font-medium"
                style={{ color: 'var(--bege-2)', fontFamily: 'var(--font-body)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map(({ date, cur }, i) => {
              const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
              const isSel = iso === value
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(date)}
                  className="flex items-center justify-center w-9 h-9 mx-auto rounded-full text-[13px] cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSel ? 'var(--laranja)' : 'transparent',
                    color: isSel ? '#6C2D01' : cur ? 'var(--marrom)' : 'var(--bege-3)',
                    fontWeight: isSel ? '700' : '400',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(108,45,1,0.08)' }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--bege-3)' }}>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="text-[13px] font-medium cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-body)' }}
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => selectDay(now)}
              className="text-[13px] font-medium cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: 'var(--vermelho)', fontFamily: 'var(--font-body)' }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
