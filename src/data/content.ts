/**
 * Camada de conteúdo — toda a copy do site mora aqui.
 * Texto genérico de partida: ajuste à vontade sem tocar nos componentes.
 */

/**
 * Contato — todo botão de "entre em contato" do site sai daqui.
 * `whatsapp` é só dígitos, no formato internacional: 55 + DDD + número.
 */
export const contact = {
  // número de teste — trocar pelo da SOPA antes de publicar
  whatsapp: '5521999123641',
  message: 'Oi! Vim pelo site da SOPA e quero conversar sobre um projeto.',
} as const

/** Link pronto do WhatsApp, com a mensagem já digitada na conversa. */
export const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
  contact.message,
)}`

/**
 * Menu do canto superior direito. Os `href` apontam para os `id` das seções —
 * mexer num, mexer no outro.
 */
export const nav = {
  open: 'Abrir menu',
  close: 'Fechar menu',
  links: [
    { label: 'Início', href: '#topo' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Perguntas frequentes', href: '#faq' },
    { label: 'Contato', href: '#contato' },
  ],
  cta: { label: 'Entre em contato', href: whatsappUrl },
  /**
   * Controles que só existem dentro do menu. Ainda são maquete: estão aqui
   * para ver como ficam, e seguem `disabled` até haver o que ligar neles —
   * um idioma inglês escrito e uma paleta clara desenhada.
   */
  settings: {
    languages: [
      { code: 'pt', label: 'PT' },
      { code: 'en', label: 'EN' },
    ],
    theme: { dark: 'Escuro', light: 'Claro' },
  },
} as const

export const hero = {
  corner: [
    '// flywheel',
    'ideia vira produto > produto vira dado',
    'dado vira decisão > decisão vira próxima ideia',
    '// e o círculo se abre',
  ],
  title: ['Sopa', 'Agency'],
  /** Linha do título que vai em preto: o feixe de luz passa por trás dela e a
   *  palavra só se revela quando a luz cruza aquela altura. */
  knockout: 'Agency',
  actions: {
    primary: 'Entre em contato',
    secondary: 'Trabalhos no ar',
  },
  /** Uma linha por item — hoje é uma só, logo abaixo dos botões. */
  subtitle: ['Criação e Tecnologia'],
  /** Dica no pé do hero: some junto com o resto do bloco inicial. */
  scrollHint: 'Arraste para cima',
  /**
   * Texto que atravessa o card enquanto o hero fica preso na viewport.
   * Cada parágrafo é um bloco que acende sozinho ao passar pelo centro da
   * tela — mexer na quantidade muda o ritmo da leitura e pede um ajuste na
   * altura do track em `Hero.tsx`.
   */
  story: {
    paragraphs: [
      'A SOPA é uma agência de criação e tecnologia que atende dentro e fora do ' +
        'Brasil. Estratégia, design, marketing e engenharia na mesma equipe, para ' +
        'transformar ideia em produto de verdade — rápido.',
      'Gostamos de mostrar antes de explicar. Quase sempre o primeiro contato já ' +
        'chega com um preview ou uma demo funcionando.',
      'Sites, marcas, imagens, automações e sistemas sob medida, para quem está ' +
        'começando e para quem já está rodando. Equipe enxuta e ferramenta de ponta: ' +
        'da ideia a algo testável em poucas horas, e muitos projetos entregues no ' +
        'mesmo dia.',
      'Menos reunião sobre o que poderia ser feito. Mais coisa pronta para experimentar.',
    ],
    cta: { label: 'Entre em contato', href: whatsappUrl },
  },
}

export const services = {
  eyebrow: 'serviços',
  title: ['Criação com método.', 'Automação que trabalha.'],
  description:
    'Da presença digital à operação do dia a dia, criamos sites, sistemas e automações que colocam ideias no ar e trabalho no automático.',
  /** Rótulos do botão que abre e fecha a lista de serviços de cada card. */
  toggle: { open: 'Ver os serviços', close: 'Fechar' },
  cards: [
    {
      id: 'criacao',
      accent: 'warm',
      icon: 'compass',
      label: 'Criação',
      headline:
        'Sites, marcas e produtos digitais que deixam seu negócio claro, bonito e pronto para crescer.',
      services: [
        { name: 'Landing pages', detail: 'Páginas focadas em converter.' },
        { name: 'Sites institucionais', detail: 'Sua empresa apresentada com clareza.' },
        { name: 'Lojas virtuais', detail: 'Catálogo, carrinho, checkout e integrações.' },
        { name: 'Identidade visual', detail: 'Logo, cores, tipografia e direção de marca.' },
        {
          name: 'Design de produto',
          detail: 'Fluxos, interfaces e protótipos prontos para desenvolvimento.',
        },
      ],
      cta: 'Entrar em contato',
      ctaIcon: 'whatsapp',
      visual: 'works',
    },
    {
      id: 'automacao',
      accent: 'cool',
      icon: 'shuffle',
      label: 'Automação',
      headline: 'Seu WhatsApp respondendo, qualificando e vendendo por você.',
      services: [
        { name: 'Atendimento automático', detail: 'Respostas instantâneas, 24 horas por dia.' },
        {
          name: 'Agente de IA',
          detail: 'Entende a conversa, responde no seu tom e chama alguém quando precisa.',
        },
        {
          name: 'Qualificação de leads',
          detail: 'Faz as perguntas certas e encaminha cada contato para o próximo passo.',
        },
        {
          name: 'Campanhas e follow-up',
          detail: 'Disparos, lembretes, cobranças e reativação de clientes.',
        },
        {
          name: 'Integrações',
          detail: 'Conecta WhatsApp com CRM, ERP, planilhas e outras ferramentas.',
        },
      ],
      cta: 'Entrar em contato',
      ctaIcon: 'whatsapp',
      visual: 'integrations',
    },
  ],
  /**
   * Trabalhos no ar, mostrados no card de Criação.
   *
   * O print é opcional: enquanto não existir, o slot aparece como placeholder
   * hachurado com o domínio escrito. Para publicar um, salve a imagem em
   * `src/assets/trabalhos/<slug>.png` (webp e jpg também servem) — o componente
   * acha o arquivo pelo slug sozinho, sem precisar mexer aqui.
   */
  works: [
    { slug: 'nogglesboard', name: 'Noggles Board', href: 'https://www.nogglesboard.wtf/' },
    { slug: 'gnars', name: 'Gnars', href: 'https://gnars.com/' },
    { slug: 'swaps', name: 'Swaps', href: 'https://www.swaps.pro/' },
    { slug: 'slop', name: 'Slop', href: 'https://www.slop.fi/' },
  ],
  /**
   * Integrações do card de Automação: ferramentas que o cliente reconhece e já
   * usa, não a stack de quem constrói. `brand` é o desenho da marca; quem ainda
   * não tem cai no monograma, e o `tint` dá cor a ele — sem cor, monograma no
   * meio de logo colorido lê como peça faltando. A cor é da paleta do site, de
   * propósito: não é a da marca e não deve fingir que é. Agrupadas por função — por onde a
   * conversa entra, onde a venda é registrada e o que roda a operação. Cada
   * grupo é uma fileira, e a largura dos tiles se divide entre os itens dele.
   */
  integrationGroups: [
    {
      title: 'Canais',
      items: [
        { monogram: 'WA', label: 'WhatsApp', brand: 'whatsapp' },
        { monogram: 'IG', label: 'Instagram', brand: 'instagram' },
      ],
    },
    {
      title: 'Vendas e CRM',
      items: [
        { monogram: 'HS', label: 'HubSpot', brand: 'hubspot' },
        { monogram: 'PD', label: 'Pipedrive', tint: 'mint' },
        { monogram: 'RD', label: 'RD Station', tint: 'warm' },
      ],
    },
    {
      title: 'Operação',
      items: [
        { monogram: 'BL', label: 'Bling', tint: 'cool' },
        { monogram: 'OM', label: 'Omie', tint: 'mint' },
        { monogram: 'GS', label: 'Planilhas', brand: 'googlesheets' },
        { monogram: 'GC', label: 'Agenda', brand: 'googlecalendar' },
      ],
    },
  ],
} as const

export const faq = {
  eyebrow: 'faq',
  title: ['Perguntas', 'frequentes'],
  description:
    'O que costumam perguntar antes de fechar: como começa, quanto tempo leva, como é o contrato e quem toca o projeto depois que ele entra no ar.',
  items: [
    {
      icon: 'compass',
      question: 'Como começa um projeto com a SOPA?',
      answer:
        'Começa com uma conversa de mais ou menos 20 minutos para apresentar o preview do projeto e alinhar prazo e orçamento. Aprovada a proposta, o time produz o que falta e envia o projeto no mesmo dia.',
    },
    {
      icon: 'clock',
      question: 'Quanto tempo leva uma entrega?',
      answer:
        'Um site institucional costuma levar algumas horas. Produtos digitais mais robustos ficam prontos em até um dia, sempre a partir do preview aprovado na conversa inicial.',
    },
    {
      icon: 'doc',
      question: 'Dá para contratar por projeto ou o time fica comigo todo mês?',
      answer:
        'Os dois. Escopo definido sai por valor fechado, entregue de uma vez. Quando a demanda é contínua, existe um plano mensal com time à disposição — você manda a prioridade da semana e ela entra na fila.',
    },
    {
      icon: 'sparkle',
      question: 'Preciso ter a marca pronta antes de chamar vocês?',
      answer:
        'Não. Se já existe, trabalhamos em cima do que está de pé. Se não existe, a frente de estratégia e marca cuida disso antes do design de produto começar.',
    },
    {
      icon: 'shuffle',
      question: 'Quem cuida do site depois que ele entra no ar?',
      answer:
        'Você decide. Entregamos o código documentado para o seu time assumir, ou seguimos com um plano de manutenção e evolução contínua.',
    },
    {
      icon: 'globe',
      question: 'Vocês atendem fora do Brasil?',
      answer:
        'Sim. O time é remoto e já atendeu clientes em outros fusos. Reuniões em português ou inglês, sem problema.',
    },
    {
      icon: 'users',
      question: 'Como funciona o dia a dia com o time de vocês?',
      answer:
        'Um canal direto no WhatsApp para o dia a dia e uma call no Google Meet a cada entrega, para alinhar prioridades e mostrar o que já está de pé. Sem intermediário entre quem decide e quem executa.',
    },
    {
      icon: 'cube',
      question: 'Vocês assumem projeto que já está no meio do caminho?',
      answer:
        'Sim. Começamos com uma leitura do código e do design que já existem e alinhamos com você o que está e o que não está de acordo. Daí sai um plano claro: o que dá para aproveitar, o que precisa ser refeito e um prazo tão curto quanto o de um projeto começado do zero.',
    },
  ],
} as const

export const footer = {
  /** Palavra gigante em contorno, ancorada no rodapé. */
  wordmark: 'SOPA',
  title: ['Bom trabalho', 'continua rendendo'],
  /** Quebras de linha na mão: cada item é uma linha do bloco centralizado. */
  lede: [
    'A entrega não termina no lançamento. Criamos produtos, marcas e',
    'sistemas feitos para continuar funcionando, evoluindo e gerando',
    'resultado muito depois que entram no ar.',
  ],
  cta: { label: 'Entre em contato', href: whatsappUrl },
  /** Links externos (href com http) abrem em outra aba; '#' fica como placeholder. */
  links: [
    // sem perfil ainda: manda pro Instagram e pronto
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/sopa-agency/?viewAsMember=true' },
    { label: 'X', href: 'https://x.com/sopa_agency' },
  ],
  legal: `© SOPA · ${new Date().getFullYear()}`,
} as const
