'use client';

import React from 'react';
import { Client } from '@/lib/advisory';

interface ClientCardProps {
  client: Client;
  insightCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const riskColors: Record<string, string> = {
  conservative: 'badge-success',
  moderate: 'badge-warning',
  aggressive: 'badge-danger',
};

export default function ClientCard({
  client,
  insightCount,
  onClick,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
            {client.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {client.type === 'group'
                ? `Group · ${client.members?.length || 0} members`
                : 'Individual'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <span className={`badge ${riskColors[client.riskProfile]}`}>
          {client.riskProfile}
        </span>
        <span className="badge badge-accent">{insightCount} insights</span>
      </div>

      {client.members && client.members.length > 0 && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Members: {client.members.join(', ')}
        </div>
      )}

      {client.notes && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {client.notes.length > 100 ? client.notes.slice(0, 100) + '...' : client.notes}
        </div>
      )}
    </div>
  );
}
