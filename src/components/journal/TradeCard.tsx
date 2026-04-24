'use client';

import React from 'react';
import { Trade } from '@/lib/trades';
import { detectTickers } from '@/lib/tickerDetect';
import TickerLink from '@/components/common/TickerLink';

interface TradeCardProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export default function TradeCard({ trade, onEdit, onDelete }: TradeCardProps) {
  const pnl =
    trade.exitPrice !== null
      ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100
      : null;

  const detectedTickers = detectTickers(trade.notes);

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{trade.ticker}</span>
          <span className={`badge ${trade.status === 'open' ? 'badge-accent' : pnl !== null && pnl >= 0 ? 'badge-success' : 'badge-danger'}`}>
            {trade.status === 'open'
              ? 'Open'
              : pnl !== null
              ? `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%`
              : 'Closed'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => onEdit(trade)} title="Edit">
            ✏️
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => trade.id && onDelete(trade.id)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entry</div>
          <div style={{ fontWeight: 600 }}>₹{trade.entryPrice.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exit</div>
          <div style={{ fontWeight: 600 }}>
            {trade.exitPrice !== null ? `₹${trade.exitPrice.toLocaleString()}` : '—'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {trade.date}
      </div>

      {trade.notes && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {trade.notes}
        </div>
      )}

      {detectedTickers.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {detectedTickers.map((t) => (
            <TickerLink key={t.ticker} ticker={t} />
          ))}
        </div>
      )}

      {trade.chartUrl && (
        <div style={{ marginTop: '8px' }}>
          <img
            src={trade.chartUrl}
            alt={`${trade.ticker} chart`}
            style={{
              width: '100%',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      )}
    </div>
  );
}
