import { Icon } from '../components/Icon'
import { SpecularButton } from '../components/SpecularButton'
import { LightBeam } from '../components/hero/LightBeam'
import { footer } from '../data/content'

/**
 * Footer em três camadas, de baixo para cima:
 *   1. fundo preto (a própria <footer>, com overflow escondido)
 *   2. faixa do feixe de luz — o MESMO shader do hero, só reposicionado
 *   3. conteúdo (CTA) + linha de links presa no rodapé
 *
 * A palavra gigante em contorno que ficava aqui virou o H1 do hero. Repetida
 * nas duas pontas ela deixava de ser o retrato da marca e virava textura.
 */
export function Footer() {
  return (
    <footer
      id="contato"
      className="relative flex min-h-viewport flex-col items-center overflow-hidden bg-frame px-[6vw] pb-12 pt-[16vh]"
    >
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

        {/* Link de texto, e não um segundo botão — a razão está no
            `content.pt.ts`, junto da copy. */}
        <p className="mt-5 text-[13px] text-ink/35">
          {footer.email.prefix}{' '}
          <a
            href={`mailto:${footer.email.address}`}
            className="text-ink/60 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/50"
          >
            {footer.email.address}
          </a>
        </p>
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
