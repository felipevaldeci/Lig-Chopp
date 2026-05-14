import { NextResponse } from 'next/server'
import { getChoppStyles } from '@/lib/googleSheets'

export async function GET() {
  const styles = await getChoppStyles()
  return NextResponse.json({ styles }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
