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
 * está em todo lugar, não está em lugar nenhum. A página tem cinco pontos de
 * contato, cada um com uma razão diferente para existir — e, o que importa
 * tanto quanto, **um rótulo diferente**:
 *
 *   1. menu       — "Falar no WhatsApp": para quem já decidiu antes de ler. O
 *                   que falta ali é a informação do canal, não o convite.
 *   2. hero       — "Começar uma conversa": a porta de entrada, sem contexto
 *                   ainda, então a barreira tem que ser a mais baixa da página.
 *   3. serviços   — um por card, com a INTENÇÃO do card no rótulo E na
 *                   mensagem: quem clica em Automação já abre a conversa
 *                   falando de automação. É isso que os faz merecer o lugar;
 *                   fossem dois botões iguais lado a lado, um sobraria.
 *   4. rodapé     — "Tirar um projeto do papel": quem chegou aqui leu a página
 *                   inteira e pode receber o pedido mais direto.
 *
 * **Os cinco eram três "Entre em contato" e dois rótulos próprios**, e era a
 * repetição da FRASE que fazia a página soar insistente — não a quantidade de
 * botões. Os cards já tinham resolvido isso; os outros três só receberam o
 * mesmo tratamento. Ao mexer num rótulo, mexa sabendo que ele é o que separa
 * um convite de um eco: dois botões com o mesmo texto são um botão repetido,
 * mesmo em seções distantes.
 *
 * Sem CTA: a narrativa do hero (o botão caía uma tela antes dos serviços, que
 * já pedem contato) e o FAQ (quem está tirando dúvida ainda não decidiu — e o
 * rodapé vem logo depois).
 *
 * O menu tinha também um LINK "Contato" apontando para o rodapé, ao lado do
 * botão que abre a conversa. Saiu: levava a pessoa a um lugar onde havia outro
 * botão igual, e quem abre o menu e clica em "Contato" quer falar, não rolar.
 * O `id="contato"` do rodapé ficou, para quem chegar por link direto.
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
