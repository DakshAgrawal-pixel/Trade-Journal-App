'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';
import AuthPage from '@/components/auth/AuthPage';
import DashboardView from '@/components/views/DashboardView';
import JournalView from '@/components/views/JournalView';
import AdvisoryView from '@/components/views/AdvisoryView';
import AssistantView from '@/components/views/AssistantView';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  journal: 'Trade Journal',
  advisory: 'Advisory Log',
  assistant: 'AI Assistant',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div className="loading-pulse" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Loading TradeLog...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppShell
      activePage={activePage}
      onNavigate={setActivePage}
      pageTitle={PAGE_TITLES[activePage] || 'TradeLog'}
    >
      {activePage === 'dashboard' && <DashboardView onNavigate={setActivePage} />}
      {activePage === 'journal' && <JournalView />}
      {activePage === 'advisory' && <AdvisoryView />}
      {activePage === 'assistant' && <AssistantView />}
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
