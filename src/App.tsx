import { Menu } from './components/Menu'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Services } from './sections/Services'

export default function App() {
  return (
    <main>
      <Menu />
      <Hero />
      <Services />
      <Faq />
      <Footer />
    </main>
  )
}
