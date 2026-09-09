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

/** Monta um link do WhatsApp com a mensagem já digitada na conversa. */
export const waLink = (message: string) =>
  `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`

/** Link genérico, para os CTAs que não vêm de um contexto específico. */
export const whatsappUrl = waLink(contact.message)

/**
 * Onde o site pede contato — e onde NÃO pede.
 *
 * O mesmo botão repetido em toda seção deixa de ser convite e vira ruído: se
 * está em todo lugar, não está em lugar nenhum. A página tem quatro pontos de
 * contato, cada um com uma razão diferente para existir:
 *
 *   1. menu       — sempre à mão, para quem já decidiu antes de ler
 *   2. hero       — a porta de entrada, sem contexto ainda
 *   3. serviços   — um por card, com a INTENÇÃO do card na mensagem: quem
 *                   clica em Automação já abre a conversa falando de
 *                   automação. É isso que os faz merecer o lugar; fossem dois
 *                   botões iguais lado a lado, um sobraria.
 *   4. rodapé     — o fecho, para quem leu a página inteira
 *
 * Sem CTA: a narrativa do hero (o botão caía uma tela antes dos serviços, que
 * já pedem contato) e o FAQ (quem está tirando dúvida ainda não decidiu — e o
 * rodapé vem logo depois).
 */

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
  /**
   * O H1 é a palavra gigante em contorno, sozinha no centro do card. `label`
   * fecha o lockup logo abaixo dela, em corpo pequeno e muito espaçado.
   */
  wordmark: 'SOPA',
  label: 'Agency',
  actions: {
    primary: 'Entre em contato',
    secondary: 'Trabalhos no ar',
  },
  /** Dica no pé do hero: some junto com o resto do bloco inicial. */
  scrollHint: 'Arraste para cima',
  /**
   * Texto que atravessa o card enquanto o hero fica preso na viewport.
   * Cada parágrafo é um bloco que acende sozinho ao passar pelo centro da
   * tela — mexer na quantidade muda o ritmo da leitura e pede um ajuste na
   * altura do track em `Hero.tsx`.
   *
   * Sem CTA no fim: o botão ficava a uma tela dos serviços, que já pedem
   * contato. Ver a nota de CTAs no topo do arquivo.
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
  },
}

export const services = {
  eyebrow: 'serviços',
  title: ['Criação com método.', 'Automação que trabalha.'],
  description:
    'Da presença digital à operação do dia a dia, criamos sites, sistemas e automações que colocam ideias no ar e trabalho no automático.',
  /**
   * Duas faixas de largura inteira, alternando o lado do painel visual. Cada uma
   * traz `accent` (a cor que corre pela faixa) e `visual` (qual painel vai ao
   * lado do texto).
   *
   * O `cta` de cada faixa leva ao mesmo WhatsApp, mas com rótulo e mensagem do
   * assunto DELA — a conversa já começa no lugar certo, e os dois botões deixam
   * de ser o mesmo botão duas vezes.
   */
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
      cta: {
        label: 'Começar um projeto',
        icon: 'whatsapp',
        href: waLink(
          'Oi! Vim pelo site da SOPA e quero tirar um projeto de criação do papel — site, marca ou produto digital.',
        ),
      },
      visual: 'works',
    },
    {
      id: 'automacao',
      accent: 'cool',
      icon: 'shuffle',
      label: 'Automação',
      headline:
        'Olhamos a sua operação, achamos onde o trabalho se repete e automatizamos — no sistema que você já usa.',
      /**
       * Nenhum nome de ferramenta nesta lista, de propósito. Ela desfilava CRMs
       * e ERPs que o cliente pode nunca ter ouvido falar, e o recado que sobrava
       * era "só serve se você usa isto". É o contrário: o que se contrata é a
       * revisão da operação, e a tecnologia é problema de quem constrói.
       */
      services: [
        {
          name: 'Revisão da operação',
          detail: 'Um raio-x do que é feito à mão hoje e do que dá para tirar da frente.',
        },
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
          detail: 'Liga o que a empresa já usa — inclusive sistema feito em casa.',
        },
      ],
      cta: {
        label: 'Pedir uma revisão',
        icon: 'whatsapp',
        href: waLink(
          'Oi! Vim pelo site da SOPA e quero uma revisão da minha operação para saber o que dá para automatizar.',
        ),
      },
      visual: 'process',
    },
  ],
  /**
   * Trabalhos no ar, no painel da faixa de Criação.
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
   * Como um contrato de automação começa — o painel da faixa de Automação.
   *
   * Ocupa o lugar de uma grade de logos de ferramentas. Logo responde "com o que
   * vocês trabalham"; a pergunta que o cliente faz antes dessa é "serve para
   * mim?", e uma parede de marcas que ele não reconhece responde que não. O
   * processo responde que sim: o que se contrata é a revisão, e ela cabe em
   * qualquer operação.
   *
   * A `note` é a linha mais importante do bloco — é ela que tira o pé do cliente
   * da dúvida de precisar ter alguma coisa antes de chamar.
   */
  process: {
    eyebrow: 'como entra',
    steps: [
      {
        n: '01',
        name: 'Conversa',
        detail: 'Vinte minutos olhando a operação como ela é hoje — não como deveria ser.',
      },
      {
        n: '02',
        name: 'Revisão',
        detail: 'Mapeamos o que é refeito à mão, o que se perde no meio do caminho e o que atrasa.',
      },
      {
        n: '03',
        name: 'Proposta',
        detail: 'O que automatizar primeiro, o que dá para medir e quanto custa. Escopo fechado.',
      },
      {
        n: '04',
        name: 'No ar',
        detail: 'Construímos, ligamos no que já existe e acompanhamos depois que entra.',
      },
    ],
    note: 'Funciona com o que a sua empresa já tem — WhatsApp, planilha, CRM, sistema feito em casa. Ou com o que ainda nem existe.',
  },
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
