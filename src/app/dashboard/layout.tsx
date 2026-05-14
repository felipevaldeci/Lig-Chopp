import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie) redirect('/login')

  let user: { id: string; name: string; email: string; role: string } | null = null
  try {
    user = JSON.parse(sessionCookie!.value)
  } catch {
    redirect('/login')
  }

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bege)' }}>
      <Sidebar user={user} />
      <main className="ml-[241px] min-h-screen pb-32">
        {children}
      </main>
    </div>
  )
}
