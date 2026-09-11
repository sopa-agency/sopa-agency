import type { CSSProperties } from 'react'

import { metodo } from '../data/content'
import { useStageProgress } from '../hooks/useStageProgress'

/**
 * Seção 02 — "Mostramos antes de explicar".
 *
 * Duas colunas: a afirmação à esquerda, e à direita um painel que a PROVA — uma
 * linha do tempo de três paradas, do começo da conversa ao projeto no ar. O
 * vazio da tela é preenchido por um objeto, não por mais texto, que era o
 * defeito da narrativa que morava aqui antes.
 *
 * As cores desta seção são hexadecimais soltos e não tokens do `@theme`: são
 * nove tons de cinza que só existem aqui, e nove tokens de uso único poluiriam
 * o tema mais do que o organizariam. Os acentos (`f0863c`, `4f9bf0`, `74d6b4`)
 * são os do projeto e estão em variável.
 *
 * Nada aqui é interativo: sem hover, sem clique, sem CTA. O painel é uma
 * imagem-argumento, não um componente — não o faça parecer clicável. E a regra
 * dos dois pontos de contato (hero e rodapé) vale aqui: ver a nota no
 * `data/content.ts`.
 */
export function Metodo() {
  const trackRef = useStageProgress()

  return (
    <section
      ref={trackRef}
      /*
       * Track alto + `sticky` dentro dele: é a mesma armação do hero, e é o que
       * faz esta seção ser um QUADRO em vez de um trecho de página rolando.
       *
       * A diferença importa. Com o quadro parado, o conteúdo que sobe por
       * dentro tem contra o que se mover, e o olho lê uma chegada. Sem ele, o
       * conteúdo acompanha a rolagem e o olho lê só a página passando — foi o
       * que faltou nas tentativas anteriores, e é o que a narrativa antiga
       * tinha de graça por morar dentro do card fixo do hero.
       *
       * Esta seção sobe POR CIMA do hero em vez de empurrá-lo para fora: a
       * margem negativa a faz começar antes do fim do track dele, o `z-10` a
       * põe na frente e o fundo opaco cobre.
       *
       * **Os 70vh decidem QUANDO este card aparece**, e são o único número que
       * controla isso: o card fica visível quando o track dele encosta no pé da
       * tela, ou seja `altura do track do hero − 70vh − uma tela` de rolagem.
       * Aumentar aproxima a chegada, diminuir afasta. O `BEAM_OPEN` do
       * `useHeroScroll` está calibrado para o rasgo acontecer durante essa
       * subida — mexeu aqui, confira lá.
       *
       * A aresta de cima é um fio claro, e não a sombra escura que o `Services`
       * usava: a sombra funcionava quando o card do hero era um degradê cinza,
       * e hoje é preto sobre preto — sem o fio, a cortina sobe invisível.
       *
       * **A altura do track é o que sobra de scroll preso depois que o card
       * enche a tela**, e é o número que evita rolagem em falso. 135vh dão uma
       * tela de card mais ~315px de palco preso: o bastante para a composição
       * assentar e ser lida, e pouco para o scroll deixar de devolver algo.
       *
       * Eram 190vh e davam 585px parados. O engano foi achar que o `hold` do
       * hook resolvia: com o `easeOutCubic`, ~95% do movimento já acontece
       * enquanto o card SOBE, então quando ele prende quase não resta o que
       * animar — o palco comprido inteiro é que estava morto, não só a folga
       * do fim.
       *
       * No celular não há palco preso: a tela é curta demais para prender e
       * ainda sobrar percurso.
       */
      className="relative isolate z-10 -mt-[70vh] bg-frame md:h-[135vh]"
    >
      {/*
        A moldura preta em volta do card, com a MESMA medida que o hero usa
        quando o dele termina de fechar: 16/20px no celular e 64/56px daí para
        cima. Os números estão escritos aqui e lá, e não num token, porque no
        hero eles são multiplicados pelo `--p` a cada frame — ali são uma conta,
        aqui um valor parado.
      */}
      <div className="relative px-4 py-5 md:sticky md:top-0 md:h-viewport md:px-16 md:py-14">
        {/*
          O brilho que SOBE da aresta do card e preenche a moldura preta até o
          card do hero.

          O halo da crista mora dentro do card, e o `overflow-hidden` dele o
          corta: a luz só descia. Ficava uma faixa preta entre a metade de baixo
          do feixe, ainda acesa no card do hero, e a crista do card novo — as
          duas coisas perto e sem se tocarem. Este vive FORA do card, ocupa
          exatamente o padding de cima do palco (a mesma faixa preta) e some
          para cima, então as duas luzes viram uma só.

          Mesma paleta do feixe no eixo X, mesma máscara no eixo Y do halo de
          dentro — só que invertida.
        */}
        <span
          aria-hidden
          className="beam-dock pointer-events-none absolute inset-x-4 top-0 h-5 bg-linear-[90deg,transparent,color-mix(in_srgb,var(--color-accent-cool)_34%,transparent)_22%,rgba(255,255,255,0.24)_50%,color-mix(in_srgb,var(--color-accent-warm)_34%,transparent)_78%,transparent] blur-[12px] [mask-image:linear-gradient(0deg,#000_0%,transparent_100%)] md:inset-x-16 md:h-14"
        />
        {/*
          O card. Mesmo raio e mesmo degradê do card do hero, para os dois
          lerem como o mesmo objeto: um fecha, o outro sobe no lugar dele.
          Ganha uma borda de 1px que o hero não tem — sem ela, card preto sobre
          moldura preta não tem como ser visto, e a seção volta a parecer
          colada nas bordas da tela.
        */}
        <div className="relative flex h-full w-full items-center overflow-hidden rounded-[22px] border border-white/[0.07] bg-linear-[180deg,var(--color-hero-top)_0%,var(--color-hero-mid)_42%,var(--color-hero-bot)_78%] px-5 py-12 shadow-[0_-24px_60px_-20px_rgba(79,155,240,0.10)] md:rounded-[40px] md:px-[clamp(32px,4.5vw,72px)] md:py-[72px]">
          {/*
            O halo. Carrega as cores do feixe no eixo X — frio à esquerda,
            quente à direita, como o `beamShaders` pinta — e some no eixo Y por
            uma máscara. Sem a máscara seria preciso um segundo degradê por
            cima, e aí a cor horizontal se perdia no meio do caminho.
          */}
          <span
            aria-hidden
            className="beam-dock pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-[90deg,transparent,color-mix(in_srgb,var(--color-accent-cool)_34%,transparent)_22%,rgba(255,255,255,0.24)_50%,color-mix(in_srgb,var(--color-accent-warm)_34%,transparent)_78%,transparent] blur-[18px] [mask-image:linear-gradient(180deg,#000_0%,transparent_100%)]"
          />
          {/*
            O fio, com brilho próprio: 2px de cor cheia mais um `box-shadow`
            sem deslocamento, que é o que faz a luz parecer estar NA aresta em
            vez de desenhada em cima dela. As pontas transparentes o matam
            antes dos cantos arredondados.
          */}
          <span
            aria-hidden
            className="beam-dock pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-linear-[90deg,transparent_1%,var(--color-accent-cool)_18%,#fff_50%,var(--color-accent-warm)_82%,transparent_99%] shadow-[0_0_14px_1px_rgba(255,255,255,0.28)]"
          />

          <div
            /*
             * O bloco inteiro sobe 18vh enquanto o quadro está parado, e por cima
             * disso cada elemento tem o seu próprio curso e atraso. São duas
             * camadas de movimento: esta é a que faz a composição ENTRAR no
             * quadro, e a de cima é a que dá profundidade entre as partes.
             */
            className="mx-auto w-full max-w-[1240px] will-change-transform"
            style={{ transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 18vh), 0)' }}
          >
            <div className="flex flex-col gap-7 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-14 lg:gap-24">
              {/* `contents` no celular: os filhos viram itens do flex de fora,
                  e aí o `order-last` do rodapé mono consegue jogá-lo para depois
                  do painel — que é a ordem do desenho. No desktop a coluna volta
                  a existir e o rodapé volta para o lugar dele. */}
              <div className="contents md:flex md:flex-col md:gap-[34px]">
                <p
                  className="enter-rise font-mono text-[11px] uppercase tracking-[0.18em] text-accent-warm md:text-[13px]"
                  style={{ '--d': 0, '--r': '72px' } as CSSProperties}
                >
                  {metodo.eyebrow}
                </p>

                <h2
                  className="enter-rise font-display text-[clamp(38px,9vw,74px)] font-medium leading-[0.96] tracking-[-0.038em] text-ink-bright"
                  style={{ '--d': 0.05, '--r': '64px' } as CSSProperties}
                >
                  {metodo.title}
                </h2>

                {/* Os dois parágrafos vão ao DOM e o CSS escolhe: media query não
                    troca texto, e um listener de resize seria caro para isso. */}
                <p
                  className="enter-rise max-w-[460px] text-[17px] leading-[1.55] text-ink/70 [text-wrap:pretty] md:text-[21px] md:leading-[1.6]"
                  style={{ '--d': 0.1, '--r': '56px' } as CSSProperties}
                >
                  <span className="md:hidden">{metodo.paragraphCurto}</span>
                  <span className="hidden md:inline">{metodo.paragraph}</span>
                </p>

                <div
                  className="enter-rise order-last flex flex-col gap-3 border-t border-[#1e1d1b] pt-6 md:order-none font-mono text-[11px] uppercase leading-[1.2] tracking-[0.1em] text-[#6f6b67] md:gap-3 md:pt-[26px] md:text-[12px]"
                  style={{ '--d': 0.16, '--r': '48px' } as CSSProperties}
                >
                  {metodo.notas.map((nota, i) => (
                    <p
                      key={nota}
                      // a do meio é a que o celular dispensa: em 390px as três viram
                      // um bloco, e ela é a menos decisiva das três
                      className={`${i === 1 ? 'hidden md:block' : ''} ${
                        i === metodo.notas.length - 1 ? 'text-ink' : ''
                      }`}
                    >
                      {nota}
                    </p>
                  ))}
                </div>
              </div>

              <Painel />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Tom do ponto e do trilho de cada parada — o `+02:40` é o clímax e leva halo. */
const PARADAS = [
  { ponto: 'var(--color-accent-cool)', trilho: 'var(--color-accent-cool), var(--color-accent-mint)' },
  { ponto: 'var(--color-accent-mint)', trilho: 'var(--color-accent-mint), #2a2927' },
  { ponto: '#000000', trilho: '' },
]

function Painel() {
  return (
    <div
      className="enter-rise overflow-hidden rounded-xl border border-[#1c1b19] bg-[#050505] md:shadow-[0_40px_120px_rgba(79,155,240,0.07)]"
      style={{ '--d': 0.14, '--r': '128px' } as CSSProperties}
    >
      {/* Barra de chrome: o painel se apresenta como uma janela, e é isso que
          faz a linha do tempo ler como algo que ACONTECEU, não como um
          diagrama. Nada aqui é clicável. */}
      <div className="flex items-center gap-3.5 border-b border-[#171614] px-4 py-3 md:px-5 md:py-4">
        <div className="hidden gap-[7px] md:flex" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-[#2a2927]" />
          ))}
        </div>

        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-mint md:order-2 md:ml-auto md:text-[11px]">
          <span className="size-1.5 rounded-full bg-accent-mint" />
          {metodo.painel.status}
        </span>

        <span className="ml-auto font-mono text-[10px] tracking-[0.1em] text-[#514e4b] md:order-1 md:ml-0 md:text-[11px]">
          {metodo.painel.label}
        </span>
      </div>

      <ol className="flex flex-col gap-[22px] px-5 py-6 md:gap-0 md:px-12 md:py-[52px]">
        {metodo.painel.steps.map((step, i) => {
          const ultimo = i === metodo.painel.steps.length - 1
          const { ponto, trilho } = PARADAS[i]

          return (
            <li
              key={step.stamp}
              className="enter-rise flex items-start gap-3.5 md:grid md:grid-cols-[minmax(0,96px)_20px_minmax(0,1fr)] md:gap-0"
              style={{ '--d': 0.34 + i * 0.08, '--r': '28px' } as CSSProperties}
            >
              <span className="w-16 shrink-0 pt-px font-mono text-[11px] tracking-[0.1em] text-[#6f6b67] md:w-auto md:pt-0.5 md:text-[12px]">
                <span className="md:hidden">{step.stampCurto}</span>
                <span className="hidden md:inline">{step.stamp}</span>
              </span>

              {/* O trilho é só do desktop: em 390px ele encosta no texto e vira
                  risco, e o carimbo à esquerda já dá a sequência. */}
              <span className="hidden flex-col items-center self-stretch md:flex" aria-hidden>
                <span
                  className="mt-[5px] size-[9px] shrink-0 rounded-full"
                  style={{
                    background: ponto,
                    border: ultimo ? '1px solid #3a3835' : undefined,
                    boxShadow: i === 1 ? '0 0 0 5px rgba(116,214,180,.12)' : undefined,
                  }}
                />
                {!ultimo && (
                  <span
                    className="enter-grow w-px flex-1"
                    style={{ backgroundImage: `linear-gradient(${trilho})` }}
                  />
                )}
              </span>

              <div className={`flex flex-col gap-1 md:gap-2 md:pl-6 ${ultimo ? '' : 'md:pb-10'}`}>
                <p
                  className={`font-display text-[19px] font-medium tracking-[-0.02em] md:text-[26px] ${
                    // no celular o destaque migra do ponto (que não existe lá)
                    // para o próprio título
                    i === 1 ? 'text-accent-mint md:text-ink-bright' : 'text-ink-bright'
                  }`}
                >
                  <span className="md:hidden">{step.titleCurto}</span>
                  <span className="hidden md:inline">{step.title}</span>
                </p>
                <p className="text-[15px] leading-[1.45] text-[#8d8985] md:text-[17px] md:leading-[1.5]">
                  <span className="md:hidden">{step.detailCurto}</span>
                  <span className="hidden md:inline">{step.detail}</span>
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
