import { Hero } from './components/Hero'
import { F1Championship } from './components/F1Championship'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="relative" role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="f1-championship" aria-label="F1 Championship section">
          <F1Championship />
        </section>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>F1 Championship Tracker • Data from Ergast F1 API</p>
        </div>
      </footer>
    </div>
  )
}
