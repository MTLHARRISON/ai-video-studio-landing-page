'use client'

import { motion } from 'framer-motion'
import { Flag } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* F1 Background Video (YouTube embed) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full object-cover scale-110"
          src="https://www.youtube-nocookie.com/embed/gT3Rl_B14do?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1"
          title="Hero background video"
          allow="autoplay; encrypted-media"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

      {/* Simple Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 w-full z-[110]"
      >
        <div className="w-full px-6 sm:px-8 lg:px-12 py-4 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Flag className="w-6 h-6 text-red-500" />
              <span className="font-bold text-white text-xl tracking-wider">F1 TRACKER</span>
            </motion.div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#f1-championship" className="text-white hover:text-red-500 font-medium transition-colors">
                Standings
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-12 left-6 sm:left-8 lg:left-12 z-40"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-6"
          >
            <Flag className="w-4 h-4" />
            2025 Season Live
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white">
            <span className="block">FORMULA 1</span>
            <span className="block text-red-500">CHAMPIONSHIP</span>
            <span className="block">TRACKER</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-md">
            Live standings, driver stats, and race results from the world's most exciting motorsport.
          </p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 right-8 text-white/50 text-sm hidden md:block"
      >
        <div className="flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
