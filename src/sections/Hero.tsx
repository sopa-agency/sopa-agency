import type { CSSProperties } from 'react'

import { Icon } from '../components/Icon'
import { ScrambleText } from '../components/ScrambleText'
import { SpecularButton } from '../components/SpecularButton'
import { HeroStory } from '../components/hero/HeroStory'
import { LightBeam } from '../components/hero/LightBeam'
import { ShapesField } from '../components/hero/ShapesField'
import { hero, whatsappUrl } from '../data/content'
import { useHeroScroll } from '../hooks/useHeroScroll'

/**
 * Hero em cinco camadas, de baixo para cima:
 *   1. gradiente escuro do card
 *   2. campo de hexágonos em wireframe (canvas 2D, mascarado)
 *   3. faixa do feixe de luz (WebGL)
 *   4. conteúdo inicial — logo, título, botões (some ao rolar)
 *   5. narrativa que atravessa o card por dentro
 *
 * O track alto + sticky dão a distância de scroll: conforme `--p` vai de 0 a 1
 * o padding cresce e os cantos arredondam, o preto do fundo aparece por trás e
 * o card "se solta" das bordas. Depois disso o texto começa a passar. A altura
 * do track é o ritmo da leitura: quanto mais parágrafos na narrativa, mais
 * track para o texto não sair correndo.
 *
 * As últimas telas do track não entram no progresso: uma de respiro, com o CTA
 * já centralizado e nada se mexendo, e uma de cortina, em que a seção de
 * serviços sobe por cima do hero parado. Ver `HOLD` e `CURTAIN` no
 * `useHeroScroll` — a altura daqui é 340vh + (CURTAIN + HOLD) × 100vh, e os
 * três números andam juntos. O `isolate` mantém as camadas do hero num
 * empilhamento próprio, abaixo da seção que cobre.
 * Ver `useHeroScroll` para as faixas de scroll de cada etapa.
 */
export function Hero() {
  const { trackRef, contentRef, storyRef } = useHeroScroll()

  return (
    <div ref={trackRef} id="topo" className="relative isolate h-[500vh] bg-frame">
      <div className="sticky top-0 flex h-viewport items-center justify-center bg-frame">
        <div className="h-full w-full px-[calc(var(--p,0)*16px)] py-[calc(var(--p,0)*20px)] md:px-[calc(var(--p,0)*64px)] md:py-[calc(var(--p,0)*56px)]">
          <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[calc(var(--p,0)*22px)] bg-linear-[180deg,var(--color-hero-top)_0%,var(--color-hero-mid)_42%,var(--color-hero-bot)_78%] px-5 py-[6vh] md:rounded-[calc(var(--p,0)*40px)] md:px-[6vw]">
            <div className="absolute left-[26px] top-[22px] z-2 hidden font-mono text-[11px] uppercase leading-[1.8] tracking-[0.08em] text-ink/30 sm:block">
              {hero.corner.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <ShapesField />
            <LightBeam />

            <div
              ref={contentRef}
              className="absolute left-1/2 top-1/2 z-2 w-full max-w-[900px] px-[6vw] text-center"
              style={
                {
                  opacity: 'var(--hc, 1)',
                  transform: 'translate(-50%, calc(-50% + (1 - var(--hc, 1)) * -40px))',
                } as CSSProperties
              }
            >
              <h1 className="relative mb-[34px] font-display text-[clamp(44px,7.6vw,100px)] font-medium leading-[1.02] tracking-[-0.01em] text-ink-bright">
                {hero.title.map((line) => (
                  <span
                    key={line}
                    className={`block ${line === hero.knockout ? 'text-wine' : ''}`}
                  >
                    {line}
                  </span>
                ))}

                {/* Uma camada de luz por linha, cada uma acendendo só a sua:
                    a de baixo entra com atraso, então o facho varre "Sopa" e
                    depois "Agency", e vem mais fraca, senão o branco sobre o
                    vinho escuro chamaria mais atenção que a linha de cima. */}
                <ShineLayer lit={0} />
                <ShineLayer lit={1} delay="0.8s" className="opacity-40" />
              </h1>

              {/*
                Empilhados no celular, lado a lado a partir de `sm`.
                A moldura do card cresce com o scroll e come largura; lado a
                lado, os dois botões cabiam no começo e deixavam de caber por
                volta de 9% do track — o segundo pulava de linha num frame só,
                e quebra de linha é a única coisa aqui que não dá para animar.
                Empilhado, não há o que reordenar.
              */}
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <SpecularButton
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-surface-raised px-5 py-3 text-sm text-ink hover:border-white/25"
                >
                  <Icon name="whatsapp" className="size-4" />
                  {hero.actions.primary}
                </SpecularButton>
                <a
                  href="#servicos"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm text-ink transition-colors hover:border-white/25"
                >
                  {hero.actions.secondary}
                </a>
              </div>

              {/* mono aqui não é estilo à toa: o texto se remonta sozinho e, em
                  fonte proporcional, cada letra sorteada teria uma largura,
                  fazendo a linha balançar a cada frame */}
              <p className="mt-[34px] font-mono text-sm leading-relaxed tracking-[0.06em] text-ink/55">
                {hero.subtitle.map((line) => (
                  <ScrambleText key={line} text={line} className="block" />
                ))}
              </p>
            </div>

            {/* Dica de scroll: herda o `--hc` do track, então some no mesmo
                ritmo do bloco inicial — quando a pessoa já rolou, ela não
                precisa mais ser convidada a rolar. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[5vh] z-2 flex flex-col items-center gap-4"
              style={{ opacity: 'var(--hc, 1)' } as CSSProperties}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/40">
                {hero.scrollHint}
              </span>
              <span className="line-dots block h-14 w-[3px] text-ink/30" />
            </div>

            <HeroStory ref={storyRef} />
          </section>
        </div>
      </div>
    </div>
  )
}

/**
 * Cópia do título sobreposta, servindo de máscara para o facho de luz — só a
 * linha `lit` acende, as outras entram como espaço em branco.
 *
 * O espaço mantém a altura da linha sem pôr desenho nenhum na máscara, e é por
 * isso que a camada continua do tamanho do bloco inteiro: o degradê é medido
 * pela caixa, então todas as camadas herdam o mesmo ângulo e o mesmo trajeto.
 * Recortar a camada em volta de uma linha só faria cada luz recomeçar dentro
 * da própria caixa, e elas deixariam de parecer a mesma.
 */
function ShineLayer({ lit, delay, className = '' }: { lit: number; delay?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`text-shine pointer-events-none absolute inset-0 select-none ${className}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      {hero.title.map((line, i) => (
        <span key={line} className="block">
          {i === lit ? line : '\u00A0'}
        </span>
      ))}
    </span>
  )
}
