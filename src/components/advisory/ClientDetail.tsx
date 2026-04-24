'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Client, Insight, getInsightsByClient, addInsight, updateInsight, deleteInsight } from '@/lib/advisory';
import { detectTickers } from '@/lib/tickerDetect';
import TickerLink from '@/components/common/TickerLink';
import InsightForm from './InsightForm';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
}

const outcomeColors: Record<string, string> = {
  pending: 'badge-accent',
  profit: 'badge-success',
  loss: 'badge-danger',
  neutral: 'badge-warning',
};

const riskColors: Record<string, string> = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-danger',
};

export default function ClientDetail({ client, onBack }: ClientDetailProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editInsight, setEditInsight] = useState<Insight | undefined>();
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    if (!client.id) return;
    setLoading(true);
    try {
      const data = await getInsightsByClient(client.id);
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
    }
    setLoading(false);
  }, [client.id]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const handleAdd = async (insight: Omit<Insight, 'id'>) => {
    await addInsight(insight);
    await loadInsights();
  };

  const handleUpdate = async (insight: Omit<Insight, 'id'>) => {
    if (editInsight?.id) {
      await updateInsight(editInsight.id, insight);
      await loadInsights();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this insight?')) {
      await deleteInsight(id);
      await loadInsights();
    }
  };

  const profitCount = insights.filter((i) => i.outcome === 'profit').length;
  const lossCount = insights.filter((i) => i.outcome === 'loss').length;

  return (
    <div>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '16px' }}>
        ← Back to Clients
      </button>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{client.name}</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {client.type === 'group'
                ? `Group · ${client.members?.join(', ')}`
                : 'Individual'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${outcomeColors[client.riskProfile] || 'badge-accent'}`}>
            {client.riskProfile} risk
          </span>
          <span className="badge badge-success">{profitCount} wins</span>
          <span className="badge badge-danger">{lossCount} losses</span>
          <span className="badge badge-accent">{insights.length} total</span>
        </div>

        {client.notes && (
          <p style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {client.notes}
          </p>
        )}
      </div>

      <div className="page-header">
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Advice History</h3>
        <button className="btn btn-primary" onClick={() => { setEditInsight(undefined); setShowForm(true); }}>
          + Log Advice
        </button>
      </div>

      {loading ? (
        <div className="empty-state loading-pulse">Loading insights...</div>
      ) : insights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💡</div>
          <div className="empty-state-title">No advice logged yet</div>
          <div className="empty-state-desc">Start logging trade advice for this client.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.map((insight) => {
            const detectedTickers = detectTickers(insight.advice);
            return (
              <div key={insight.id} className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{insight.ticker}</span>
                    <span className={`badge ${riskColors[insight.riskLevel]}`}>
                      {insight.riskLevel} risk
                    </span>
                    <span className={`badge ${outcomeColors[insight.outcome]}`}>
                      {insight.outcome}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => { setEditInsight(insight); setShowForm(true); }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => insight.id && handleDelete(insight.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                  {insight.advice}
                </p>

                {detectedTickers.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                    {detectedTickers.map((t) => (
                      <TickerLink key={t.ticker} ticker={t} />
                    ))}
                  </div>
                )}

                {insight.outcomeNotes && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <strong>Outcome:</strong> {insight.outcomeNotes}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {new Date(insight.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && client.id && (
        <InsightForm
          clientId={client.id}
          onSubmit={editInsight ? handleUpdate : handleAdd}
          onClose={() => { setShowForm(false); setEditInsight(undefined); }}
          initial={editInsight}
        />
      )}
    </div>
  );
}
