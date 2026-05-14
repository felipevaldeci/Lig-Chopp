import fs from 'fs'
import path from 'path'
import { CHOPP_STYLES } from './mockData'
import type { ChoppStyle, Store } from './mockData'

const PRICES_ID = '18PBI3hbQVSfryDC7acUHRFJ_5bZ7cyX6Ragc81FLppA'
const STORES_ID = '1n11w5xTZZN54y0E1KxoyNZX-sNnHVHbkXc_t6lQW1Ik'

const STORE_TABS: { tab: string; region: 'capital' | 'interior' }[] = [
  { tab: 'São Paulo - Capital',              region: 'capital' },
  { tab: 'São Paulo - Região Metropolitana', region: 'capital' },
  { tab: 'ABC Paulista',                     region: 'capital' },
  { tab: 'São Paulo - Interior',             region: 'interior' },
  { tab: 'São Paulo - Litoral',              region: 'interior' },
  { tab: 'Alto Tietê e Vale do Paraíba',     region: 'interior' },
  { tab: 'Outros Estados',                   region: 'interior' },
]

const STYLE_ID_MAP: Record<string, string> = {
  'Germânia Pilsen':       'pilsen',
  'Germânia Escura':       'escura',
  'Germânia Black':        'black',
  'Germânia Vinho':        'vinho',
  'Germânia Puro Malte':   'puro-malte',
  'Germânia Slow Beer':    'slow-beer',
  'Germânia Amber Lager':  'amber-lager',
  'Germânia IPA':          'ipa',
}

// ── Parsing helpers ──────────────────────────────────────────────────────────

function parsePrice(str: string): number {
  return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

function slugify(name: string): string {
  return name
    .replace(/^LIG CHOPP GERMÂNIA\s*/i, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []

  const parseRow = (line: string): string[] => {
    const cols: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
        else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        cols.push(cur.trim()); cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur.trim())
    return cols
  }

  const headers = parseRow(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseRow(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
  })
}

async function fetchGSheet(id: string, tab: string): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return []
  return parseCSV(await res.text())
}

export async function getChoppStyles(): Promise<ChoppStyle[]> {
  try {
    const rows = await fetchGSheet(PRICES_ID, 'precos_chopp')
    const styles = rows
      .filter(r => {
        const name = Object.values(r)[0] ?? ''
        return STYLE_ID_MAP[name]
      })
      .map(r => {
        const name = Object.values(r)[0] ?? ''
        const id = STYLE_ID_MAP[name]
        const fallback = CHOPP_STYLES.find(s => s.id === id)!
        return {
          ...fallback,
          priceBelow30: parsePrice(r.preco_abaixo_30L ?? ''),
          priceAbove30: parsePrice(r.preco_acima_30L ?? ''),
        } as ChoppStyle
      })

    if (styles.length > 0) return styles
  } catch { /* fall through */ }

  return CHOPP_STYLES
}

// ── Geo cache (persistent file) ───────────────────────────────────────────────

type GeoEntry = { lat: number; lng: number; city: string; state: string }
type GeoCache = Record<string, GeoEntry>

const GEO_CACHE_PATH = path.join(process.cwd(), 'src', 'lib', 'storesGeoCache.json')
const STORES_FULL_CACHE_PATH = path.join(process.cwd(), 'src', 'lib', 'storesFullCache.json')

function loadStoresFullCache(): Store[] {
  try {
    return JSON.parse(fs.readFileSync(STORES_FULL_CACHE_PATH, 'utf8'))
  } catch { return [] }
}

function loadGeoCache(): GeoCache {
  try {
    return JSON.parse(fs.readFileSync(GEO_CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveGeoCache(cache: GeoCache) {
  try {
    fs.writeFileSync(GEO_CACHE_PATH, JSON.stringify(cache, null, 2))
  } catch { /* non-critical */ }
}

async function geocodeStoreCep(cep: string): Promise<GeoEntry | null> {
  const cleanCep = cep.replace(/\D/g, '')
  try {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 5000)
    const res = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`, { signal: ac.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data?.lat && data?.lng) {
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          city: data.city ?? '',
          state: data.state ?? '',
        }
      }
    }
  } catch { /* fall through */ }
  return null
}

// ── Stores cache ─────────────────────────────────────────────────────────────

interface StoresCache { data: Store[]; expiresAt: number }
let storesMemCache: StoresCache | null = null

export async function getStoresWithCoords(): Promise<Store[]> {
  if (storesMemCache && Date.now() < storesMemCache.expiresAt) return storesMemCache.data

  const geoCache = loadGeoCache()
  const results: Store[] = []
  let cacheUpdated = false

  for (const { tab, region } of STORE_TABS) {
    let rows: Record<string, string>[]
    try {
      rows = await fetchGSheet(STORES_ID, tab)
    } catch {
      continue
    }

    for (const row of rows) {
      const name = row['LOJA'] || row['loja'] || ''
      const address = row['ENDEREÇO'] || row['endereco'] || ''
      const cep = (row['CEP'] || row['cep'] || '').replace(/\D/g, '')
      const phone = row['TELEFONE'] || row['telefone'] || ''

      if (!name || !cep) continue

      let geo = geoCache[cep]
      if (!geo) {
        await new Promise(r => setTimeout(r, 300))
        const result = await geocodeStoreCep(cep)
        if (result) {
          geo = result
          geoCache[cep] = result
          cacheUpdated = true
        } else {
          continue
        }
      }

      results.push({
        id: slugify(name),
        name,
        address,
        city: geo.city,
        state: geo.state,
        cep,
        region,
        lat: geo.lat,
        lng: geo.lng,
        phone,
      })
    }
  }

  if (cacheUpdated) saveGeoCache(geoCache)

  if (results.length > 0) {
    storesMemCache = { data: results, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
    try { fs.writeFileSync(STORES_FULL_CACHE_PATH, JSON.stringify(results)) } catch { /* non-critical */ }
    return results
  }

  const fileFallback = loadStoresFullCache()
  if (fileFallback.length > 0) {
    storesMemCache = { data: fileFallback, expiresAt: Date.now() + 5 * 60 * 1000 }
    return fileFallback
  }

  return []
}
