'use client'
import { useState, useEffect, useRef } from 'react'

export interface SelectOption { value: string; label: string }

export default function StyledSelect({
  value, onChange, options, placeholder = 'Selecione',
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="field-select-wrapper w-full flex items-center justify-between rounded-[8px] border px-4 py-3 cursor-pointer text-[14px] leading-[22px] transition-colors"
        style={{
          borderColor: open ? 'var(--marrom)' : 'var(--bege-2)',
          backgroundColor: open ? 'rgba(108,45,1,0.06)' : 'transparent',
          color: selected ? 'var(--text-card)' : 'var(--text-card-2)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>{selected?.label ?? placeholder}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-card-2)' }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 rounded-[8px] overflow-hidden z-50"
          style={{
            top: 'calc(100% + 2px)',
            backgroundColor: 'var(--bege-claro)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid var(--bege-3)',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="select-option w-full text-left px-4 py-2.5 text-[14px] cursor-pointer transition-colors"
            style={{
              color: 'var(--text-card-2)',
              fontFamily: 'var(--font-body)',
              backgroundColor: !value ? 'rgba(108,45,1,0.06)' : 'transparent',
            }}
          >
            {placeholder}
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="select-option w-full text-left px-4 py-2.5 text-[14px] cursor-pointer transition-colors"
              style={{
                color: 'var(--text-card)',
                fontFamily: 'var(--font-body)',
                backgroundColor: opt.value === value ? 'rgba(108,45,1,0.1)' : 'transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
