import { services } from '../../data/content'

/**
 * Como um contrato de automação começa, em quatro passos ligados por um fio.
 *
 * Ocupa o lugar de uma grade de logos de ferramentas. Logo responde "com o que
 * vocês trabalham"; a pergunta que o cliente faz antes dessa é "serve para
 * mim?", e uma parede de marcas que ele não reconhece responde que não. Aqui o
 * que se mostra é o que ele contrata — a revisão —, e revisão cabe em qualquer
 * operação.
 *
 * A linha do rodapé é a mais importante do painel: é ela que tira o pé do
 * cliente da dúvida de precisar ter alguma coisa pronta antes de chamar.
 */
export function ProcessSteps() {
  const { eyebrow, steps, note } = services.process

  return (
    <div className="p-8 md:p-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/30">{eyebrow}</p>

      <ol className="mt-8">
        {steps.map((step, i) => (
          <li key={step.n} className="relative flex items-start gap-5 pb-9 last:pb-0">
            {/* Fio ligando um passo ao próximo — o último não tem para onde ir.
                Some de cima para baixo: cheio onde sai da bolinha, apagado onde
                chega na seguinte, senão o traço reto vira grade de tabela. */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute bottom-0 left-[15px] top-9 w-px bg-linear-[180deg,rgba(255,255,255,0.16),transparent]"
              />
            )}

            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-(--accent)/35 font-mono text-[11px] text-(--accent)">
              {step.n}
            </span>

            <div className="pt-0.5">
              <p className="text-[15px] text-ink-bright">{step.name}</p>
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-ink/45">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-9 max-w-md border-t border-white/8 pt-7 text-[13px] leading-relaxed text-ink/45">
        {note}
      </p>
    </div>
  )
}
