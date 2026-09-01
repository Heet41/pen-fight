import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MenuPage from '@/pages/MenuPage';
import LocalGamePage from '@/pages/LocalGamePage';
import AIGamePage from '@/pages/AIGamePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ProfilePage from '@/pages/ProfilePage';
import CosmeticsPage from '@/pages/CosmeticsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  const location = useLocation();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/game/local" element={<LocalGamePage />} />
        <Route path="/game/ai" element={<AIGamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<ProfilePage />} />
        <Route path="/cosmetics" element={<CosmeticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
