import { Hero } from './components/Hero'
import { F1Championship } from './components/F1Championship'
import { TrackCarousel } from './components/TrackCarousel'
import { useState } from 'react'

// Track selection state is lifted here so multiple components can react to it

export default function App() {
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="relative" role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="f1-championship" aria-label="F1 Championship section">
          <F1Championship selectedRound={selectedRound} onRoundSelect={(round) => setSelectedRound(round)} />
        </section>
        <section id="track-carousel" aria-label="Track Carousel section">
          <TrackCarousel selectedRound={selectedRound} onRoundSelect={(round) => setSelectedRound(round)} />
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
