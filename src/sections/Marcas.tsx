import { marcas } from '../data/content'

/**
 * Faixa das marcas que já passaram pela SOPA, entre os serviços e o FAQ.
 *
 * São cards em duas fileiras correndo em sentidos opostos. O sentido contrário
 * é o que faz a coisa ler como movimento e não como uma esteira: duas fileiras
 * no mesmo sentido viram um bloco só deslizando, e o olho para de registrar que
 * há cards individuais ali.
 *
 * O arquivo de cada logo é resolvido por `slug`, e não por caminho escrito à
 * mão: o glob varre `src/assets/marcas` em build time e casa `<slug>.<ext>`. É
 * o mesmo recurso do `WorkGrid`, e pela mesma razão — publicar uma marca é
 * soltar o arquivo na pasta e citar o slug na copy. Marca sem arquivo mostra só
 * o nome, e o card continua de pé.
 */
const LOGOS = import.meta.glob('../assets/marcas/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const bySlug = (slug: string) =>
  Object.entries(LOGOS).find(([path]) => path.includes(`/${slug}.`))?.[1]

export function Marcas() {
  const meio = Math.ceil(marcas.itens.length / 2)
  const fileiras = [marcas.itens.slice(0, meio), marcas.itens.slice(meio)]

  return (
    <section
      aria-label={marcas.label}
      className="relative isolate overflow-hidden border-y border-white/5 bg-frame py-14 md:py-20"
    >
      <p className="mb-9 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink/30 md:mb-12">
        {marcas.eyebrow}
      </p>

      {/*
        As máscaras laterais desfazem o corte seco nas bordas: sem elas os cards
        aparecem e somem de uma vez, e a fila deixa de parecer contínua.
      */}
      <div className="flex flex-col gap-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:gap-5">
        {fileiras.map((fileira, linha) => (
          <ul
            key={linha}
            className="marquee flex w-max gap-4 md:gap-5"
            // a de baixo corre para o outro lado
            style={linha === 1 ? { animationDirection: 'reverse' } : undefined}
          >
            {/*
              O conteúdo aparece DUAS vezes e a fila anda -50%: quando a
              primeira cópia termina de sair, a segunda está exatamente onde a
              primeira começou, e o salto de volta a zero não se vê. A segunda
              cópia é `aria-hidden` — para quem ouve a página, a lista tem o
              tamanho que tem.
            */}
            {[0, 1].map((copia) =>
              fileira.map((marca) => (
                <li key={`${copia}-${marca.slug}`} aria-hidden={copia === 1 || undefined}>
                  <Card marca={marca} />
                </li>
              )),
            )}
          </ul>
        ))}
      </div>
    </section>
  )
}

function Card({ marca }: { marca: (typeof marcas.itens)[number] }) {
  const src = bySlug(marca.slug)

  return (
    <article className="flex h-full w-[260px] flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 md:w-[300px] md:p-5">
      <header className="flex items-center gap-2.5">
        {/*
          Em cor, e sem filtro nenhum: a cor da marca É o ponto da faixa. O
          tratamento mora na imagem, não aqui — o README da pasta explica o que
          cada arquivo recebeu (fundo tirado por cor, recorte rente, e o
          quase-preto clareado só em quem só existia em versão escura).
        */}
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-4 w-auto max-w-[76px] object-contain md:h-[18px]"
          />
        ) : null}
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/40">
          {marca.nome}
        </span>
      </header>

      <p className="text-[13px] leading-[1.5] text-ink/55 md:text-[14px]">{marca.depoimento}</p>
    </article>
  )
}
