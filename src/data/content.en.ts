/**
 * Copy do site em inglês. Espelha a forma do `content.pt.ts` — mesmas chaves,
 * mesma ordem, mesmos valores estruturais (`accent`, `visual`, `icon`, `slug`).
 * O que muda é só o texto e as mensagens que abrem o WhatsApp.
 */

import { waLink } from './contact'
import type { pt } from './content.pt'

const whatsappUrl = waLink("Hi! I came from SOPA's site and I'd like to talk about a project.")

const nav = {
  locale: 'en',
  open: 'Open menu',
  close: 'Close menu',
  links: [
    { label: 'Home', href: '#topo' },
    { label: 'Services', href: '#servicos' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contato' },
  ],
  languageLabel: 'Language',
  languages: [
    { code: 'pt', label: 'PT', href: '/' },
    { code: 'en', label: 'EN', href: '/en/' },
  ],
} as const

const hero = {
  corner: [
    '// flywheel',
    'idea becomes product > product becomes data',
    'data becomes decision > decision becomes idea',
    '// and the circle opens',
  ],
  wordmark: 'SOPA',
  label: 'Agency',
  actions: {
    primary: 'Start a conversation',
    secondary: 'Work in the wild',
  },
  scrollHint: 'Scroll to begin',
  /**
   * As quebras são estruturais, como no português: cada string é uma linha de
   * verdade na tela, e o teto é o que o corpo em `ch` comporta — 46
   * caracteres. Quebre em fim de oração, nunca no meio de um sintagma: a linha
   * é lida sozinha, iluminada, com as vizinhas apagadas.
   */
  story: {
    blocks: [
      {
        tag: '// who',
        lines: [
          'SOPA is a creative and technology agency',
          'working with clients in and beyond Brazil.',
          'Strategy, design, marketing and engineering',
          'on one team, to turn an idea into',
          'a real product — fast.',
        ],
      },
      {
        tag: '// how',
        lines: [
          'We would rather show than explain.',
          'Most first conversations already arrive',
          'with a working preview or a live demo.',
        ],
      },
      {
        tag: '// what',
        lines: [
          'Sites, brands, visuals, automations and',
          'custom systems — for those just starting',
          'and for those already running.',
          'A small team with sharp tools:',
          'from idea to something testable in hours,',
          'and plenty of projects shipped same day.',
        ],
      },
      {
        tag: '// in the end',
        lines: ['Fewer meetings about what could be done.', 'More things ready to try.'],
      },
    ],
  },
}

const services = {
  eyebrow: 'services',
  title: ['Creative work with method.', 'Automation that works.'],
  description:
    'From digital presence to day-to-day operations, we build sites, systems and automations that put ideas live and put work on autopilot.',
  cards: [
    {
      id: 'criacao',
      accent: 'warm',
      icon: 'compass',
      label: 'Creative',
      headline:
        'Sites, brands and digital products that make your business clear, sharp and ready to grow.',
      services: [
        { name: 'Landing pages', detail: 'Pages built to convert.' },
        { name: 'Company sites', detail: 'Your business presented with clarity.' },
        { name: 'Online stores', detail: 'Catalog, cart, checkout and integrations.' },
        { name: 'Visual identity', detail: 'Logo, colors, type and brand direction.' },
        {
          name: 'Product design',
          detail: 'Flows, interfaces and prototypes ready for development.',
        },
      ],
      cta: {
        label: 'Start a project',
        href: waLink(
          "Hi! I came from SOPA's site and I'd like to get a creative project off the ground — a site, a brand or a digital product.",
        ),
      },
      visual: 'works',
    },
    {
      id: 'automacao',
      accent: 'cool',
      icon: 'shuffle',
      label: 'Automation',
      headline:
        'We look at your operation, find where the work repeats itself and automate it — inside the tools you already use.',
      /**
       * Nenhum nome de ferramenta nesta lista, de propósito — a mesma razão do
       * português: o que se contrata é a revisão da operação, e ela cabe em
       * qualquer empresa.
       */
      services: [
        {
          name: 'Operations review',
          detail: 'An x-ray of what gets done by hand today and what can come off your plate.',
        },
        { name: 'Automated support', detail: 'Instant answers, around the clock.' },
        {
          name: 'AI agent',
          detail:
            'Follows the conversation, answers in your voice and hands off to a human when it should.',
        },
        {
          name: 'Lead qualification',
          detail: 'Asks the right questions and routes every contact to the next step.',
        },
        {
          name: 'Campaigns and follow-up',
          detail: 'Sends, reminders, collections and win-backs.',
        },
        {
          name: 'Integrations',
          detail: 'Connects what the company already runs — in-house systems included.',
        },
      ],
      cta: {
        label: 'Request a review',
        href: waLink(
          "Hi! I came from SOPA's site and I'd like a review of my operation to find out what can be automated.",
        ),
      },
      visual: 'process',
    },
  ],
  works: [
    { slug: 'nogglesboard', name: 'Noggles Board', href: 'https://www.nogglesboard.wtf/' },
    { slug: 'gnars', name: 'Gnars', href: 'https://gnars.com/' },
    { slug: 'swaps', name: 'Swaps', href: 'https://www.swaps.pro/' },
    { slug: 'slop', name: 'Slop', href: 'https://www.slop.fi/' },
  ],
  process: {
    eyebrow: 'how it starts',
    steps: [
      {
        n: '01',
        name: 'Conversation',
        detail: 'Twenty minutes looking at the operation as it is today — not as it should be.',
      },
      {
        n: '02',
        name: 'Review',
        detail:
          'We map what gets redone by hand, what falls through the cracks and what holds things up.',
      },
      {
        n: '03',
        name: 'Proposal',
        detail: 'What to automate first, what we can measure and what it costs. Fixed scope.',
      },
      {
        n: '04',
        name: 'Live',
        detail: 'We build it, wire it into what exists and stay with it after it goes live.',
      },
    ],
    note: 'Works with whatever your company already has — WhatsApp, a spreadsheet, a CRM, something built in-house. Or with what does not exist yet.',
  },
} as const

const faq = {
  eyebrow: 'faq',
  title: ['Frequently asked', 'questions'],
  description:
    'What people ask before signing: how it starts, how long it takes, how the contract works and who runs the project once it is live.',
  items: [
    {
      icon: 'compass',
      question: 'How does a project with SOPA start?',
      answer:
        'It starts with a conversation of about 20 minutes, where we show a preview of the project and agree on timeline and budget. Once the proposal is approved, the team builds what is missing and delivers the project the same day.',
    },
    {
      icon: 'clock',
      question: 'How long does a delivery take?',
      answer:
        'A company site usually takes a few hours. Heavier digital products are ready within a day, always starting from the preview approved in that first conversation.',
    },
    {
      icon: 'doc',
      question: 'Can I hire per project, or does the team stay with me monthly?',
      answer:
        'Both. A defined scope goes out at a fixed price, delivered in one go. When the demand is continuous, there is a monthly plan with the team on call — you send the priority for the week and it enters the queue.',
    },
    {
      icon: 'sparkle',
      question: 'Do I need a finished brand before calling you?',
      answer:
        'No. If one exists, we work on top of what is standing. If it does not, the strategy and brand track handles that before product design begins.',
    },
    {
      icon: 'shuffle',
      question: 'Who takes care of the site once it is live?',
      answer:
        'You decide. We hand over documented code for your team to own, or we stay on with a plan for maintenance and continuous work.',
    },
    {
      icon: 'globe',
      question: 'Do you work with clients outside Brazil?',
      answer:
        'Yes. The team is remote and has worked across time zones. Meetings in English or Portuguese, either way.',
    },
    {
      icon: 'users',
      question: 'What is day-to-day work with your team like?',
      answer:
        'A direct WhatsApp channel for the day to day and a Google Meet call at every delivery, to line up priorities and show what is already standing. No middle layer between whoever decides and whoever builds.',
    },
    {
      icon: 'cube',
      question: 'Will you take over a project that is already halfway?',
      answer:
        'Yes. We start by reading the code and the design that already exist and agree with you on what does and does not hold up. Out of that comes a clear plan: what can be kept, what has to be rebuilt, and a timeline as short as starting from scratch.',
    },
  ],
} as const

const footer = {
  title: ['Good work', 'keeps paying off'],
  /** Quebras de linha na mão: cada item é uma linha do bloco centralizado. */
  lede: [
    'The delivery does not end at launch. We build products, brands',
    'and systems made to keep working, keep evolving and keep',
    'paying off long after they go live.',
  ],
  cta: { label: 'Get a project off the ground', href: whatsappUrl },
  /** Links externos (href com http) abrem em outra aba; '#' fica como placeholder. */
  links: [
    // sem perfil ainda: manda pro Instagram e pronto
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/sopa-agency/?viewAsMember=true' },
    { label: 'X', href: 'https://x.com/sopa_agency' },
  ],
  legal: `© SOPA · ${new Date().getFullYear()}`,
} as const

/**
 * O `satisfies` cobra as chaves de primeiro nível: esquecer uma seção inteira
 * quebra o build. Chave de prosa que falte não é pega aqui — aparece como
 * texto vazio ao abrir o `/en/`.
 */
export const en = {
  nav,
  hero,
  services,
  faq,
  footer,
  whatsappUrl,
} satisfies Record<keyof typeof pt, unknown>
