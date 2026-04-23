/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Auth } from './pages/Auth';
import { Shell } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { PlanningPage } from './pages/Planning';
import { AdminDashboard } from './pages/AdminDashboard';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-olive-950 font-sans">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-olive-900 rounded-3xl flex items-center justify-center shadow-2xl border border-olive-800 animate-pulse">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-400 fill-yellow-400">
              <path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1 bg-olive-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full bg-yellow-400"
              />
            </div>
            <p className="text-[10px] font-black text-olive-500 uppercase tracking-[0.3em] italic">ESTRATÉGIA CONSULTORIA</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'reports' && <Reports />}
      {activeTab === 'goals' && <Goals />}
      {activeTab === 'planning' && <PlanningPage />}
      {activeTab === 'admin' && profile?.role === 'admin' && <AdminDashboard />}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
