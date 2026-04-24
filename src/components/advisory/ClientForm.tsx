'use client';

import React, { useState } from 'react';
import { Client } from '@/lib/advisory';
import { useAuth } from '@/contexts/AuthContext';

interface ClientFormProps {
  onSubmit: (client: Omit<Client, 'id'>) => Promise<void>;
  onClose: () => void;
  initial?: Client;
}

export default function ClientForm({ onSubmit, onClose, initial }: ClientFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initial?.name || '');
  const [riskProfile, setRiskProfile] = useState<Client['riskProfile']>(
    initial?.riskProfile || 'moderate'
  );
  const [type, setType] = useState<Client['type']>(initial?.type || 'individual');
  const [membersStr, setMembersStr] = useState(initial?.members?.join(', ') || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await onSubmit({
        uid: user.uid,
        name,
        riskProfile,
        type,
        members: type === 'group' ? membersStr.split(',').map((s) => s.trim()).filter(Boolean) : [],
        notes,
        createdAt: initial?.createdAt || new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save client:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit Client' : 'Add Client / Mentee'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client or group name"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as Client['type'])}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Risk Profile</label>
                <select
                  className="form-select"
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value as Client['riskProfile'])}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>

            {type === 'group' && (
              <div className="form-group">
                <label className="form-label">Group Members (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={membersStr}
                  onChange={(e) => setMembersStr(e.target.value)}
                  placeholder="e.g. Arjun, Karan, Sahil"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Background, preferences, remarks..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Update' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
