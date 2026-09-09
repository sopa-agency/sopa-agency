import type { CSSProperties } from 'react'

import { Icon } from '../components/Icon'
import { SectionHeading } from '../components/SectionHeading'
import { SpecularButton } from '../components/SpecularButton'
import { ProcessSteps } from '../components/services/ProcessSteps'
import { WorkGrid } from '../components/services/WorkGrid'
import { services } from '../data/content'
import { useEnterProgress } from '../hooks/useEnterProgress'

const ACCENTS = {
  warm: 'var(--color-accent-warm)',
  cool: 'var(--color-accent-cool)',
} as const

/** Cada faixa escolhe o painel que vai ao lado do texto. */
const VISUALS = {
  works: WorkGrid,
  process: ProcessSteps,
} as const


type Card = (typeof services.cards)[number]

/**
 * Duas faixas de largura inteira, uma por frente de trabalho, na MESMA
 * disposição: texto à esquerda, painel à direita. Ler duas faixas iguais é uma
 * leitura só, feita duas vezes — alternando o lado, o olho recomeça do zero na
 * segunda e o paralelo entre as duas frentes se perde.
 *
 * Eram dois cards gêmeos lado a lado, e a simetria custava caro dos dois lados:
 * os clipes dos trabalhos — a coisa mais forte da página — ficavam com um quarto
 * da largura e não se enxergavam, e a lista de serviços vivia escondida atrás de
 * um "ver os serviços" porque não cabia aberta. Em faixa, a lista fica sempre
 * aberta e os clipes dobram de tamanho.
 */
export function Services() {
  const ref = useEnterProgress()

  return (
    <section
      ref={ref}
      id="servicos"
      /*
       * A seção sobe POR CIMA do hero em vez de empurrá-lo para fora: a margem
       * negativa a faz começar antes do fim do track, o `z-10` a põe na frente
       * e o fundo opaco cobre. A sombra para cima marca a beirada do painel,
       * senão ele encosta no hero sem que se perceba que é uma camada.
       *
       * **Os 40vh são o `CURTAIN` do `useHeroScroll` vistos daqui** — a mesma
       * sobreposição, escrita nos dois lugares. Mudar um sem o outro faz o
       * progresso do hero terminar em hora diferente da que a cortina começa.
       * Já foi uma tela inteira: o hero ficava preso e imóvel o caminho todo, e
       * uma tela de nada se mexendo lê como fim de página. Com 40vh ele solta a
       * fixação cedo e desliza junto com o painel que sobe.
       */
      className="relative z-10 -mt-[40vh] bg-surface px-6 py-28 shadow-[0_-32px_64px_-24px_rgba(0,0,0,0.85)] sm:px-10 md:py-40"
    >
      {/*
        Parallax de entrada: o cabeçalho e as faixas sobem a partir de baixo em
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
          className="mt-20 will-change-transform md:mt-28"
          style={{
            transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 96px), 0)',
            opacity: 'calc(0.35 + 0.65 * var(--enter, 1))',
          }}
        >
          {services.cards.map((card, i) => (
            <ServiceBand key={card.id} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceBand({ card, index }: { card: Card; index: number }) {
  const Visual = VISUALS[card.visual]

  return (
    <article
      className={`grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16 ${
        index > 0 ? 'mt-20 border-t border-white/6 pt-20 md:mt-28 md:pt-28' : ''
      }`}
      style={{ '--accent': ACCENTS[card.accent] } as CSSProperties}
    >
      <div>
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-(--accent)">
          <Icon name={card.icon} className="size-4" />
          {card.label}
          <span className="text-ink/20">/</span>
          <span className="text-ink/30">{String(index + 1).padStart(2, '0')}</span>
        </p>

        <h3 className="mt-5 max-w-lg font-serif text-[clamp(24px,2.9vw,36px)] leading-[1.2] text-ink-bright">
          {card.headline}
        </h3>

        {/* Sempre aberta. Fechada atrás de um botão, a lista de serviços era a
            única resposta à pergunta "o que exatamente vocês fazem?" — e ficava
            a um clique de distância de quem ainda nem sabia se devia perguntar. */}
        <ul className="mt-8 divide-y divide-white/6 border-y border-white/8">
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

        <SpecularButton
          href={card.cta.href}
          target="_blank"
          rel="noreferrer"
          radius={8}
          className="mt-8 w-fit rounded-lg border border-white/8 bg-white/4 px-7 py-4 text-sm text-ink/80 hover:border-white/20 hover:text-ink"
        >
          <Icon name={card.cta.icon} className="size-4" />
          {card.cta.label}
        </SpecularButton>
      </div>

      {/* Centrado, não esticado: os dois painéis têm altura própria — as
          proporções dos thumbs num, os quatro passos no outro. Esticados até a
          altura da coluna de texto, o vão sobrava DENTRO deles, e no processo
          isso abria um buraco de mais de cem pixels entre um passo e o
          seguinte. Vão simétrico em volta lê como respiro; vão no meio da
          lista lê como defeito. */}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
        <Visual />
      </div>
    </article>
  )
}
