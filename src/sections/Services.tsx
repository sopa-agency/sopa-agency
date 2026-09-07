import { useState, type CSSProperties } from 'react'

import { Icon } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { SpecularButton } from '../components/SpecularButton'
import { IntegrationGrid } from '../components/services/IntegrationGrid'
import { WorkGrid } from '../components/services/WorkGrid'
import { services, whatsappUrl } from '../data/content'
import { useEnterProgress } from '../hooks/useEnterProgress'

const ACCENTS = {
  warm: 'var(--color-accent-warm)',
  cool: 'var(--color-accent-cool)',
} as const

/** Cada visual define a própria altura — a grade de trabalhos cresce com os thumbs. */
const VISUALS = {
  works: WorkGrid,
  integrations: IntegrationGrid,
} as const

type Card = (typeof services.cards)[number]

/**
 * Dois cards de serviço que abrem em acordeão, cada um por conta própria —
 * dá para deixar os dois abertos e comparar. O grid usa `items-start` de
 * propósito: sem isso o card fechado esticaria junto com o vizinho aberto.
 */
export function Services() {
  const ref = useEnterProgress()

  return (
    <section
      ref={ref}
      id="servicos"
      /*
       * A seção sobe POR CIMA do hero em vez de empurrá-lo para fora: a margem
       * negativa a faz começar uma tela antes, o `z-10` a põe na frente e o
       * fundo opaco cobre. O hero continua preso e imóvel embaixo — a última
       * tela do track dele existe só para isto (ver `CURTAIN` no
       * `useHeroScroll`). A sombra para cima marca a beirada do painel, senão
       * ele encosta no hero sem que se perceba que é uma camada.
       */
      className="relative z-10 -mt-[100vh] bg-surface px-6 py-28 shadow-[0_-32px_64px_-24px_rgba(0,0,0,0.85)] sm:px-10 md:py-40"
    >
      {/*
        Parallax de entrada: o cabeçalho e os cards sobem a partir de baixo em
        velocidades diferentes — 40px contra 96px — enquanto `--enter` vai de 0
        a 1. É a diferença entre os dois que dá profundidade; com um valor só,
        a seção inteira apenas deslizaria. O hero e o feixe não sabem que isto
        existe: o efeito começa e termina dentro desta seção.
      */}
      <div className="mx-auto max-w-6xl">
        <div
          className="will-change-transform"
          style={{ transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 40px), 0)' }}
        >
          <SectionHeading
            eyebrow={services.eyebrow}
            title={services.title}
            description={services.description}
            align="center"
          />
        </div>

        <div
          className="mt-20 grid gap-6 will-change-transform lg:grid-cols-2 lg:items-start"
          style={{
            transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 96px), 0)',
            opacity: 'calc(0.35 + 0.65 * var(--enter, 1))',
          }}
        >
          {services.cards.map((card) => (
            <ServiceCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ card }: { card: Card }) {
  const [isOpen, setIsOpen] = useState(false)
  const Visual = VISUALS[card.visual]
  const panelId = `servico-${card.id}`

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors ${
        isOpen ? 'border-(--accent)/30' : 'border-white/8 hover:border-white/16'
      }`}
      style={{ '--accent': ACCENTS[card.accent] } as CSSProperties}
    >
      <div className="flex flex-1 flex-col p-8">
        {/*
          O corpo inteiro é o gatilho: o cliente clica em qualquer lugar do
          texto para abrir. O CTA fica fora do <button> — link dentro de botão
          é markup inválido e o clique de um comeria o do outro.
        */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="group cursor-pointer text-left"
        >
          <h3 className="text-lg text-(--accent)">{card.label}</h3>
          <p className="mt-2 mb-1 max-w-sm font-serif text-[clamp(19px,2vw,24px)] leading-[1.25] text-ink-bright">
            {card.headline}
          </p>

          {/* o chevron anda junto do rótulo que descreve a ação: separados,
              cada um dizia metade da mesma coisa */}
          <span className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-ink/35 transition-colors group-hover:text-(--accent)">
            {isOpen ? services.toggle.close : services.toggle.open}
            <Icon
              name="chevron"
              className={`size-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/*
          Acordeão por `grid-template-rows`: de 0fr a 1fr o navegador anima até
          a altura real do conteúdo, o que `height: auto` não faz. Quem esconde
          o excesso é o filho com overflow, não o pai.
        */}
        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <ul className="mt-6 divide-y divide-white/6 border-t border-white/8">
              {card.services.map((service) => (
                <li key={service.name} className="py-3.5">
                  <p className="flex items-center gap-2.5 text-[13px] text-ink/85">
                    <span className="size-1 shrink-0 rounded-full bg-(--accent)" />
                    {service.name}
                  </p>
                  <p className="mt-1 pl-[18px] text-[12.5px] leading-relaxed text-ink/40">
                    {service.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SpecularButton
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          radius={8}
          className="mt-8 w-fit self-center rounded-lg border border-white/8 bg-white/4 px-7 py-4 text-sm text-ink/80 hover:border-white/20 hover:text-ink"
        >
          {card.ctaIcon && <Icon name={card.ctaIcon} className="size-4" />}
          {card.cta}
        </SpecularButton>
      </div>

      <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-white/6 bg-card-panel">
        <Visual />
      </div>
    </article>
  )
}
