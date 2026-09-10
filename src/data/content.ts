/**
 * Camada de conteúdo — o site escolhe a locale por aqui.
 *
 * PT e EN são duas páginas estáticas (`/` e `/en/`), cada uma com o seu
 * `<head>` escrito à mão e o seu atributo `lang`. É esse `lang` que decide a
 * copy: o `<script type="module">` é deferred, então quando este módulo
 * inicializa o `<html>` já foi parseado. Sem router, sem context, sem estado —
 * os componentes seguem importando `nav`, `hero`… pelo nome, como sempre.
 *
 * Para mudar qualquer palavra do site, mexa em `content.pt.ts` ou
 * `content.en.ts`. Nunca aqui.
 */

import { en } from './content.en'
import { pt } from './content.pt'

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

// ponytail: o PT é a forma canônica e o EN entra por cast, então o tsc só
// cobra as chaves de primeiro nível (o `satisfies` do content.en.ts). Chave de
// prosa que falte vira texto vazio na tela do /en/ em vez de erro de build —
// se um dia isso escapar para produção, o upgrade é um teste que compara os
// caminhos de chave dos dois arquivos.
const locale: typeof pt = document.documentElement.lang.startsWith('en')
  ? (en as unknown as typeof pt)
  : pt

export const { nav, hero, services, faq, footer, whatsappUrl } = locale
