import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  size?: Size
  glow?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/50 text-neon-cyan hover:from-neon-cyan/30 hover:to-neon-purple/30',
  secondary:
    'bg-glass border-glass-border text-text-primary hover:border-neon-purple/50 hover:text-neon-purple',
  ghost: 'bg-transparent border-transparent text-text-secondary hover:text-neon-cyan hover:bg-glass',
  danger: 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', glow = false, className = '', children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg border font-body font-semibold
        uppercase tracking-wider transition-all duration-300 cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${glow ? 'shadow-[var(--glow-cyan)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
)

Button.displayName = 'Button'
