export type Region = 'capital' | 'interior'

const FREIGHT_CONFIG = {
  capital: { isencaoKm: 5, litrosMin: 30, precoPorKm: 2.59 },
  interior: { isencaoKm: 10, litrosMin: 50, precoPorKm: 2.09 },
} as const

export interface FreightResult {
  valor: number
  descricao: string
  isento: boolean
  distanciaKm: number
  precoPorKm: number
  regiao: Region
}

export function calcularFrete(distanciaKm: number, litros: number, regiao: Region): FreightResult {
  const config = FREIGHT_CONFIG[regiao]
  const isento = distanciaKm <= config.isencaoKm && litros > config.litrosMin

  if (isento) {
    return { valor: 0, descricao: 'Isento', isento: true, distanciaKm, precoPorKm: config.precoPorKm, regiao }
  }

  return {
    valor: Math.round(distanciaKm * config.precoPorKm * 100) / 100,
    descricao: `${distanciaKm.toFixed(1)} km × R$ ${config.precoPorKm.toFixed(2)} (${regiao === 'capital' ? 'capital/região' : 'interior SP'})`,
    isento: false,
    distanciaKm,
    precoPorKm: config.precoPorKm,
    regiao,
  }
}

export function calcularTaxaChopeira(tipo: 'eletrica' | 'gelo', litros: number): number {
  const isDecember = new Date().getMonth() === 11
  if (tipo === 'gelo') return isDecember ? 60 : 0
  // Elétrica: gratuito acima de 50L, exceto em dezembro
  if (litros >= 50 && !isDecember) return 0
  return 60
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
