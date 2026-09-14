/**
 * Copy do site em português. A forma deste arquivo é a forma da locale: o
 * `content.en.ts` repete estas mesmas chaves em inglês, e o `content.ts`
 * escolhe um dos dois. Componente nenhum tem texto embutido.
 */

import { email, waLink } from './contact'

/** Link genérico, para os CTAs que não vêm de um contexto específico. */
const whatsappUrl = waLink('Oi! Vim pelo site da SOPA e quero conversar sobre um projeto.')

/**
 * Menu do canto superior direito. Os `href` apontam para os `id` das seções —
 * mexer num, mexer no outro.
 */
const nav = {
  locale: 'pt',
  open: 'Abrir menu',
  close: 'Fechar menu',
  links: [
    { label: 'Início', href: '#topo' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Perguntas frequentes', href: '#faq' },
    { label: 'Contato', href: '#contato' },
  ],
  /**
   * PT e EN são duas páginas, não um estado do React: o seletor do menu são
   * dois links de verdade. `locale` é quem está no ar agora, e o menu marca o
   * botão correspondente.
   */
  languageLabel: 'Idioma',
  languages: [
    { code: 'pt', label: 'PT', href: '/' },
    { code: 'en', label: 'EN', href: '/en/' },
  ],
} as const

/**
 * Seção 02 — "Mostramos antes de explicar".
 *
 * Substituiu a narrativa em registro de terminal que atravessava o card do
 * hero. Ela era vinte linhas monoespaçadas numa coluna magra dentro de um vazio
 * preto, e um dos quatro blocos (`// o que`) listava os mesmos serviços que a
 * seção seguinte mostra melhor, com os clipes dos trabalhos rodando.
 *
 * O que sobrou responde "quem somos / como trabalhamos" com o argumento que a
 * concorrência não copia de graça — o preview funcionando no primeiro contato —
 * e o PROVA com um painel ao lado, em vez de só afirmar.
 *
 * As versões `...Curto` são do celular: em 390px o texto longo vira parede. Os
 * dois vão para o DOM e o CSS esconde um; trocar texto por largura de tela não
 * é coisa que media query faça sozinha, e não vale um listener de resize.
 */
const metodo = {
  eyebrow: '// como',
  title: 'Mostramos antes de explicar.',
  paragraph:
    'Agência de criação e tecnologia — estratégia, design, marketing e engenharia na mesma equipe, dentro e fora do Brasil. Quase sempre o primeiro contato já chega com um preview funcionando.',
  paragraphCurto:
    'Criação e tecnologia na mesma equipe. O primeiro contato já chega com um preview funcionando.',
  /** A terceira linha é a que fecha o argumento, e a única em tinta cheia. */
  notas: [
    'equipe enxuta · ferramenta de ponta',
    'muitos projetos entregues no mesmo dia',
    'menos reunião. mais coisa pronta.',
  ],
  painel: {
    label: 'preview · primeira conversa',
    status: 'no ar',
    steps: [
      {
        title: 'A conversa começa',
        titleCurto: 'A conversa começa',
        detail: 'Você conta o problema. Ninguém abre apresentação.',
        detailCurto: 'Ninguém abre apresentação.',
      },
      {
        title: 'Um preview funcionando',
        titleCurto: 'Preview funcionando',
        detail: 'Da ideia a algo testável em poucas horas — no navegador, não no slide.',
        detailCurto: 'Da ideia a algo testável em poucas horas.',
      },
      {
        title: 'Entregue',
        titleCurto: 'Entregue',
        detail: 'Muitos projetos saem no mesmo dia em que entraram.',
        detailCurto: 'Muitos projetos saem no mesmo dia.',
      },
    ],
  },
}

const hero = {
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
    primary: 'Começar uma conversa',
    secondary: 'Trabalhos no ar',
  },
  /** Dica no pé do hero: some junto com o resto do bloco inicial. */
  scrollHint: 'Arraste para cima',
}

const services = {
  eyebrow: 'serviços',
  title: ['Criação com método.', 'Automação que trabalha.'],
  description:
    'Da presença digital à operação do dia a dia, criamos sites, sistemas e automações que colocam ideias no ar e trabalho no automático.',
  /**
   * Duas faixas de largura inteira, alternando o lado do painel visual. Cada uma
   * traz `accent` (a cor que corre pela faixa) e `visual` (qual painel vai ao
   * lado do texto).
   *
   * Sem CTA nas faixas: os dois botões daqui saíram. A seção apresenta o que a
   * SOPA faz, e quem se convence rola para o rodapé, que é o fecho da página.
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
   * Onde o trabalho se repete hoje, e o que ele vira — o painel da faixa de
   * Automação.
   *
   * Ocupa o lugar de uma grade de logos de ferramentas. Logo responde "com o que
   * vocês trabalham"; a pergunta que o cliente faz antes dessa é "serve para
   * mim?", e uma parede de marcas que ele não reconhece responde que não.
   *
   * **Era uma sequência de quatro etapas** (conversa → revisão → proposta → no
   * ar), e foi trocada porque colidia com a seção 02: os dois painéis eram uma
   * linha do tempo numerada ligada por um fio, num painel ao lado do texto, e os
   * dois iam de "conversa" a "no ar". A repetição não era de estilo, era de
   * argumento — e a terceira cópia é a primeira pergunta do FAQ.
   *
   * Etapas respondem "como funciona". A pergunta desta faixa é "cabe na minha
   * operação", e isso se responde com reconhecimento: a coluna da esquerda tem
   * que ser o dia do cliente. Quem argumenta TEMPO é a seção 02, onde a linha do
   * tempo é a forma certa porque o argumento é o mesmo dia.
   *
   * A `note` é a linha mais importante do bloco — é ela que tira o pé do cliente
   * da dúvida de precisar ter alguma coisa antes de chamar.
   */
  process: {
    eyebrow: 'onde o trabalho se repete',
    columns: { before: 'hoje, na mão', after: 'sozinho' },
    rows: [
      {
        before: 'Responder a mesma pergunta no WhatsApp',
        after: 'Resposta em segundos, a qualquer hora',
      },
      {
        before: 'Copiar cada pedido para a planilha',
        after: 'Entra direto, sem ninguém digitar',
      },
      {
        before: 'Lembrar de cobrar quem atrasou',
        after: 'A cobrança dispara na data',
      },
      {
        before: 'Perguntar tudo de novo a cada contato',
        after: 'Chega qualificado, com o próximo passo',
      },
      {
        before: 'Montar o relatório no fim do mês',
        after: 'Pronto quando você abrir',
      },
    ],
    note: 'Funciona com o que a sua empresa já tem — WhatsApp, planilha, CRM, sistema feito em casa. Ou com o que ainda nem existe.',
  },
} as const

/**
 * Marcas que já passaram pela SOPA, na faixa entre os serviços e o FAQ.
 *
 * `slug` é o nome do arquivo em `src/assets/marcas/` — ver o README de lá. Sem
 * arquivo, o card mostra só o nome e segue de pé.
 *
 * ⚠️ **OS `depoimento` ABAIXO SÃO RASCUNHO, NÃO APROVADO POR NINGUÉM.**
 * Foram escritos para ver o card cheio e nenhuma dessas marcas disse nada
 * disso. Frase inventada ao lado de um logo de verdade lê como endosso real —
 * não vá ao ar assim. As mesmas frases e o modelo de e-mail para pedir
 * aprovação estão em `depoimentos-rascunho.md`, na raiz; quando a fala voltar
 * assinada, ela entra aqui com o nome de quem assina.
 *
 * Sem aprovação, o valor honesto é o placeholder:
 * `'Depoimento em breve — o texto real entra aqui.'`, o mesmo em todos.
 *
 * A fala cabe em três linhas do card em 300px — conferir ao trocar.
 */

const marcas = {
  label: 'Marcas que já passaram pela SOPA',
  eyebrow: 'quem já sentou à mesa',
  itens: [
    { slug: 'hbo', nome: 'HBO', depoimento: 'Prazo apertado e escopo grande. Entregaram no dia, sem a gente precisar ficar em cima.' },
    { slug: 'puma', nome: 'Puma', depoimento: 'Entenderam a marca na primeira conversa. O que voltou já estava no tom certo.' },
    { slug: 'bk', nome: 'BK', depoimento: 'Time pequeno e rápido. Pedido de manhã, versão pronta à tarde.' },
    { slug: 'c-a', nome: 'C&A', depoimento: 'Organizaram o que estava espalhado e devolveram uma coisa só, clara.' },
    { slug: 'keepkey', nome: 'KeepKey', depoimento: 'Técnicos de verdade. Resolveram do design ao código sem passar o problema adiante.' },
    { slug: 'shapeshift', nome: 'ShapeShift', depoimento: 'Fácil de trabalhar junto. Perguntam o que precisa ser perguntado e tocam sozinhos.' },
    { slug: 'gnars', nome: 'Gnars', depoimento: 'Pegaram uma ideia solta e transformaram em produto no ar.' },
    { slug: 'odysee', nome: 'Odysee', depoimento: 'Ficaram depois do lançamento. Isso quase ninguém faz.' },
    { slug: 'skatehive', nome: 'SkateHive', depoimento: 'Rápidos, diretos e sem enrolação de agência.' },
  ],
}

const faq = {
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

const footer = {
  title: ['Bom trabalho', 'continua rendendo'],
  /** Quebras de linha na mão: cada item é uma linha do bloco centralizado. */
  lede: [
    'A entrega não termina no lançamento. Criamos produtos, marcas e',
    'sistemas feitos para continuar funcionando, evoluindo e gerando',
    'resultado muito depois que entram no ar.',
  ],
  cta: { label: 'Tirar um projeto do papel', href: whatsappUrl },
  /**
   * O e-mail é link de texto ao pé do botão, e não um segundo botão: `mailto:`
   * como CTA principal é aposta ruim — quem não tem cliente de e-mail
   * configurado clica e nada acontece, e o lead se perde sem ninguém saber.
   * Como linha discreta, serve quem prefere escrever e não custa nada a quem
   * não usa. O `prefix` fica fora do link: só o endereço é clicável.
   */
  email: { prefix: 'ou escreva para', address: email },
  /** Links externos (href com http) abrem em outra aba; '#' fica como placeholder. */
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/sopaagency/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/sopa-agency/?viewAsMember=true' },
    { label: 'X', href: 'https://x.com/sopaagency' },
  ],
  legal: `© SOPA · ${new Date().getFullYear()}`,
} as const

export const pt = { nav, hero, metodo, services, marcas, faq, footer, whatsappUrl } as const
