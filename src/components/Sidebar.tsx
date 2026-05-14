'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  user: { name: string; email: string; role: string }
}

type NavIcon = 'doc' | 'plus'

const NAV = {
  vendedor: [
    { href: '/dashboard/novo', label: 'Novo Orçamento',  icon: 'plus' as NavIcon },
    { href: '/dashboard/meus', label: 'Meus Orçamentos', icon: 'doc'  as NavIcon },
  ],
  coordenador: [
    { href: '/dashboard/coordenador', label: 'Todos os Orçamentos', icon: 'doc'  as NavIcon },
    { href: '/dashboard/novo',        label: 'Novo Orçamento',       icon: 'plus' as NavIcon },
    { href: '/dashboard/meus',        label: 'Meus Orçamentos',      icon: 'doc'  as NavIcon },
  ],
}

function DocIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M9.86705 2.44269L7.59432 0.135C7.55207 0.0921535 7.50193 0.0581778 7.44675 0.0350141C7.39157 0.0118504 7.33244 -4.75319e-05 7.27273 1.42707e-07H2.72727C2.48617 1.42707e-07 2.25494 0.0972526 2.08445 0.270363C1.91396 0.443474 1.81818 0.678262 1.81818 0.923077V1.84615H0.909091C0.667985 1.84615 0.436754 1.94341 0.266267 2.11652C0.0957789 2.28963 0 2.52442 0 2.76923V11.0769C0 11.3217 0.0957789 11.5565 0.266267 11.7296C0.436754 11.9027 0.667985 12 0.909091 12H7.27273C7.51383 12 7.74506 11.9027 7.91555 11.7296C8.08604 11.5565 8.18182 11.3217 8.18182 11.0769V10.1538H9.09091C9.33202 10.1538 9.56325 10.0566 9.73373 9.88348C9.90422 9.71037 10 9.47558 10 9.23077V2.76923C10 2.7086 9.98833 2.64856 9.96552 2.59253C9.9427 2.5365 9.90924 2.48559 9.86705 2.44269ZM7.27273 11.0769H0.909091V2.76923H5.26648L7.27273 4.80635V9.68308C7.27273 9.68654 7.27273 9.68942 7.27273 9.69231C7.27273 9.69519 7.27273 9.69808 7.27273 9.70154V11.0769ZM9.09091 9.23077H8.18182V4.61538C8.18187 4.55476 8.17015 4.49471 8.14734 4.43868C8.12452 4.38266 8.09106 4.33174 8.04886 4.28885L5.77614 1.98115C5.73389 1.93831 5.68375 1.90433 5.62857 1.88117C5.57339 1.858 5.51425 1.84611 5.45455 1.84615H2.72727V0.923077H7.08466L9.09091 2.96019V9.23077ZM5.90909 7.38462C5.90909 7.50702 5.8612 7.62442 5.77596 7.71097C5.69071 7.79753 5.5751 7.84615 5.45455 7.84615H2.72727C2.60672 7.84615 2.4911 7.79753 2.40586 7.71097C2.32062 7.62442 2.27273 7.50702 2.27273 7.38462C2.27273 7.26221 2.32062 7.14481 2.40586 7.05826C2.4911 6.9717 2.60672 6.92308 2.72727 6.92308H5.45455C5.5751 6.92308 5.69071 6.9717 5.77596 7.05826C5.8612 7.14481 5.90909 7.26221 5.90909 7.38462ZM5.90909 9.23077C5.90909 9.35318 5.8612 9.47057 5.77596 9.55713C5.69071 9.64368 5.5751 9.69231 5.45455 9.69231H2.72727C2.60672 9.69231 2.4911 9.64368 2.40586 9.55713C2.32062 9.47057 2.27273 9.35318 2.27273 9.23077C2.27273 9.10836 2.32062 8.99097 2.40586 8.90441C2.4911 8.81786 2.60672 8.76923 2.72727 8.76923H5.45455C5.5751 8.76923 5.69071 8.81786 5.77596 8.90441C5.8612 8.99097 5.90909 9.10836 5.90909 9.23077Z" fill="currentColor"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M11 5.5C11 5.62156 10.9517 5.73814 10.8658 5.82409C10.7798 5.91005 10.6632 5.95833 10.5417 5.95833H5.95833V10.5417C5.95833 10.6632 5.91005 10.7798 5.82409 10.8658C5.73814 10.9517 5.62156 11 5.5 11C5.37844 11 5.26186 10.9517 5.17591 10.8658C5.08996 10.7798 5.04167 10.6632 5.04167 10.5417V5.95833H0.458333C0.336776 5.95833 0.220197 5.91005 0.134243 5.82409C0.0482886 5.73814 0 5.62156 0 5.5C0 5.37844 0.0482886 5.26186 0.134243 5.17591C0.220197 5.08996 0.336776 5.04167 0.458333 5.04167H5.04167V0.458333C5.04167 0.336776 5.08996 0.220197 5.17591 0.134243C5.26186 0.0482886 5.37844 0 5.5 0C5.62156 0 5.73814 0.0482886 5.82409 0.134243C5.91005 0.220197 5.95833 0.336776 5.95833 0.458333V5.04167H10.5417C10.6632 5.04167 10.7798 5.08996 10.8658 5.17591C10.9517 5.26186 11 5.37844 11 5.5Z" fill="currentColor"/>
    </svg>
  )
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = NAV[user.role as keyof typeof NAV] ?? NAV.vendedor

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[241px] flex flex-col z-30"
      style={{ backgroundColor: 'var(--vermelho)' }}
    >
      {/* User section */}
      <div className="flex flex-col items-center pt-[36px] pb-[24px] px-7">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'var(--laranja)' }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--marrom)', fontFamily: 'var(--font-display)' }}
          >
            {initials}
          </span>
        </div>
        <p
          className="text-[16px] font-medium leading-[26px]"
          style={{ color: 'var(--bege)', fontFamily: 'var(--font-body)' }}
        >
          {user.name}
        </p>
        <div
          className="w-full mt-[24px] border-t"
          style={{ borderColor: 'rgba(254,230,206,0.3)' }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 px-4 pt-2 flex-1">
        {nav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-nav-btn flex items-center justify-center gap-[4px] px-4 py-2 rounded-[12px] text-[16px] font-medium leading-[26px] whitespace-nowrap transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--laranja)',
                      color: 'var(--marrom)',
                      fontFamily: 'var(--font-body)',
                      border: '1px solid var(--laranja)',
                    }
                  : {
                      border: '1px solid var(--bege)',
                      color: 'var(--bege)',
                      fontFamily: 'var(--font-body)',
                    }
              }
            >
              {item.icon === 'doc' ? <DocIcon /> : <PlusIcon />}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="sidebar-sair mx-4 mb-8 px-4 py-2 rounded-[12px] text-[16px] font-medium text-center transition-all cursor-pointer"
        style={{
          border: '1px solid var(--bege)',
          color: 'var(--bege)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Sair
      </button>
    </aside>
  )
}
