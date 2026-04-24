'use client';

import React, { useState } from 'react';
import { Insight } from '@/lib/advisory';
import { useAuth } from '@/contexts/AuthContext';

interface InsightFormProps {
  clientId: string;
  onSubmit: (insight: Omit<Insight, 'id'>) => Promise<void>;
  onClose: () => void;
  initial?: Insight;
}

export default function InsightForm({ clientId, onSubmit, onClose, initial }: InsightFormProps) {
  const { user } = useAuth();
  const [ticker, setTicker] = useState(initial?.ticker || '');
  const [advice, setAdvice] = useState(initial?.advice || '');
  const [riskLevel, setRiskLevel] = useState<Insight['riskLevel']>(initial?.riskLevel || 'medium');
  const [outcome, setOutcome] = useState<Insight['outcome']>(initial?.outcome || 'pending');
  const [outcomeNotes, setOutcomeNotes] = useState(initial?.outcomeNotes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await onSubmit({
        clientId,
        uid: user.uid,
        ticker: ticker.toUpperCase(),
        advice,
        riskLevel,
        outcome,
        outcomeNotes,
        createdAt: initial?.createdAt || new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save insight:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Insight' : 'Log Advice'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ticker *</label>
              <input
                type="text"
                className="form-input"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="e.g. RELIANCE"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Advice / Insight *</label>
              <textarea
                className="form-textarea"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Describe the trade advice given..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Risk Level</label>
                <select
                  className="form-select"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as Insight['riskLevel'])}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Outcome</label>
                <select
                  className="form-select"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as Insight['outcome'])}
                >
                  <option value="pending">Pending</option>
                  <option value="profit">Profit</option>
                  <option value="loss">Loss</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Outcome Notes</label>
              <textarea
                className="form-textarea"
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="What happened? Lessons learned..."
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Update' : 'Log Insight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
