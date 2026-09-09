import type { Ref } from 'react'

import { hero } from '../../data/content'

/**
 * Texto que atravessa o card do hero enquanto ele fica preso na viewport, no
 * mesmo registro de terminal do bloco do canto: `//` abrindo cada trecho,
 * monoespaçada no corpo, quebras de linha à mão.
 *
 * O bloco é posicionado em absoluto e o `useHeroScroll` reescreve o `transform`
 * a cada frame. Cada LINHA — e não cada parágrafo — é a unidade do efeito: o
 * hook mede uma por uma e escreve nelas `--typed` (0 → 1) e a opacidade. A
 * linha surge apagada no pé do card, é acesa da esquerda para a direita por um
 * facho na altura em que se lê, com o cursor na ponta dele, e vai apagando ao
 * sair por cima, como scrollback.
 *
 * Nasce tudo invisível (`opacity-0` e `--typed: 0`) porque quem manda nos dois
 * é o hook, no primeiro frame.
 *
 * Sem utilitário de translate no bloco: no Tailwind v4 eles usam a propriedade
 * `translate`, que compõe com o `transform` inline em vez de substituí-lo — o
 * deslocamento em X sairia dobrado. Quem centraliza é o próprio hook.
 *
 * Sem botão no fim: a narrativa desemboca direto na seção de serviços, que já
 * pede contato — e com o assunto de cada card. Ver a nota de CTAs em
 * `data/content.ts`.
 */
export function HeroStory({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      /*
       * A largura é medida em `ch`, não em pixel: as quebras são à mão, então o
       * que precisa caber é um número de CARACTERES, e é o `ch` que fala essa
       * língua. O corpo encolhe com a tela junto para que a linha mais longa
       * (46 caracteres) nunca refluia — refluindo, o corte da impressão passaria
       * a valer para duas fileiras ao mesmo tempo.
       */
      className="absolute left-1/2 top-1/2 z-2 w-[min(52ch,86vw)] font-mono text-[clamp(11.5px,2.6vw,16px)] leading-[1.9] will-change-transform"
      style={{ transform: 'translate(-50%, 50vh)' }}
    >
      {hero.story.blocks.map((block) => (
        <div key={block.tag} className="mb-[7vh] last:mb-0">
          <Line text={block.tag} tag />
          {block.lines.map((line) => (
            <Line key={line} text={line} />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Uma linha do terminal.
 *
 * `w-fit` importa: o corte da impressão e a posição do cursor são porcentagens
 * da caixa, e só coincidem com o fim do TEXTO se a caixa parar onde o texto
 * para. Numa caixa de largura cheia, o cursor terminaria o percurso no vazio à
 * direita da última letra.
 *
 * O cursor mora fora do `line-typing` de propósito — recortado junto, ele
 * sumiria exatamente onde precisa aparecer.
 */
function Line({ text, tag = false }: { text: string; tag?: boolean }) {
  return (
    <p
      data-line
      /* `--ink-on` e `--ink-off` são os dois tons do facho: a cor de quem já
         foi lido e a de quem ainda não. O comentário abre e fecha mais fraco
         que o corpo — é rótulo, não texto. */
      className={`relative w-fit opacity-0 [--typed:0] ${
        tag
          ? 'mb-1 uppercase tracking-[0.08em] [--ink-off:#e9e7e41f] [--ink-on:#e9e7e48c]'
          : '[--ink-off:#e9e7e433] [--ink-on:var(--color-ink)]'
      }`}
    >
      <span className="line-reading block">{text}</span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[0.42em] block h-[1.05em] w-[1ch]"
        /* acompanha a borda do facho, e não o `--typed` cru: o percurso da
           rampa é `100% + 1.5ch`, e o cursor tem que pousar em cima dela */
        style={{
          left: 'calc(var(--typed, 1) * (100% + 1.5ch) - 1.25ch)',
          opacity: 'var(--caret, 0)',
        }}
      >
        {/* o piscar vai no filho: animação de CSS ganha do estilo inline, e no
            próprio elemento ela atropelaria o `--caret` que o hook escreve */}
        <span className="block size-full animate-caret bg-ink/70" />
      </span>
    </p>
  )
}
