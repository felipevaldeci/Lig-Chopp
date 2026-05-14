import { NextRequest, NextResponse } from 'next/server'
import { getStoresWithCoords } from '@/lib/googleSheets'
import { haversineDistance } from '@/lib/freight'

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 3000): Promise<Response> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), ms)
  return fetch(url, { ...options, signal: ac.signal }).finally(() => clearTimeout(timer))
}

export async function GET(req: NextRequest) {
  const cep = req.nextUrl.searchParams.get('cep')?.replace(/\D/g, '')

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 })
  }

  // Step 1: address data from ViaCEP
  let viaCepData: Record<string, string>
  try {
    const res = await fetchWithTimeout(`https://viacep.com.br/ws/${cep}/json/`, { cache: 'no-store' })
    viaCepData = await res.json()
    if (viaCepData.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao consultar o CEP. Tente novamente.' }, { status: 502 })
  }

  // Step 2: get coordinates via cascade of geocoding sources
  let clientLat: number | null = null
  let clientLng: number | null = null

  // 2a. AwesomeAPI — returns lat/lng directly for virtually all BR CEPs
  try {
    const res = await fetchWithTimeout(`https://cep.awesomeapi.com.br/json/${cep}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data?.lat && data?.lng) {
        clientLat = parseFloat(data.lat)
        clientLng = parseFloat(data.lng)
      }
    }
  } catch { /* fall through */ }

  // 2b. BrasilAPI v2 fallback
  if (clientLat === null) {
    try {
      const res = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v2/${cep}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const lat = data?.location?.coordinates?.latitude
        const lng = data?.location?.coordinates?.longitude
        if (lat && lng) {
          clientLat = parseFloat(lat)
          clientLng = parseFloat(lng)
        }
      }
    } catch { /* fall through */ }
  }

  // 2c. Nominatim last resort (city-level)
  if (clientLat === null) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${viaCepData.localidade}, ${viaCepData.uf}, Brasil`)}&format=json&limit=1`
      const res = await fetchWithTimeout(url, {
        headers: { 'User-Agent': 'LigChoppOrcamentos/1.0 contact@ligchopp.com.br' },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length) {
          clientLat = parseFloat(data[0].lat)
          clientLng = parseFloat(data[0].lon)
        }
      }
    } catch { /* fall through */ }
  }

  if (clientLat === null || clientLng === null) {
    return NextResponse.json({ error: 'Não foi possível localizar o endereço. Verifique o CEP e tente novamente.' }, { status: 404 })
  }

  // Step 3: load stores
  let stores = await getStoresWithCoords()

  if (stores.length === 0) {
    await new Promise(r => setTimeout(r, 2000))
    stores = await getStoresWithCoords()
  }

  if (stores.length === 0) {
    return NextResponse.json({ error: 'Lojas ainda sendo carregadas. Tente novamente em instantes.' }, { status: 503 })
  }

  const storesWithDistance = stores
    .map(store => ({
      ...store,
      distanciaKm: Math.round(haversineDistance(clientLat!, clientLng!, store.lat, store.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)

  return NextResponse.json({
    address: viaCepData,
    nearestStore: storesWithDistance[0],
    allStores: storesWithDistance,
  })
}
