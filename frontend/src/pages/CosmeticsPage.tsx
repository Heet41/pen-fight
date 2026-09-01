import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  icon: string;
  isEquipped: boolean;
  data?: any;
}

export default function CosmeticsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/inventory');
        setInventory(res.data.data.inventory || []);
      } catch {
        // fallback sample items
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [isAuthenticated, navigate]);

  const handleEquip = async (itemId: string) => {
    try {
      await api.post('/users/equip', { itemId });
      setInventory((prev) =>
        prev.map((item) => ({
          ...item,
          isEquipped: item.id === itemId,
        }))
      );
      checkAuth();
      toast.success('Item equipped!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to equip item');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <ParticleBackground />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/menu')}
              className="text-xs text-white/50 hover:text-white mb-1 flex items-center gap-1 transition-colors"
            >
              <span>←</span> Back to Menu
            </button>
            <h1 className="font-game font-black text-3xl text-white">Locker & Cosmetics</h1>
            <p className="text-white/50 text-sm">Customize your pen skins, trail effects, and arena titles</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/40">
            <span className="text-3xl block mb-2 animate-spin">⏳</span>
            Loading Locker...
          </div>
        ) : inventory.length === 0 ? (
          <div className="glass-card p-12 text-center text-white/40">
            <span className="text-4xl block mb-2">🎨</span>
            No cosmetic items in your inventory yet. Level up or unlock achievements to earn new skins!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {inventory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl glass-card border transition-all flex flex-col justify-between ${
                  item.isEquipped
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-neon-blue'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        item.rarity === 'EPIC'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : item.rarity === 'RARE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="font-game font-bold text-base text-white mb-1">{item.name}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  {item.isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-game cursor-default"
                    >
                      ✓ EQUIPPED
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="btn-neon w-full py-2 text-xs font-game"
                    >
                      EQUIP
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
