'use client'

import { motion } from 'framer-motion'
import { Flag } from 'lucide-react'
import { useState, useEffect } from 'react'
import heroImg from '../img/hero.jpg'

const CONSTRUCTOR_COLORS = [
  '#FF8000', // McLaren
  '#3671C6', // Red Bull
  '#E80020', // Ferrari
  '#27F4D2', // Mercedes
  '#229971', // Aston Martin
  '#0093CC', // Alpine
  '#64C4FF', // Williams
  '#B6BABD', // Haas
  '#52E252', // Kick Sauber
  '#6692FF', // RB
];

export function Hero() {
  const [championshipColor, setChampionshipColor] = useState('#E80020');

  useEffect(() => {
    const randomColor = CONSTRUCTOR_COLORS[Math.floor(Math.random() * CONSTRUCTOR_COLORS.length)];
    setChampionshipColor(randomColor);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* F1 Background Video (replaced with local hero image) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover scale-110"
          style={{ backgroundImage: `url(${heroImg})` }}
          role="img"
          aria-label="Hero background"
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
      </motion.nav>

      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-16 sm:bottom-12 left-4 sm:left-6 lg:left-12 z-40 right-4 sm:right-auto"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
          >
            <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
            2025 Season Live
          </motion.div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white">
            <span className="block">FORMULA 1</span>
            <span className="block" style={{ color: championshipColor }}>CHAMPIONSHIP</span>
            <span className="block">TRACKER</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-md">
            Live standings, driver stats, and race results from the world's most exciting motorsport.
          </p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 right-8 text-white/50 text-sm hidden lg:block"
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
