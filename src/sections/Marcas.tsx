import { marcas } from '../data/content'
import { useEnterProgress } from '../hooks/useEnterProgress'

/**
 * Faixa das marcas que já passaram pela SOPA, correndo devagar entre os
 * serviços e o FAQ.
 *
 * O arquivo de cada logo é resolvido por `slug`, e não por caminho escrito à
 * mão: o glob varre `src/assets/marcas` em build time e casa `<slug>.<ext>`. É
 * o mesmo recurso do `WorkGrid`, e pela mesma razão — publicar uma marca é
 * soltar o arquivo na pasta e citar o slug na copy. Marca sem arquivo aparece
 * com o nome escrito, que é melhor do que um buraco na fila.
 */
const LOGOS = import.meta.glob('../assets/marcas/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const bySlug = (slug: string) =>
  Object.entries(LOGOS).find(([path]) => path.includes(`/${slug}.`))?.[1]

export function Marcas() {
  const ref = useEnterProgress()

  return (
    <section
      ref={ref}
      aria-label={marcas.label}
      className="relative isolate overflow-hidden border-y border-white/5 bg-frame py-14 md:py-20"
    >
      <p
        className="mb-9 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink/30 md:mb-12"
        style={{ transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 24px), 0)' }}
      >
        {marcas.eyebrow}
      </p>

      {/*
        A fila corre por `translateX` de -50%, e o conteúdo aparece DUAS vezes:
        quando a primeira cópia termina de sair, a segunda está exatamente onde
        a primeira começou, e o salto de volta a zero não se vê. É o mesmo
        truque do marquee da Magic UI, sem a dependência — são três linhas de
        CSS, e o resto de lá é configuração que não se usa aqui.

        As máscaras laterais desfazem o corte seco nas bordas: sem elas os logos
        aparecem e somem de uma vez, e a fila deixa de parecer contínua.
      */}
      <div className="[mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        <ul className="marquee flex w-max items-center gap-14 md:gap-24">
          {[0, 1].map((copia) =>
            marcas.itens.map((marca) => (
              <li key={`${copia}-${marca.slug}`} aria-hidden={copia === 1 || undefined}>
                <Logo slug={marca.slug} nome={marca.nome} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  )
}

/**
 * Os arquivos já chegam brancos sobre transparente — a normalização é feita na
 * imagem, não em filtro de CSS, e o README da pasta explica por quê: os logos
 * vêm em registros incompatíveis, uns em preto sobre alfa e outros com o
 * desenho na COR, e nenhum filtro unifica os dois. `brightness-0 invert`
 * transformava os segundos em bolha; `grayscale` apagava os primeiros.
 *
 * Aqui sobra a opacidade, que é o que põe todos no mesmo tom: a fila é sobre
 * QUANTAS marcas, não sobre a paleta de cada uma.
 */
function Logo({ slug, nome }: { slug: string; nome: string }) {
  const src = bySlug(slug)

  if (!src) {
    return (
      <span className="whitespace-nowrap font-display text-[15px] text-ink/35 md:text-[17px]">
        {nome}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={nome}
      loading="lazy"
      decoding="async"
      className="h-6 w-auto object-contain opacity-40 md:h-8"
    />
  )
}
