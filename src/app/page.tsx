import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie.value)
      redirect(user.role === 'coordenador' ? '/dashboard/coordenador' : '/dashboard/novo')
    } catch {
      redirect('/login')
    }
  }

  redirect('/login')
}
