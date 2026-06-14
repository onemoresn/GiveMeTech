import { motion } from 'framer-motion'

const sampleComments = [
  { author: 'NeoDev', text: 'This analysis of edge AI is spot on. The latency numbers are incredible.', time: '2h ago' },
  { author: 'CyberQueen', text: 'Finally someone explaining post-quantum crypto without the FUD.', time: '5h ago' },
  { author: 'RustFan42', text: 'Memory safety revolution is here. Great breakdown!', time: '1d ago' },
]

export function CommentBubbles() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-8" aria-label="Comments">
      <h3 className="font-display text-lg font-bold text-neon-cyan mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
        Community Transmissions
      </h3>
      <div className="space-y-4">
        {sampleComments.map((comment, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`
              glass-panel p-4 max-w-[85%] relative
              ${i % 2 === 0 ? 'mr-auto rounded-br-none' : 'ml-auto rounded-bl-none'}
            `}
            style={{
              borderColor: i % 2 === 0 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 0, 170, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: i % 2 === 0 ? 'rgba(0,240,255,0.2)' : 'rgba(255,0,170,0.2)',
                  color: i % 2 === 0 ? '#00f0ff' : '#ff00aa',
                }}
              >
                {comment.author[0]}
              </div>
              <span className="font-mono text-xs text-text-secondary">{comment.author}</span>
              <span className="text-text-muted text-[10px] ml-auto">{comment.time}</span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">{comment.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
