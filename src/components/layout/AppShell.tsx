'use client';

import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  pageTitle: string;
}

export default function AppShell({
  children,
  activePage,
  onNavigate,
  pageTitle,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { profile, logout } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            />

            {profile && (
              <div className="user-menu" onClick={logout} title="Click to logout">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="avatar"
                    style={{ objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="avatar">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="user-menu-name">{profile.displayName}</div>
                  <div className="user-menu-role">{profile.role}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
