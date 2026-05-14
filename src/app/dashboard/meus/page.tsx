import { cookies } from 'next/headers'
import MeusOrcamentos from '@/components/MeusOrcamentos'

export default async function MeusOrcamentosPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  const user = session ? JSON.parse(session.value) : null
  return <MeusOrcamentos userEmail={user?.email ?? ''} />
}
