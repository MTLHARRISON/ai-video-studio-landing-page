import { Hero } from './components/Hero'
import { F1Championship } from './components/F1Championship'
import { TrackCarousel } from './components/TrackCarousel'
import { TrackSelectionProvider } from './lib/trackSelection'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import { Flag, Users } from 'lucide-react'

export default function App() {
  return (
    <BrowserRouter>
      <TrackSelectionProvider>
        <Routes>
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-background text-foreground">
                {/* Navigation */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                      <Flag className="w-5 h-5" />
                      <span className="font-bold">F1 Tracker</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                      <Link to="/" className="text-sm text-foreground font-medium">Home</Link>
                      <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Teams
                      </Link>
                    </nav>
                  </div>
                </header>

                <main className="relative" role="main">
                  <section id="hero" aria-label="Hero section">
                    <Hero />
                  </section>
                  <section id="f1-championship" aria-label="F1 Championship section">
                    <F1Championship />
                  </section>
                  <section id="track-carousel" aria-label="Track Carousel section">
                    <TrackCarousel />
                  </section>
                </main>

                {/* Simple Footer */}
                <footer className="py-8 bg-muted/30 border-t border-border">
                  <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
                    <p>F1 Championship Tracker • Data from Ergast F1 API</p>
                  </div>
                </footer>
              </div>
            }
          />
        </Routes>
      </TrackSelectionProvider>
    </BrowserRouter>
  )
}
