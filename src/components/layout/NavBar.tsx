import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Shield, Smartphone, Code, Rocket, Gamepad2, Car,
  Search, User, Menu, X, Zap,
} from 'lucide-react'
import { sections } from '../../data/sections'
import { useApp } from '../../context/AppContext'
import { useSubscriber } from '../../context/SubscriberContext'
import { HolographicSearch } from '../features/HolographicSearch'
import { ProfilePanel } from '../features/ProfilePanel'
import { ProfileAvatar } from '../ui/ProfileAvatar'
import { HighContrastToggle, XPBar } from '../ui/Accessibility'

const navIcons: Record<string, typeof Brain> = {
  ai: Brain,
  cybersecurity: Shield,
  gadgets: Smartphone,
  software: Code,
  space: Rocket,
  gaming: Gamepad2,
  cars: Car,
}

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const { profile } = useApp()
  const { isSubscriber } = useSubscriber()

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl"
        aria-label="Main navigation"
      >
        <div className="glass-panel flex items-center justify-between px-4 py-2.5 border-neon-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
          <Link to="/" className="flex items-center gap-2 group" aria-label="GiveMeTech home">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center"
            >
              <Zap size={16} className="text-void" />
            </motion.div>
            <span className="font-display font-bold text-sm tracking-wider holo-gradient hidden sm:block">
              GIVEMETECH
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {sections.map((section) => {
              const Icon = navIcons[section.id]
              const active = location.pathname === section.path
              return (
                <Link key={section.id} to={section.path} aria-current={active ? 'page' : undefined}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      p-2.5 rounded-lg transition-all duration-300 relative
                      ${active ? 'text-neon-cyan bg-neon-cyan/10' : 'text-text-secondary hover:text-neon-cyan hover:bg-glass'}
                    `}
                    title={section.title}
                  >
                    <Icon size={18} />
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <XPBar />
            <HighContrastToggle />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-neon-cyan transition-colors"
              aria-label="Open search"
            >
              <Search size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setProfileOpen(true)}
              className={`rounded-lg transition-colors relative ${
                isSubscriber ? 'p-0.5' : 'p-2'
              } ${
                isSubscriber
                  ? 'text-neon-cyan hover:text-neon-cyan'
                  : 'text-text-secondary hover:text-neon-purple'
              }`}
              aria-label={isSubscriber ? 'Open subscriber profile' : 'Sign in to profile'}
            >
              {isSubscriber ? (
                <ProfileAvatar profile={profile} size="sm" />
              ) : (
                <User size={18} />
              )}
              {isSubscriber && (
                <span
                  className="absolute top-0 right-0 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_6px_#00ff88]"
                  aria-hidden
                />
              )}
            </motion.button>
            <button
              className="lg:hidden p-2 text-text-secondary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-2 glass-panel overflow-hidden"
            >
              {sections.map((section) => {
                const Icon = navIcons[section.id]
                return (
                  <Link
                    key={section.id}
                    to={section.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-neon-cyan hover:bg-glass transition-colors"
                  >
                    <Icon size={18} />
                    <span className="font-body text-sm">{section.title}</span>
                  </Link>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <HolographicSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
