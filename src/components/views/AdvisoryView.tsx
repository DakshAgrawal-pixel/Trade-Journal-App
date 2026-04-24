'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Client,
  getClientsByUser,
  addClient,
  updateClient,
  deleteClient,
  getInsightsByClient,
} from '@/lib/advisory';
import ClientCard from '@/components/advisory/ClientCard';
import ClientForm from '@/components/advisory/ClientForm';
import ClientDetail from '@/components/advisory/ClientDetail';

export default function AdvisoryView() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [insightCounts, setInsightCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | undefined>();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getClientsByUser(user.uid);
      setClients(data);

      // Load insight counts in parallel instead of sequentially
      const clientsWithIds = data.filter((c) => c.id);
      const insightResults = await Promise.all(
        clientsWithIds.map((c) => getInsightsByClient(c.id!))
      );
      const counts: Record<string, number> = {};
      clientsWithIds.forEach((c, i) => {
        counts[c.id!] = insightResults[i].length;
      });
      setInsightCounts(counts);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleAdd = async (client: Omit<Client, 'id'>) => {
    await addClient(client);
    await loadClients();
  };

  const handleUpdate = async (client: Omit<Client, 'id'>) => {
    if (editClient?.id) {
      await updateClient(editClient.id, client);
      await loadClients();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this client and all their insights?')) {
      await deleteClient(id);
      await loadClients();
    }
  };

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.members?.some((m) => m.toLowerCase().includes(search.toLowerCase()))
  );

  if (selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => {
          setSelectedClient(null);
          loadClients();
        }}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Advisory Log</h2>
          <p className="page-subtitle">{clients.length} clients & mentees</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditClient(undefined);
            setShowForm(true);
          }}
        >
          + Add Client
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state loading-pulse">Loading clients...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No clients yet</div>
          <div className="empty-state-desc">
            Add your first client or mentee to start tracking advisory insights.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditClient(undefined);
              setShowForm(true);
            }}
          >
            + Add First Client
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              insightCount={client.id ? insightCounts[client.id] || 0 : 0}
              onClick={() => setSelectedClient(client)}
              onEdit={() => {
                setEditClient(client);
                setShowForm(true);
              }}
              onDelete={() => client.id && handleDelete(client.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ClientForm
          onSubmit={editClient ? handleUpdate : handleAdd}
          onClose={() => {
            setShowForm(false);
            setEditClient(undefined);
          }}
          initial={editClient}
        />
      )}
    </div>
  );
}
