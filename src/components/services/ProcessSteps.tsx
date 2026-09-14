import { services } from '../../data/content'

/**
 * O trabalho que se repete hoje e o que ele vira — o painel da faixa de
 * Automação.
 *
 * Ocupa o lugar de uma grade de logos de ferramentas. Logo responde "com o que
 * vocês trabalham"; a pergunta que o cliente faz antes dessa é "serve para
 * mim?", e uma parede de marcas que ele não reconhece responde que não.
 *
 * **Era uma sequência de quatro etapas ligadas por um fio**, e a forma estava
 * errada duas vezes. Colidia com o painel da seção 02 — os dois eram uma lista
 * vertical numerada com fio entre os marcadores, ao lado do texto, e os dois
 * iam de "conversa" a "no ar" — e, pior, etapas respondem "como funciona",
 * enquanto a pergunta desta faixa é "cabe na minha operação".
 *
 * Isso se responde com RECONHECIMENTO, não com procedimento: a coluna da
 * esquerda tem que ser o dia do cliente, para ele se ver nela antes de olhar a
 * direita. Quem argumenta tempo é a seção 02, onde a linha do tempo é a forma
 * certa porque o argumento é o mesmo dia. Não devolva etapas numeradas aqui
 * sem mexer lá primeiro.
 *
 * A linha do rodapé é a mais importante do painel: é ela que tira o pé do
 * cliente da dúvida de precisar ter alguma coisa pronta antes de chamar.
 */
export function ProcessSteps() {
  const { eyebrow, columns, rows, note } = services.process

  return (
    <div className="p-8 md:p-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/30">{eyebrow}</p>

      {/*
        O mesmo `grid-template` no cabeçalho e nas linhas é o que mantém as duas
        colunas alinhadas — a do meio é o corredor da seta.

        No celular o par empilha, e aí os dois rótulos viram uma linha só com a
        seta entre eles: separados, cada um ficaria longe da coluna que nomeia.
      */}
      <div className="mt-7 flex gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/25 md:grid md:grid-cols-[1fr_28px_1fr] md:gap-0">
        <span>{columns.before}</span>
        <span aria-hidden className="md:hidden">
          →
        </span>
        <span className="md:col-start-3">{columns.after}</span>
      </div>

      <ul className="mt-2 divide-y divide-white/6 border-y border-white/6">
        {rows.map((row) => (
          <li
            key={row.after}
            className="grid gap-1 py-3.5 md:grid-cols-[1fr_28px_1fr] md:items-center md:gap-0"
          >
            <span className="text-[13px] leading-snug text-ink/40">{row.before}</span>

            {/* Só no desktop: empilhado, a seta cairia entre as duas linhas do
                par e apontaria para o lado errado. Lá o que liga os dois é a
                diferença de tinta. */}
            <span aria-hidden className="hidden font-mono text-[12px] text-(--accent)/60 md:block">
              →
            </span>

            <span className="text-[13px] leading-snug text-ink-bright">{row.after}</span>
          </li>
        ))}
      </ul>

      <p className="mt-7 max-w-md text-[13px] leading-relaxed text-ink/45">{note}</p>
    </div>
  )
}
