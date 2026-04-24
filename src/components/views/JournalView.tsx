'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trade, getTradesByUser, addTrade, updateTrade, deleteTrade } from '@/lib/trades';
import TradeForm from '@/components/journal/TradeForm';
import TradeCard from '@/components/journal/TradeCard';

export default function JournalView() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | undefined>();
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTrades = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTradesByUser(user.uid);
      setTrades(data);
    } catch (err) {
      console.error('Error loading trades:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const handleAdd = async (trade: Omit<Trade, 'id'>) => {
    await addTrade(trade);
    await loadTrades();
  };

  const handleUpdate = async (trade: Omit<Trade, 'id'>) => {
    if (editTrade?.id) {
      await updateTrade(editTrade.id, trade);
      await loadTrades();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this trade?')) {
      await deleteTrade(id);
      await loadTrades();
    }
  };

  const filtered = trades
    .filter((t) => filter === 'all' || t.status === filter)
    .filter(
      (t) =>
        !search ||
        t.ticker.toLowerCase().includes(search.toLowerCase()) ||
        t.notes.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Trade Journal</h2>
          <p className="page-subtitle">{trades.length} trades logged</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditTrade(undefined);
            setShowForm(true);
          }}
        >
          + New Trade
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search by ticker or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state loading-pulse">Loading trades...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📈</div>
          <div className="empty-state-title">No trades yet</div>
          <div className="empty-state-desc">
            Start logging your trades to build your journal.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditTrade(undefined);
              setShowForm(true);
            }}
          >
            + Log Your First Trade
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={(t) => {
                setEditTrade(t);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TradeForm
          onSubmit={editTrade ? handleUpdate : handleAdd}
          onClose={() => {
            setShowForm(false);
            setEditTrade(undefined);
          }}
          initial={editTrade}
        />
      )}
    </div>
  );
}
