import React, { useState } from 'react';
import { 
  BarChart3, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  LogOut, 
  Star,
  Settings,
  Bell,
  Target,
  PieChart as BarChartHorizontal,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Shell: React.FC<ShellProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', roles: ['user', 'admin'] },
    { id: 'reports', icon: BarChartHorizontal, label: 'Relatórios', roles: ['user', 'admin'] },
    { id: 'goals', icon: Target, label: 'Metas & Orçamentos', roles: ['user', 'admin'] },
    { id: 'planning', icon: Calendar, label: 'Planejamento', roles: ['user', 'admin'] },
    ...(isAdmin ? [{ id: 'admin', icon: Users, label: 'Gestão', roles: ['admin'] }] : [])
  ];

  return (
    <div className="flex h-screen bg-olive-950 overflow-hidden font-sans text-olive-100">
      {/* Sidebar */}
      <aside className="w-64 bg-olive-900 border-r border-olive-800 flex flex-col">
        <div className="p-8">
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-olive-950 border border-olive-800 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-400 fill-yellow-400">
                  <path d="M12 1L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs tracking-[0.2em] uppercase text-white leading-tight italic">Estratégia</span>
                <span className="font-medium text-[10px] tracking-[0.3em] uppercase text-olive-500 leading-tight">Consultoria</span>
              </div>
            </div>
            <div className="h-[1px] w-full bg-gradient-to-r from-olive-800 to-transparent"></div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                  ? 'bg-olive-600 text-white shadow-lg shadow-olive-500/10' 
                  : 'text-olive-400 hover:bg-olive-800 hover:text-olive-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-olive-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-olive-800 border border-olive-700 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
              {profile?.displayName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">{profile?.displayName}</p>
              <p className="text-[10px] text-olive-400 leading-none mt-1 uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-olive-800 px-10 flex items-center justify-between bg-olive-950/50 backdrop-blur-sm z-10">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-6">
            <div className="px-3 py-1 bg-olive-800 rounded-full border border-olive-700 text-[10px] flex items-center gap-2 font-medium text-olive-300">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {isAdmin ? 'Admin Conectado' : 'Usuário Online'}: {profile?.displayName}
            </div>
            <button className="p-2 hover:bg-olive-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-olive-400" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-olive-500 rounded-full border-2 border-olive-950"></span>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 bg-olive-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};
