/** Cabeçalho padrão das seções: eyebrow monoespaçada + título em display. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  /** String única ou uma linha por item (cada uma vira uma quebra própria). */
  title: string | readonly string[]
  description?: string
  align?: 'left' | 'center'
}) {
  const lines = typeof title === 'string' ? [title] : title
  const centered = align === 'center'

  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/35">{eyebrow}</p>
      <h2 className="mt-5 font-display text-[clamp(28px,4.5vw,52px)] font-medium leading-[1.08] tracking-[-0.01em] text-ink-bright">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      {description ? (
        <p className={`mt-5 text-sm leading-relaxed text-ink/50 ${centered ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
