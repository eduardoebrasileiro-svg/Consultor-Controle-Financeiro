/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-olive-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-olive-400 italic">FinLink v2.4 está inicializando seus dados...</p>
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
