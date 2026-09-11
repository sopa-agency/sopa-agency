/**
 * Os canais de contato da SOPA. Ficam aqui, e não na copy, porque são os
 * mesmos nas duas locales — o que muda por idioma são as mensagens que abrem a
 * conversa e os rótulos, e esses vivem em cada `content.*.ts`.
 *
 * `whatsapp` é só dígitos, no formato internacional: 55 + DDD + número. São 13
 * ao todo para um celular: 55 + 2 do DDD + 9 do número. Contar antes de trocar
 * — faltando um dígito o `wa.me` não reclama, só abre uma conversa vazia, e aí
 * TODO CTA do site vira link morto sem nenhum aviso.
 */
export const whatsapp = '5511960137983'

/** Canal de quem prefere escrever — vive no rodapé, ao pé do CTA. */
export const email = 'sales@sopa.team'

/** Monta um link do WhatsApp com a mensagem já digitada na conversa. */
export const waLink = (message: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
