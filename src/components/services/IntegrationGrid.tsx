import type { CSSProperties } from 'react'

import { services } from '../../data/content'
import { Icon } from '../Icon'
import { BrandMark } from './BrandMark'

/** Cores de monograma, da paleta do site — nenhuma é a cor da marca. */
const TINTS = {
  warm: 'var(--color-accent-warm)',
  cool: 'var(--color-accent-cool)',
  mint: 'var(--color-accent-mint)',
} as const

type Tint = keyof typeof TINTS

/**
 * Integrações do card de Automação, agrupadas por função: por onde a conversa
 * entra, onde a venda é registrada e o que toca a operação.
 *
 * Antes era uma grade 3×3 de siglas soltas, que obrigava o leitor a reconhecer
 * cada marca para entender o conjunto. Com os grupos, quem não conhece nenhuma
 * das ferramentas ainda sai sabendo o que o agente conversa — e é essa a
 * informação que vende.
 *
 * Cada grupo é uma fileira e os tiles dela dividem a largura entre si, então
 * não sobra buraco onde o grupo tem menos itens.
 */
export function IntegrationGrid() {
  return (
    <div className="flex h-[372px] flex-col justify-between gap-3 overflow-hidden p-4">
      {services.integrationGroups.map((group) => (
        <div key={group.title}>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/30">
            {group.title}
          </p>

          <div className="mt-2 flex gap-2">
            {group.items.map((item) => (
              <Tile
                key={item.label}
                monogram={item.monogram}
                label={item.label}
                brand={'brand' in item ? item.brand : undefined}
                tint={'tint' in item ? (item.tint as Tint) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Com logo, o logo; sem logo, o monograma — mesma peça, mesmo lugar, mesmo
 * peso visual. O monograma ganha cor própria para não ler como espaço vazio
 * ao lado das marcas coloridas.
 */
function Tile({
  monogram,
  label,
  brand,
  tint,
}: {
  monogram: string
  label: string
  brand?: string
  tint?: Tint
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-white/6 bg-white/2 px-2 py-3">
      <span
        className="flex size-9 items-center justify-center rounded-full bg-(--tint)/12 text-[11px] font-semibold tracking-[0.04em] text-(--tint)"
        style={{ '--tint': tint ? TINTS[tint] : 'var(--accent)' } as CSSProperties}
      >
        <BrandMark name={brand} fallback={monogram} className="size-[18px]" />
      </span>
      <span className="flex w-full min-w-0 items-center justify-center gap-1 text-[10px] text-ink/40">
        <span className="truncate">{label}</span>
        <Icon name="check" className="hidden size-3 shrink-0 text-(--accent)/70 md:block" />
      </span>
    </div>
  )
}
