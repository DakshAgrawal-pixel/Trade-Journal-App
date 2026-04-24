'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addTrade } from '@/lib/trades';
import { detectTickers } from '@/lib/tickerDetect';
import TickerLink from '@/components/common/TickerLink';
import BrainDump from '@/components/assistant/BrainDump';

interface ExtractedTrade {
  ticker: string;
  entryPrice: number;
  exitPrice: number | null;
  rationale: string;
  confidence: string;
  notes: string;
}

export default function AssistantView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedTrade | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async (text: string) => {
    setLoading(true);
    setError('');
    setExtracted(null);
    setSaved(false);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('AI extraction failed');

      const data = await res.json();
      setExtracted(data.extracted);
    } catch (err: any) {
      setError(err.message || 'Failed to extract trade data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extracted || !user) return;
    setLoading(true);
    try {
      await addTrade({
        uid: user.uid,
        ticker: extracted.ticker,
        entryPrice: extracted.entryPrice,
        exitPrice: extracted.exitPrice,
        date: new Date().toISOString().split('T')[0],
        notes: extracted.rationale + (extracted.notes ? '\n\n' + extracted.notes : ''),
        chartUrl: '',
        status: extracted.exitPrice ? 'closed' : 'open',
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save trade');
    } finally {
      setLoading(false);
    }
  };

  const detectedTickers = extracted ? detectTickers(extracted.rationale) : [];

  const confidenceColor =
    extracted?.confidence === 'high'
      ? 'badge-success'
      : extracted?.confidence === 'medium'
      ? 'badge-warning'
      : 'badge-danger';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">AI Assistant</h2>
          <p className="page-subtitle">
            Brain-dump your trading notes and let AI structure them
          </p>
        </div>
      </div>

      <div className="ai-container">
        <BrainDump onExtract={handleExtract} loading={loading} />

        <div className="ai-preview">
          <div className="ai-preview-label">Extracted Trade Data</div>

          {error && (
            <div
              style={{
                background: 'var(--danger-subtle)',
                color: 'var(--danger)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px',
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          {!extracted && !loading && (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">🤖</div>
              <div className="empty-state-title">Waiting for input</div>
              <div className="empty-state-desc">
                Paste your rough notes and click extract.
              </div>
            </div>
          )}

          {loading && (
            <div className="empty-state loading-pulse" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">⚡</div>
              <div className="empty-state-title">Processing with AI...</div>
            </div>
          )}

          {extracted && (
            <div>
              <div className="ai-field">
                <div className="ai-field-label">Ticker</div>
                <div className="ai-field-value" style={{ fontSize: '1.2rem' }}>
                  {extracted.ticker}
                  <span className={`badge ${confidenceColor}`} style={{ marginLeft: '8px' }}>
                    {extracted.confidence} confidence
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ai-field">
                  <div className="ai-field-label">Entry Price</div>
                  <div className="ai-field-value">
                    {extracted.entryPrice ? `₹${extracted.entryPrice.toLocaleString()}` : '—'}
                  </div>
                </div>
                <div className="ai-field">
                  <div className="ai-field-label">Exit Price</div>
                  <div className="ai-field-value">
                    {extracted.exitPrice ? `₹${extracted.exitPrice.toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>

              <div className="ai-field" style={{ marginTop: '8px' }}>
                <div className="ai-field-label">Rationale</div>
                <div className="ai-field-value" style={{ fontSize: '0.88rem', fontWeight: 400 }}>
                  {extracted.rationale}
                </div>
              </div>

              {extracted.notes && (
                <div className="ai-field" style={{ marginTop: '4px' }}>
                  <div className="ai-field-label">Additional Notes</div>
                  <div className="ai-field-value" style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                    {extracted.notes}
                  </div>
                </div>
              )}

              {detectedTickers.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0' }}>
                  {detectedTickers.map((t) => (
                    <TickerLink key={t.ticker} ticker={t} />
                  ))}
                </div>
              )}

              {saved ? (
                <div
                  style={{
                    background: 'var(--success-subtle)',
                    color: 'var(--success)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '16px',
                    fontSize: '0.88rem',
                    textAlign: 'center',
                  }}
                >
                  ✅ Trade saved to your journal!
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  💾 Save to Journal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
