'use client';

import React, { useState } from 'react';
import { Trade } from '@/lib/trades';
import { uploadChartImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>) => Promise<void>;
  onClose: () => void;
  initial?: Trade;
}

export default function TradeForm({ onSubmit, onClose, initial }: TradeFormProps) {
  const { user } = useAuth();
  const [ticker, setTicker] = useState(initial?.ticker || '');
  const [entryPrice, setEntryPrice] = useState(initial?.entryPrice?.toString() || '');
  const [exitPrice, setExitPrice] = useState(initial?.exitPrice?.toString() || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initial?.notes || '');
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let chartUrl = initial?.chartUrl || '';
      if (chartFile) {
        chartUrl = await uploadChartImage(user.uid, chartFile);
      }

      await onSubmit({
        uid: user.uid,
        ticker: ticker.toUpperCase(),
        entryPrice: parseFloat(entryPrice),
        exitPrice: exitPrice ? parseFloat(exitPrice) : null,
        date,
        notes,
        chartUrl,
        status: exitPrice ? 'closed' : 'open',
        createdAt: initial?.createdAt || new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save trade:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initial ? 'Edit Trade' : 'Log New Trade'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ticker Symbol *</label>
              <input
                type="text"
                className="form-input"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="e.g. RELIANCE, AAPL"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Entry Price *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Exit Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="Leave blank if open"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Trade Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Rationale, setup, observations..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chart Screenshot</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setChartFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Update Trade' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
