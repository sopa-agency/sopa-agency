/**
 * O WhatsApp da SOPA. O número é o mesmo nas duas locales; as mensagens que
 * abrem a conversa não são — cada arquivo de copy escreve as suas.
 *
 * `whatsapp` é só dígitos, no formato internacional: 55 + DDD + número.
 */
// número de teste — trocar pelo da SOPA antes de publicar
export const whatsapp = '5521999123641'

/** Monta um link do WhatsApp com a mensagem já digitada na conversa. */
export const waLink = (message: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
