import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        animate={{ rotate: [-5, 5, -5], y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-8xl mb-8"
      >
        ✒️
      </motion.div>
      <h1 className="font-game font-black text-5xl md:text-7xl text-neon mb-4">404</h1>
      <p className="text-white/50 text-lg mb-8 max-w-md">
        Looks like this pen has gone out of bounds! 
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        className="btn-neon px-10 py-4 font-game"
      >
        ← Back to Arena
      </button>
    </motion.div>
  );
}
