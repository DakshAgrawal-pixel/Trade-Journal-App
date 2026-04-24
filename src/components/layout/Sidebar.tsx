'use client';

import React from 'react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'journal', label: 'Trade Journal', icon: '📈' },
  { id: 'advisory', label: 'Advisory Log', icon: '👥' },
  { id: 'assistant', label: 'AI Assistant', icon: '🤖' },
];

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">📊</div>
            TradeLog
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            TradeLog v1.0 — PWA
          </div>
        </div>
      </aside>
    </>
  );
}
