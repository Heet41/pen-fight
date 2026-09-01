import { motion, AnimatePresence } from 'framer-motion';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    icon: '🎯',
    title: 'Aim Your Pen',
    description:
      'Click and drag (or touch and drag on mobile) to set the direction. A trajectory line shows where your pen will go.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
  },
  {
    number: 2,
    icon: '⚡',
    title: 'Choose Power',
    description:
      'Use the power slider to control how hard you hit. More power = faster pen but harder to control!',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    number: 3,
    icon: '🚀',
    title: 'Shoot!',
    description:
      'Press the SHOOT button to launch your pen. Watch the physics unfold — friction, bounces, and collisions.',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
  },
  {
    number: 4,
    icon: '💥',
    title: 'Knock Out!',
    description:
      'Your goal is to push your opponent\'s pen outside the arena boundary. The last pen inside wins!',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
  },
];

const rules = [
  'Players alternate turns — you cannot shoot twice in a row.',
  'Both pens start inside the arena.',
  'A pen leaving the boundary loses the round.',
  'Pens collide with each other and bounce off walls.',
  'Friction slows pens down — they don\'t move forever.',
  'Strategic positioning matters — set up future shots!',
];

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card border-white/15 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✒️</span>
                  <h2 className="font-game font-bold text-xl text-white">HOW TO PLAY</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex gap-4 p-4 rounded-xl border ${step.bg}`}
                  >
                    <div className="text-3xl flex-shrink-0">{step.icon}</div>
                    <div>
                      <div className={`font-semibold ${step.color} mb-1`}>
                        Step {step.number}: {step.title}
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rules */}
              <div className="glass-card bg-white/3 border-white/10 p-5">
                <h3 className="font-game text-sm font-bold text-white/70 mb-4 tracking-wider">
                  📋 GAME RULES
                </h3>
                <ul className="space-y-2">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-neon-blue flex-shrink-0 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Close button */}
              <div className="mt-6 flex justify-center">
                <button onClick={onClose} className="btn-neon px-10">
                  Got it! Let's Play
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
