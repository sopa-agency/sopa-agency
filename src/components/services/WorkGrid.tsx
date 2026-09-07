import { useEffect, useRef } from 'react'

import { services } from '../../data/content'

/**
 * Grade de trabalhos do card de Criação: quatro sites no ar, cada um abrindo
 * em outra aba.
 *
 * O arquivo é resolvido por `slug`, não por caminho escrito à mão: os globs
 * abaixo varrem `src/assets/trabalhos` em build time e casam `<slug>.<ext>`.
 * Havendo um `.mp4`, o trabalho aparece em movimento, com a imagem de mesmo
 * slug servindo de cartaz; havendo só imagem, ela fica parada; não havendo
 * nada, sobra o placeholder hachurado. Publicar um trabalho continua sendo
 * soltar arquivo na pasta.
 */
const CLIPS = import.meta.glob('../../assets/trabalhos/*.mp4', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const SHOTS = import.meta.glob('../../assets/trabalhos/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const bySlug = (files: Record<string, string>, slug: string) =>
  Object.entries(files).find(([path]) => path.includes(`/${slug}.`))?.[1]

export function WorkGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {services.works.map((work) => {
        const clip = bySlug(CLIPS, work.slug)
        const shot = bySlug(SHOTS, work.slug)

        return (
          <a
            key={work.slug}
            href={work.href}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <div className="aspect-16/10 overflow-hidden rounded-lg border border-white/6 bg-white/2 transition-colors group-hover:border-(--accent)/40">
              {clip ? (
                <Clip src={clip} poster={shot} name={work.name} />
              ) : shot ? (
                <img
                  src={shot}
                  alt={`Site ${work.name}`}
                  loading="lazy"
                  className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-hatch text-[10px] tracking-[0.08em] text-ink/25">
                  {new URL(work.href).hostname.replace('www.', '')}
                </span>
              )}
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink/45 transition-colors group-hover:text-ink">
              {work.name}
              <span aria-hidden className="text-[11px] text-ink/30 group-hover:text-(--accent)">
                ↗
              </span>
            </p>
          </a>
        )
      })}
    </div>
  )
}

/**
 * Clipe do trabalho: sem som, em laço e sem controles — é ilustração, não
 * vídeo para assistir.
 *
 * `preload="none"` mais o observer fazem as vezes do `loading="lazy"`, que não
 * existe em vídeo: o arquivo só começa a baixar quando o trabalho chega perto
 * da tela, e pausa ao sair. Com movimento reduzido no sistema, nada toca e o
 * cartaz fica no lugar — a imagem parada do primeiro quadro.
 */
function Clip({ src, poster, name }: { src: string; poster?: string; name: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '200px' },
    )
    visibility.observe(video)

    return () => visibility.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={`Site ${name} em movimento`}
      className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
    />
  )
}
