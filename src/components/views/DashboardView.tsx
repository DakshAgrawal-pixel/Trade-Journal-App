'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTradesByUser, Trade } from '@/lib/trades';
import { getClientsByUser, Client, getInsightsByUser, Insight } from '@/lib/advisory';
import { seedIfEmpty } from '@/lib/seed';

interface DashboardViewProps {
  onNavigate: (page: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;
  const role = profile?.role;

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoading(true);
      try {
        // Seed data on first login for mentors
        if (role === 'mentor') {
          const didSeed = await seedIfEmpty(uid);
          if (didSeed) setSeeded(true);
        }
        const [t, c, i] = await Promise.all([
          getTradesByUser(uid),
          getClientsByUser(uid),
          getInsightsByUser(uid),
        ]);
        setTrades(t);
        setClients(c);
        setInsights(i);
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setLoading(false);
    };
    load();
  }, [uid, role]);

  const openTrades = trades.filter((t) => t.status === 'open').length;
  const closedTrades = trades.filter((t) => t.status === 'closed');
  const totalPnl = closedTrades.reduce((sum, t) => {
    if (t.exitPrice !== null) {
      return sum + (t.exitPrice - t.entryPrice);
    }
    return sum;
  }, 0);
  const winRate =
    closedTrades.length > 0
      ? Math.round(
          (closedTrades.filter((t) => t.exitPrice !== null && t.exitPrice > t.entryPrice).length /
            closedTrades.length) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="empty-state loading-pulse">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {seeded && (
        <div
          style={{
            background: 'var(--success-subtle)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '0.88rem',
          }}
        >
          ✅ Sample data seeded! Check Advisory Log for mentees &ldquo;Chachu&rdquo; and &ldquo;The 3 Underdogs&rdquo;.
        </div>
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">
            Welcome back, {profile?.displayName || 'Trader'} 👋
          </h2>
          <p className="page-subtitle">Here&apos;s your trading overview</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Open Trades</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{openTrades}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Closed Trades</div>
          <div className="stat-value">{closedTrades.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net P&L</div>
          <div
            className="stat-value"
            style={{ color: totalPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{winRate}%</div>
        </div>
      </div>

      <div className="card-grid">
        <div
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('journal')}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
          <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>Trade Journal</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {trades.length} trades logged. Click to manage your journal.
          </p>
        </div>

        <div
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('advisory')}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>Advisory Log</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {clients.length} clients, {insights.length} insights. Track your mentoring.
          </p>
        </div>

        <div
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('assistant')}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤖</div>
          <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>AI Assistant</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Brain-dump your trading notes and let AI extract the details.
          </p>
        </div>
      </div>

      {trades.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Recent Trades</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trades.slice(0, 5).map((trade) => (
              <div
                key={trade.id}
                className="card"
                style={{ padding: '14px 20px', cursor: 'pointer' }}
                onClick={() => onNavigate('journal')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700 }}>{trade.ticker}</span>
                    <span
                      className={`badge ${
                        trade.status === 'open'
                          ? 'badge-accent'
                          : trade.exitPrice !== null && trade.exitPrice >= trade.entryPrice
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}
                    >
                      {trade.status === 'open'
                        ? 'Open'
                        : trade.exitPrice !== null
                        ? `${((trade.exitPrice - trade.entryPrice) / trade.entryPrice * 100).toFixed(1)}%`
                        : 'Closed'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {trade.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
