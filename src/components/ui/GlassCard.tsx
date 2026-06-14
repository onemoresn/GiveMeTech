import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'rgba(0, 240, 255, 0.15)',
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: `0 8px 32px ${glowColor}` } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`
        glass-panel relative overflow-hidden p-6
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  )
}
