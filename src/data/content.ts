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
 *   2. rodapé     — "Tirar um projeto do papel": quem chegou aqui leu a página
 *                   inteira e pode receber o pedido mais direto.
 *
 * São DOIS, e já foram cinco. Os rótulos são diferentes de propósito: os cinco
 * antigos tinham três "Entre em contato", e era a repetição da FRASE que fazia
 * a página soar insistente. Ao mexer num rótulo, mexa sabendo que ele é o que
 * separa um convite de um eco — dois botões com o mesmo texto são um botão
 * repetido, mesmo em seções distantes.
 *
 * **Os dois CTAs das faixas de serviço saíram.** Eles abriam o WhatsApp já
 * falando do assunto da faixa, e era isso que os fazia merecer o lugar; ainda
 * assim eram dois dos cinco botões, e a página pesava mais do que ganhava. A
 * seção de serviços agora só apresenta — quem se convence rola para o rodapé.
 * Com eles foi embora a única mensagem de WhatsApp com contexto: as duas que
 * sobraram são genéricas.
 *
 * **Só o CTA do rodapé leva o ícone do WhatsApp.** Ele estava nos quatro, e um
 * mesmo símbolo repetido não se resolve com rótulo diferente: deixa de ser
 * sinal e vira textura da página. Mas tirado de todos, nenhum botão avisava que
 * o clique abre outro app — e os rótulos falam de intenção, não de canal.
 *
 * O rodapé é onde ele ganha o lugar: é o último ponto, de quem leu a página
 * inteira e está decidindo, e é exatamente aí que saber o canal ajuda em vez de
 * poluir. Aparecendo uma vez só, volta a ser sinal. Não devolva o ícone aos
 * outros três: é a repetição, e não o ícone, que era o problema.
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

export const { nav, hero, metodo, services, marcas, faq, footer, whatsappUrl } = locale
