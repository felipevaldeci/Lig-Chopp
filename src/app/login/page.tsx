'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('lig-chopp-credentials')
    if (!saved) return
    const { email: savedEmail, password: savedPassword } = JSON.parse(saved)
    setEmail(savedEmail)
    setPassword(savedPassword)
    setRememberMe(true)
    setLoading(true)
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: savedEmail, password: savedPassword }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          router.push(data.user.role === 'coordenador' ? '/dashboard/coordenador' : '/dashboard/novo')
        } else {
          localStorage.removeItem('lig-chopp-credentials')
          setLoading(false)
        }
      })
      .catch(() => { localStorage.removeItem('lig-chopp-credentials'); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (rememberMe) {
      localStorage.setItem('lig-chopp-credentials', JSON.stringify({ email, password }))
    } else {
      localStorage.removeItem('lig-chopp-credentials')
    }

    router.push(data.user.role === 'coordenador' ? '/dashboard/coordenador' : '/dashboard/novo')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bege)' }}>
      <div
        className="relative w-full max-w-[679px] rounded-[24px] px-[72px] pt-[70px] pb-[66px]"
        style={{ backgroundColor: 'var(--vermelho)' }}
      >
        {/* Brasão Germânia */}
        <div className="flex justify-center mb-10">
          <Image
            src="/assets/brasao.svg"
            alt="Germânia"
            width={140}
            height={140}
            priority
          />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Usuário */}
          <div
            className="flex items-center gap-3 rounded-[12px] border px-4 py-3"
            style={{ borderColor: 'var(--bege)' }}
          >
            <Image src="/assets/user-icon.svg" alt="" width={20} height={20} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{
                color: 'var(--bege)',
                fontFamily: 'var(--font-body)',
              }}
              placeholder="Usuário"
              required
            />
          </div>

          {/* Senha */}
          <div
            className="flex items-center gap-3 rounded-[12px] border px-4 py-3"
            style={{ borderColor: 'var(--bege)' }}
          >
            <Image src="/assets/lock.svg" alt="" width={20} height={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              style={{
                color: 'var(--bege)',
                fontFamily: 'var(--font-body)',
              }}
              placeholder="Senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#FEE6CE' }}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#FEE6CE' }}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>

          {/* Lembrar meus dados */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#f79946]"
            />
            <span className="text-sm" style={{ color: 'var(--bege)', fontFamily: 'var(--font-body)' }}>
              Lembrar meus dados
            </span>
          </label>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--bege-3)' }}>
              {error}
            </p>
          )}

          {/* Botão ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className="btn-login w-full rounded-[12px] border py-[8px] text-center text-[16px] font-medium transition-all disabled:opacity-60 cursor-pointer mt-2"
            style={{
              borderColor: 'var(--bege)',
              color: 'var(--bege)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}
