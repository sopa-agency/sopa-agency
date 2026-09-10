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
 * contato, cada um com uma razão diferente para existir — e, o que importa
 * tanto quanto, **um rótulo diferente**:
 *
 *   1. hero       — "Começar uma conversa": a porta de entrada, sem contexto
 *                   ainda, então a barreira tem que ser a mais baixa da página.
 *   2. serviços   — um por card, com a INTENÇÃO do card no rótulo E na
 *                   mensagem: quem clica em Automação já abre a conversa
 *                   falando de automação. É isso que os faz merecer o lugar;
 *                   fossem dois botões iguais lado a lado, um sobraria.
 *   3. rodapé     — "Tirar um projeto do papel": quem chegou aqui leu a página
 *                   inteira e pode receber o pedido mais direto.
 *
 * **Três destes diziam "Entre em contato"**, e era a repetição da FRASE que
 * fazia a página soar insistente — não a quantidade de botões. Os cards já
 * tinham resolvido isso; os outros só receberam o mesmo tratamento. Ao mexer
 * num rótulo, mexa sabendo que ele é o que separa um convite de um eco: dois
 * botões com o mesmo texto são um botão repetido, mesmo em seções distantes.
 *
 * **Nenhum CTA leva o ícone do WhatsApp.** Ele estava nos quatro, e um mesmo
 * símbolo repetido não se resolve com rótulo diferente: deixa de ser sinal e
 * vira textura da página. Com ele foi embora o mecanismo de ícone preenchido do
 * `Icon.tsx`, que existia só para essa marca. O custo é que o botão não anuncia
 * mais que abre outro app; se isso pesar, o conserto é nomear o canal em UM
 * rótulo, não devolver o ícone a todos.
 *
 * **O menu não tem CTA.** Ele é lista de navegação e nada mais: quatro links
 * do mesmo padrão, incluindo "Contato", que aponta para o `id="contato"` do
 * rodapé — e é lá que está o botão. Um botão solto no meio dos links era o
 * único elemento fora do padrão do menu.
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
