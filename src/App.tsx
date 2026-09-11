import { Menu } from './components/Menu'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Marcas } from './sections/Marcas'
import { Metodo } from './sections/Metodo'
import { Services } from './sections/Services'

/**
 * A ordem da página.
 *
 * A seção 02 vem logo depois do hero porque é ela que diz quem somos antes de
 * a oferta aparecer. A faixa de marcas fecha os serviços e prepara o FAQ: é
 * prova social, e prova social vem DEPOIS da oferta — antes dela seria pedir
 * crédito por um trabalho que a pessoa ainda não sabe qual é.
 */
export default function App() {
  return (
    <main>
      <Menu />
      <Hero />
      <Metodo />
      <Services />
      <Marcas />
      <Faq />
      <Footer />
    </main>
  )
}
