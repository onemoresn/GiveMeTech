import { Link } from 'react-router-dom'
import { sections } from '../../data/sections'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-glass-border bg-void-light/50 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display font-bold text-lg holo-gradient mb-3">GIVEMETECH</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Your portal to the future of technology. Immersive insights for developers, futurists, and innovators.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-neon-cyan mb-3 uppercase tracking-wider">Sections</h4>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link to={s.path} className="text-text-secondary text-sm hover:text-neon-cyan transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-neon-purple mb-3 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">RSS Feed</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-neon-magenta mb-3 uppercase tracking-wider">Keyboard</h4>
            <ul className="space-y-1 text-text-muted text-xs font-mono">
              <li><kbd className="px-1.5 py-0.5 rounded bg-void-elevated border border-glass-border">/</kbd> Search</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-void-elevated border border-glass-border">Esc</kbd> Close panels</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-void-elevated border border-glass-border">Tab</kbd> Navigate</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-glass-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs">&copy; 2026 GiveMeTech. Built for the future.</p>
          <p className="text-text-muted text-xs font-mono">v1.0.0 // WebGL Enabled</p>
        </div>
      </div>
    </footer>
  )
}
