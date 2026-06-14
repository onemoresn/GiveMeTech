import { motion } from 'framer-motion'

interface BadgeProps {
  label: string
  variant?: 'cyan' | 'magenta' | 'purple' | 'green' | 'orange'
  pulse?: boolean
}

const colors = {
  cyan: 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10',
  magenta: 'border-neon-magenta/40 text-neon-magenta bg-neon-magenta/10',
  purple: 'border-neon-purple/40 text-neon-purple bg-neon-purple/10',
  green: 'border-neon-green/40 text-neon-green bg-neon-green/10',
  orange: 'border-neon-orange/40 text-neon-orange bg-neon-orange/10',
}

export function Badge({ label, variant = 'cyan', pulse = false }: BadgeProps) {
  return (
    <motion.span
      animate={pulse ? { opacity: [0.7, 1, 0.7] } : undefined}
      transition={pulse ? { duration: 2, repeat: Infinity } : undefined}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-mono uppercase tracking-wider
        ${colors[variant]}
      `}
    >
      {label}
    </motion.span>
  )
}
