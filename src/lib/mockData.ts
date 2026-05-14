export interface ChoppStyle {
  id: string
  name: string
  colorHex: string
  bgClass: string
  borderClass: string
  textClass: string
  dotClass: string
  priceBelow30: number
  priceAbove30: number
}

export interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  cep: string
  region: 'capital' | 'interior'
  lat: number
  lng: number
  phone?: string
}

export const CHOPP_STYLES: ChoppStyle[] = [
  { id: 'pilsen',       name: 'Germânia Pilsen',       colorHex: '#F59E0B', bgClass: 'bg-amber-50',       borderClass: 'border-amber-400',  textClass: 'text-amber-900',   dotClass: 'bg-amber-400',  priceBelow30: 17.13, priceAbove30: 14.45 },
  { id: 'escura',       name: 'Germânia Escuro',       colorHex: '#92400E', bgClass: 'bg-orange-950/10',  borderClass: 'border-orange-700', textClass: 'text-orange-950',  dotClass: 'bg-orange-700', priceBelow30: 18.68, priceAbove30: 15.75 },
  { id: 'vinho',        name: 'Germânia Vinho',        colorHex: '#881337', bgClass: 'bg-rose-950/10',    borderClass: 'border-rose-700',   textClass: 'text-rose-950',    dotClass: 'bg-rose-700',   priceBelow30: 22.04, priceAbove30: 18.59 },
  { id: 'puro-malte',   name: 'Germânia Puro Malte',   colorHex: '#D97706', bgClass: 'bg-amber-100',      borderClass: 'border-amber-500',  textClass: 'text-amber-900',   dotClass: 'bg-amber-500',  priceBelow30: 18.80, priceAbove30: 15.86 },
  { id: 'black',        name: 'Germânia Black',        colorHex: '#27272A', bgClass: 'bg-zinc-900/10',    borderClass: 'border-zinc-700',   textClass: 'text-zinc-900',    dotClass: 'bg-zinc-800',   priceBelow30: 22.04, priceAbove30: 18.59 },
  { id: 'ipa',          name: 'Germânia IPA',          colorHex: '#65A30D', bgClass: 'bg-lime-50',        borderClass: 'border-lime-500',   textClass: 'text-lime-900',    dotClass: 'bg-lime-500',   priceBelow30: 23.07, priceAbove30: 19.46 },
  { id: 'amber-lager',  name: 'Germânia Amber Lager',  colorHex: '#EA580C', bgClass: 'bg-orange-50',      borderClass: 'border-orange-400', textClass: 'text-orange-800',  dotClass: 'bg-orange-400', priceBelow30: 22.04, priceAbove30: 18.59 },
  { id: 'slow-beer',    name: 'Germânia Slow Beer',    colorHex: '#C2410C', bgClass: 'bg-orange-100',     borderClass: 'border-orange-500', textClass: 'text-orange-900',  dotClass: 'bg-orange-500', priceBelow30: 18.80, priceAbove30: 15.86 },
]

export const STORES: Store[] = []

export const MOCK_USERS = [
  { id: '1', name: 'Carlos Vendedor',    email: 'vendedor@ligchopp.com.br',     password: 'vendedor123', role: 'vendedor' },
  { id: '2', name: 'Ana Coordenadora',   email: 'coordenador@ligchopp.com.br',  password: 'coord123',    role: 'coordenador' },
  { id: '3', name: 'Lucas Vendedor',     email: 'lucas@ligchopp.com.br',        password: 'vendedor123', role: 'vendedor' },
  { id: '4', name: 'Mariana Vendedora',  email: 'mariana@ligchopp.com.br',      password: 'vendedor123', role: 'vendedor' },
]

export const MOCK_BUDGETS = [
  { id: 'ORC-2026-001', createdAt: '2026-05-06T14:30:00', vendedor: 'Carlos Vendedor',   cliente: 'João da Silva',    estilo: 'Germânia Pilsen',      litros: 50,  total: 722.50,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-002', createdAt: '2026-05-06T16:15:00', vendedor: 'Carlos Vendedor',   cliente: 'Maria Oliveira',   estilo: 'Germânia IPA',         litros: 30,  total: 583.80,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-003', createdAt: '2026-05-07T09:00:00', vendedor: 'Carlos Vendedor',   cliente: 'Roberto Ferreira', estilo: 'Germânia Escuro',      litros: 20,  total: 373.60,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-004', createdAt: '2026-05-07T10:45:00', vendedor: 'Carlos Vendedor',   cliente: 'Fernanda Lima',    estilo: 'Germânia Black',       litros: 100, total: 1859.00, rdStatus: 'Erro' },
  { id: 'ORC-2026-005', createdAt: '2026-05-07T11:20:00', vendedor: 'Carlos Vendedor',   cliente: 'Paulo Mendes',     estilo: 'Germânia Vinho',       litros: 30,  total: 557.70,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-006', createdAt: '2026-05-08T08:45:00', vendedor: 'Lucas Vendedor',    cliente: 'Beatriz Santos',   estilo: 'Germânia Pilsen',      litros: 50,  total: 722.50,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-007', createdAt: '2026-05-08T10:00:00', vendedor: 'Lucas Vendedor',    cliente: 'Thiago Costa',     estilo: 'Germânia Amber Lager', litros: 30,  total: 557.70,  rdStatus: 'Erro' },
  { id: 'ORC-2026-008', createdAt: '2026-05-09T09:30:00', vendedor: 'Mariana Vendedora', cliente: 'Camila Rocha',     estilo: 'Germânia Vinho',       litros: 60,  total: 1114.20, rdStatus: 'Enviado' },
  { id: 'ORC-2026-009', createdAt: '2026-05-09T14:00:00', vendedor: 'Mariana Vendedora', cliente: 'Eduardo Alves',    estilo: 'Germânia Puro Malte',  litros: 40,  total: 634.40,  rdStatus: 'Enviado' },
  { id: 'ORC-2026-010', createdAt: '2026-05-10T11:15:00', vendedor: 'Lucas Vendedor',    cliente: 'Renata Gomes',     estilo: 'Germânia IPA',         litros: 50,  total: 973.50,  rdStatus: 'Enviado' },
]
