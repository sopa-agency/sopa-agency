import { Icon } from '../components/Icon'
import { SpecularButton } from '../components/SpecularButton'
import { LightBeam } from '../components/hero/LightBeam'
import { footer } from '../data/content'

/**
 * Footer em quatro camadas, de baixo para cima:
 *   1. fundo preto (a própria <footer>, com overflow escondido)
 *   2. palavra gigante em contorno, ancorada embaixo, vazando pelas laterais
 *   3. faixa do feixe de luz — o MESMO shader do hero, só reposicionado
 *   4. conteúdo (CTA) + linha de links presa no rodapé
 */
export function Footer() {
  return (
    <footer
      id="contato"
      className="relative flex min-h-viewport flex-col items-center overflow-hidden bg-frame px-[6vw] pb-12 pt-[16vh]"
    >
      <Wordmark />
      <LightBeam className="bottom-[-6%] h-[70%]" />

      <div className="relative z-2 max-w-[820px] text-center">
        <h2 className="mb-8 font-serif text-[clamp(30px,5vw,58px)] font-normal leading-[1.05] text-ink-bright">
          {/* a segunda linha em itálico: o serifado do rodapé é o único lugar
              do site com esse contraste */}
          {footer.title.map((line, i) => (
            <span key={line} className={`block ${i === 1 ? 'italic' : ''}`}>
              {line}
            </span>
          ))}
        </h2>

        <p className="mb-9 text-[15px] leading-relaxed text-ink/50">
          {footer.lede.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <SpecularButton
          href={footer.cta.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/8 bg-surface-raised px-[22px] py-3 text-sm text-ink hover:border-white/25"
        >
          <Icon name="whatsapp" className="size-4" />
          {footer.cta.label}
        </SpecularButton>
      </div>

      {/* No fluxo, empurrada para baixo pelo `mt-auto` — não mais ancorada em
          `absolute`, que a fazia passar por cima do botão em tela baixa. */}
      <div className="relative z-3 mt-auto flex flex-wrap justify-center gap-x-7 gap-y-2 pt-24 text-[11px] uppercase tracking-[0.1em] text-ink/40">
        {footer.links.map((link) => {
          const external = link.href.startsWith('http')

          return (
            <a
              key={link.label}
              href={link.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          )
        })}
        <span>{footer.legal}</span>
      </div>
    </footer>
  )
}

/**
 * Palavra gigante de fundo: preenchimento transparente + contorno fino.
 * Uma segunda cópia por cima, com contorno mais forte, acende num pulso lento.
 */
function Wordmark() {
  const size = 'font-serif text-[clamp(90px,23vw,340px)] tracking-[-0.02em] whitespace-nowrap'

  return (
    <div className="pointer-events-none absolute bottom-[18%] left-1/2 z-0 -translate-x-1/2 leading-none select-none sm:bottom-[6%]">
      <div className={`relative ${size}`}>
        <span className="[-webkit-text-fill-color:transparent] [-webkit-text-stroke:0.75px_var(--color-stroke)]">
          {footer.wordmark}
        </span>
        <span
          aria-hidden
          className="absolute left-0 top-0 animate-breathe opacity-0 [-webkit-text-fill-color:rgba(225,222,218,0.06)] [-webkit-text-stroke:0.75px_var(--color-stroke-glow)]"
        >
          {footer.wordmark}
        </span>
      </div>
    </div>
  )
}
