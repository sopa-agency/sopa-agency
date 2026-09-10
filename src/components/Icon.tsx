type IconName =
  | 'compass'
  | 'code'
  | 'target'
  | 'layers'
  | 'sparkle'
  | 'bolt'
  | 'cube'
  | 'check'
  | 'clock'
  | 'users'
  | 'doc'
  | 'shuffle'
  | 'globe'
  | 'chevron'

const PATHS: Record<IconName, React.ReactNode> = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  code: <path d="m8 6-5 6 5 6M16 6l5 6-5 6" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  layers: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 14l9 5 9-5" />,
  sparkle: <path d="M12 3.5 13.8 10 20 12l-6.2 2L12 20.5 10.2 14 4 12l6.2-2z" />,
  bolt: <path d="M13.5 3 5.5 13.5H11l-.5 7.5 8-10.5H13z" />,
  cube: <path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6zM4 7.6l8 4.4 8-4.4M12 12v8.8" />,
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.4 2.5 4.6-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.8 19.2c.5-3 2.9-4.7 5.7-4.7s5.2 1.7 5.7 4.7M16.5 6.4a3 3 0 0 1 0 5.6M18 14.8c1.6.7 2.6 2.2 2.9 4.4" />
    </>
  ),
  doc: (
    <>
      <path d="M6.5 3.5h7l4.5 4.5v12h-11.5z" />
      <path d="M13.2 3.6V8h4.6M9.2 12.5h5.6M9.2 16h5.6" />
    </>
  ),
  shuffle: <path d="M3.5 6.5h3.2l9.8 11h3.5M3.5 17.5h3.2l3.5-4M14 8.5l2.5-2h3.5M17.8 4.5 20.5 6.5l-2.7 2M17.8 15.5l2.7 2-2.7 2" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.6 12h16.8M12 3.6c2.2 2.4 3.3 5.3 3.3 8.4s-1.1 6-3.3 8.4c-2.2-2.4-3.3-5.3-3.3-8.4s1.1-6 3.3-8.4Z" />
    </>
  ),
  chevron: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
}

/** Ícones em traço, herdando `currentColor` e o tamanho passado. */
export function Icon({
  name,
  className = 'size-4',
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}

export type { IconName }
