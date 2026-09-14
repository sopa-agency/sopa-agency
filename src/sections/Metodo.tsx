import type { CSSProperties } from 'react'

import { Starfield } from '../components/Starfield'
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
       * enche a tela**, e é o número que evita rolagem em falso. 115vh dão uma
       * tela de card mais ~135px de palco preso, e é aí que o conteúdo termina
       * de assentar: o scroll devolve algo até o fim.
       *
       * Foram 190vh (585px parados) e 135vh (315px). Nos dois a rolagem em
       * falso foi sentida. O engano da primeira vez foi achar que o `hold` do
       * hook resolvia: com o `easeOutCubic`, o grosso do movimento já acontece
       * enquanto o card SOBE, então quando ele prende quase não resta o que
       * animar — palco comprido é palco morto, e não só a folga do fim.
       *
       * No celular não há palco preso: a tela é curta demais para prender e
       * ainda sobrar percurso.
       */
      className="relative isolate z-10 -mt-[70vh] bg-frame md:h-[115vh]"
    >
      {/*
        O palco. As medidas laterais são as MESMAS que o hero usa quando o card
        dele termina de fechar: 16/20px no celular e 64/56px daí para cima. Os
        números estão escritos aqui e lá, e não num token, porque no hero eles
        são multiplicados pelo `--p` a cada frame — ali são uma conta, aqui um
        valor parado.

        **Não há mais card aqui.** Eram um retângulo de 40px de raio, borda de
        1px, degradê e sombra azul — o mesmo objeto do hero subindo no lugar
        dele. Ele saiu: preto sobre preto, o que a borda desenhava era a
        moldura, não o objeto, e a seção lia como um slide dentro da página em
        vez de a página continuando. Sem ele, o conteúdo fica direto sobre o
        campo de estrelas, e o que separa esta seção da anterior é a luz.

        Com o card foram embora o `overflow-hidden` (o recorte do campo de
        estrelas agora é só do invólucro dele), o fio de 2px da aresta e o halo
        que descia dela. O `items-center` era do card e virou do palco.

        **E não há luz colorida saindo do conteúdo.** Houve uma tentativa: o
        halo do card reancorado no topo do bloco, subindo. Não funciona, e o
        motivo é que o halo nunca teve forma própria — quem a dava era o fio de
        2px de cor cheia na aresta, e o halo só punha o brilho atrás dele. Sem o
        fio sobra um borrão colorido de 1240px atravessando o alto da seção.
        Devolver o fio resolveria o borrão e traria de volta uma divisória
        horizontal, que é o que o card tinha de errado. Quem separa esta seção
        da anterior é a costura do topo, o campo de estrelas e o vazio.
      */}
      <div className="relative flex px-4 py-5 md:sticky md:top-0 md:h-viewport md:items-center md:px-16 md:py-14">
        {/*
          O campo de estrelas ocupa a seção inteira, atrás do conteúdo.

          O recorte é obrigatório: o canvas tem `w-screen`, e `100vw` conta a
          largura da barra de rolagem. Solto, ele estoura a página em ~8px de
          cada lado e aparece uma barra horizontal — quem o corta é este
          invólucro.
        */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Starfield />
        </div>

        {/*
          A costura com o hero: o feixe de lá se rasga ao meio e as metades voam
          para fora do quadro; esta faixa ocupa o alto do palco e some para
          cima, então a metade de baixo daquele feixe e a luz daqui viram uma
          só. O `beam-dock` a apaga conforme a seção assenta — ela é a CHEGADA,
          e não o efeito permanente da seção.
        */}
        <span
          aria-hidden
          className="beam-dock pointer-events-none absolute inset-x-4 top-0 h-5 bg-linear-[90deg,transparent,color-mix(in_srgb,var(--color-accent-cool)_34%,transparent)_22%,rgba(255,255,255,0.24)_50%,color-mix(in_srgb,var(--color-accent-warm)_34%,transparent)_78%,transparent] blur-[12px] [mask-image:linear-gradient(0deg,#000_0%,transparent_100%)] md:inset-x-16 md:h-14"
        />

        <div
          /*
           * O bloco inteiro sobe 18vh enquanto o quadro está parado, e por cima
           * disso cada elemento tem o seu próprio curso e atraso. São duas
           * camadas de movimento: esta é a que faz a composição ENTRAR no
           * quadro, e a de cima é a que dá profundidade entre as partes.
           */
          className="relative mx-auto w-full max-w-[1240px] will-change-transform"
          style={{
            transform: 'translate3d(0, calc((1 - var(--enter, 1)) * 18vh), 0)',
          }}
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
    </section>
  )
}

/**
 * Tom de cada parada e do trecho de trilho que sai dela.
 *
 * A linha ACENDE até o fim: sai do frio, vira menta e chega em menta cheia na
 * última parada. Ela já foi preta com borda cinza — apagada, como se a sequência
 * morresse no passo que é justamente o desfecho do argumento ("entregue").
 */
const PARADAS = [
  {
    ponto: 'var(--color-accent-cool)',
    trilho: 'var(--color-accent-cool), var(--color-accent-mint)',
  },
  {
    ponto: 'var(--color-accent-mint)',
    trilho: 'var(--color-accent-mint), var(--color-accent-mint)',
  },
  { ponto: 'var(--color-accent-mint)', trilho: '' },
]

/**
 * O compasso da linha do tempo, em fração de `--linha` (0 → 1 a cada ciclo).
 *
 * `PASSO` é ao mesmo tempo o intervalo entre duas paradas e o curso de um
 * trecho do trilho, e é essa igualdade que faz o encadeamento fechar sozinho:
 * o trecho `i` termina de preencher exatamente em `(i + 1) * PASSO`, que é o
 * instante em que a bolinha seguinte começa a acender. Por isso a velocidade do
 * trilho é o INVERSO do passo — mexeu num, o outro vai junto, ou a bolinha
 * passa a acender antes ou depois da linha encostar nela.
 *
 * Com três paradas, `PASSO` de 0.4 deixa a última acendendo em 0.8 e terminando
 * em 0.925, dentro do 1. Parada nova obriga a refazer a conta.
 *
 * A bolinha é mais rápida que o trilho de propósito: ela é um evento, não um
 * percurso. Com a mesma velocidade o pisca se arrastava por meio trecho e
 * deixava de ser chegada.
 */
const PASSO = 0.4
const V_TRILHO = 1 / PASSO
const V_BOLINHA = 8
const dLinha = (i: number) => i * PASSO

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

      <ol className="linha-traca flex flex-col px-5 py-6 md:px-12 md:py-[52px]">
        {metodo.painel.steps.map((step, i) => {
          const ultimo = i === metodo.painel.steps.length - 1
          const { ponto, trilho } = PARADAS[i]

          return (
            <li
              key={step.title}
              className="enter-rise grid grid-cols-[20px_minmax(0,1fr)]"
              style={{ '--d': 0.34 + i * 0.08, '--r': '28px' } as CSSProperties}
            >
              {/* O trilho vale em qualquer largura. Ele já foi só do desktop
                  porque o carimbo de tempo à esquerda dava a sequência no
                  celular; sem o carimbo, sem o trilho não sobrava nada dizendo
                  que os três blocos são uma linha do tempo. */}
              <span className="flex flex-col items-center self-stretch" aria-hidden>
                <span
                  className="bead-lit mt-[5px] size-[9px] shrink-0 rounded-full"
                  style={
                    {
                      '--bead': ponto,
                      '--d': dLinha(i),
                      '--v': V_BOLINHA,
                    } as CSSProperties
                  }
                />
                {!ultimo && (
                  /*
                   * Dois elementos, e não um: o de fora é o canal APAGADO, que
                   * fica de pé o percurso inteiro mostrando o caminho que ainda
                   * falta, e o de dentro é o traçado que o preenche. Com um só,
                   * a linha crescia contra o fundo do painel e não havia o que
                   * comparar — era o defeito do pulso que morava aqui.
                   */
                  <span className="relative w-px flex-1 bg-[#1c1b19]">
                    <span
                      className="trail-fill absolute inset-0"
                      style={
                        {
                          backgroundImage: `linear-gradient(${trilho})`,
                          '--d': dLinha(i),
                          '--v': V_TRILHO,
                        } as CSSProperties
                      }
                    />
                  </span>
                )}
              </span>

              <div
                className={`flex flex-col gap-1 pl-4 md:gap-2 md:pl-6 ${ultimo ? '' : 'pb-7 md:pb-10'}`}
              >
                <p className="font-display text-[19px] font-medium tracking-[-0.02em] text-ink-bright md:text-[26px]">
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
