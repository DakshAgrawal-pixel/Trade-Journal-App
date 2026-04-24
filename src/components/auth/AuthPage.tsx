'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, configured } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar-logo" style={{ justifyContent: 'center' }}>
            <div className="sidebar-logo-icon">📊</div>
            TradeLog
          </div>
        </div>

        <h1 className="auth-title">Welcome to TradeLog</h1>
        <p className="auth-subtitle">
          Your personal trade journal & advisory CRM
        </p>

        {!configured && (
          <div
            style={{
              background: 'var(--warning-subtle)',
              color: 'var(--warning)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.82rem',
              lineHeight: '1.5',
            }}
          >
            <strong>⚠️ Firebase not configured</strong>
            <br />
            Copy <code>.env.local.example</code> → <code>.env.local</code> and
            add your Firebase credentials. Then restart the dev server.
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'var(--danger-subtle)',
              color: 'var(--danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleGoogleLogin}
          disabled={loading || !configured}
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '0.95rem',
            gap: '10px',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
            style={{ flexShrink: 0 }}
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          Sign in with your Google account to access your
          <br />
          trade journal, advisory log, and AI assistant.
        </p>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </div>
    </div>
  );
}
