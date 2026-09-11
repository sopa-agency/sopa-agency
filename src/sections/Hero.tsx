import type { CSSProperties } from 'react'

import { SpecularButton } from '../components/SpecularButton'
import { LightBeam } from '../components/hero/LightBeam'
import { Starfield } from '../components/hero/Starfield'
import { hero, whatsappUrl } from '../data/content'
import { useHeroScroll } from '../hooks/useHeroScroll'

/**
 * Corpo da palavra gigante. Amarra o tamanho à MENOR das duas medidas da tela:
 * o `vw` é o que faz dela um retrato de largura inteira e manda no celular, e
 * o `vh` é o teto que a impede de comer a altura de que os botões e a dica de
 * scroll precisam embaixo — numa janela larga e baixa, só o `vw` a fazia
 * encostar neles.
 */
const WORDMARK_SIZE = 'text-[clamp(96px,min(36vw,30vh),380px)]'

/**
 * Hero em cinco camadas, de baixo para cima:
 *   1. gradiente escuro do card
 *   2. poeira de estrelas (canvas 2D)
 *   3. faixa do feixe de luz (WebGL), que se abre e sai no primeiro scroll
 *   4. bloco central — a palavra gigante e, pendurado nela, o CTA
 *   5. narrativa que atravessa o card por dentro
 *
 * O track alto + sticky dão a distância de scroll: conforme `--p` vai de 0 a 1
 * o padding cresce e os cantos arredondam, o preto do fundo aparece por trás e
 * o card "se solta" das bordas. Depois disso o texto começa a passar. A altura
 *
 * As últimas telas do track não entram no progresso: um respiro curto, com o
 * último parágrafo já centralizado, e a cortina, em que a seção de serviços
 * sobe por cima do hero parado. Ver `HOLD` e `CURTAIN` no `useHeroScroll` — a
 * altura daqui é 35vh + (CURTAIN + HOLD) × 100vh = 210vh, e os três números andam
 * juntos, mais a margem negativa do `Services`. O `isolate` mantém as camadas do hero num
 * empilhamento próprio, abaixo da seção que cobre.
 * Ver `useHeroScroll` para as faixas de scroll de cada etapa.
 */
export function Hero() {
  const { trackRef, contentRef, beamRef } = useHeroScroll()

  return (
    <div ref={trackRef} id="topo" className="relative isolate h-[210vh] bg-frame">
      <div className="sticky top-0 flex h-viewport items-center justify-center bg-frame">
        <div className="h-full w-full px-[calc(var(--p,0)*16px)] py-[calc(var(--p,0)*20px)] md:px-[calc(var(--p,0)*64px)] md:py-[calc(var(--p,0)*56px)]">
          <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[calc(var(--p,0)*22px)] bg-linear-[180deg,var(--color-hero-top)_0%,var(--color-hero-mid)_42%,var(--color-hero-bot)_78%] px-5 py-[6vh] md:rounded-[calc(var(--p,0)*40px)] md:px-[6vw]">
            {/* Segue o `--hc` do track: some no primeiro empurrão de scroll.
                Ficando, a narrativa passava por cima dele e as duas fontes se
                embaralhavam no canto. `pointer-events-none` porque, apagado,
                ele continua ocupando o canto por onde o texto passa. */}
            <div
              className="pointer-events-none absolute left-[26px] top-[22px] z-2 hidden font-mono text-[11px] uppercase leading-[1.8] tracking-[0.08em] text-ink/30 sm:block"
              style={{ opacity: 'var(--hc, 1)' } as CSSProperties}
            >
              {hero.corner.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <Starfield />
            <LightBeam opening={beamRef} />

            {/*
              A palavra fica no centro EXATO do card, e não centralizada junto
              com o resto: tudo o que vem depois dela — o "Agency" e o bloco de
              CTA — está fora do fluxo, pendurado num `top-full`. Assim a altura
              do wrapper é a da palavra e mais nada, e mexer no que vem embaixo
              não desloca o que é para ficar no meio.

              Transform inline, e não utilitário: no Tailwind v4 o `translate`
              é propriedade própria e comporia com qualquer transform que este
              bloco venha a receber, em vez de substituí-lo.
            */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-2 w-full px-[6vw] text-center select-none"
              style={{ transform: 'translate(-50%, -50%)' } as CSSProperties}
            >
              <h1
                className="relative font-serif leading-[0.82] tracking-[-0.02em] text-ink-bright"
                style={{ opacity: 'var(--hw, 1)' } as CSSProperties}
              >
                {/* `w-fit` + `mx-auto`: a caixa encolhe até a largura da
                    palavra e é ela que se centraliza. Fosse um bloco de
                    largura cheia, as cópias sobrepostas ancorariam no `left-0`
                    do bloco enquanto a original ficaria no meio dele — as três
                    letras sairiam desencontradas. */}
                <span className={`relative mx-auto block w-fit whitespace-nowrap ${WORDMARK_SIZE}`}>
                  {/* Só contorno: o preenchimento fica vazio e é o feixe de
                      luz, passando por trás, que preenche as letras quando
                      cruza a altura delas. */}
                  <span className="[-webkit-text-fill-color:transparent] [-webkit-text-stroke-color:var(--color-stroke)] [-webkit-text-stroke-width:clamp(1px,0.32vw,2.4px)]">
                    {hero.wordmark}
                  </span>

                  {/* Cópia que acende num pulso lento, a mesma do rodapé. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 animate-breathe opacity-0 [-webkit-text-fill-color:rgba(225,222,218,0.05)] [-webkit-text-stroke-color:var(--color-stroke-glow)] [-webkit-text-stroke-width:clamp(1px,0.32vw,2.4px)]"
                  >
                    {hero.wordmark}
                  </span>

                  {/* Facho varrendo o miolo das letras — ver `text-shine`. */}
                  <span aria-hidden="true" className="text-shine absolute left-0 top-0">
                    {hero.wordmark}
                  </span>
                </span>

                {/* Fora do fluxo de propósito: entra no lockup sem empurrar a
                    palavra para cima do centro. O `pl` devolve ao meio o que o
                    espaçamento entre letras rouba — ele sobra depois da última
                    letra e puxa a linha para a esquerda. */}
                <span className="absolute inset-x-0 top-full pt-[clamp(10px,1.2vh,18px)] pl-[0.5em] font-mono text-[clamp(10px,1.1vw,13px)] uppercase tracking-[0.5em] text-ink/40">
                  {hero.label}
                </span>
              </h1>

              {/*
                Sobe e some no primeiro empurrão de scroll, um tempo antes da
                palavra: a cena se limpa de baixo para cima e sobra um instante
                com a marca sozinha no card, antes de o texto começar a passar.

                Empilhados no celular, lado a lado a partir de `sm`. A moldura
                do card cresce com o scroll e come largura; lado a lado, os dois
                botões cabiam no começo e deixavam de caber logo depois — o
                segundo pulava de linha num frame só, e quebra de linha é a
                única coisa aqui que não dá para animar.
              */}
              <div
                ref={contentRef}
                className="pointer-events-auto absolute inset-x-0 top-full pt-[clamp(44px,7vh,96px)]"
                style={
                  {
                    opacity: 'var(--hc, 1)',
                    transform: 'translateY(calc((1 - var(--hc, 1)) * -36px))',
                  } as CSSProperties
                }
              >
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                  <SpecularButton
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    /* Transparente, e não `bg-surface-raised`: o botão vive DENTRO do card, e
                       qualquer cor própria virava um retângulo mais claro flutuando
                       sobre o fundo. Transparente ele bate com o card em qualquer
                       tom que ele venha a ter. Quem marca que este é o primário é o
                       contorno especular, que o secundário não tem. */
                    className="rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm text-ink hover:border-white/25"
                  >
                    {hero.actions.primary}
                  </SpecularButton>
                  <a
                    href="#servicos"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm text-ink transition-colors hover:border-white/25"
                  >
                    {hero.actions.secondary}
                  </a>
                </div>
              </div>
            </div>

            {/* Dica de scroll: herda o `--hc` do track, então some junto com o
                CTA — quando a pessoa já rolou, ela não precisa mais ser
                convidada a rolar. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-2 flex flex-col items-center gap-3"
              style={{ opacity: 'var(--hc, 1)' } as CSSProperties}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/40">
                {hero.scrollHint}
              </span>
              <span className="line-dots block h-10 w-[3px] text-ink/30" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
