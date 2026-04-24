'use client';

import React, { useState } from 'react';

interface BrainDumpProps {
  onExtract: (text: string) => Promise<void>;
  loading: boolean;
}

export default function BrainDump({ onExtract, loading }: BrainDumpProps) {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onExtract(text);
  };

  return (
    <div className="ai-input-area">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Brain Dump</label>
          <textarea
            className="form-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your rough trading notes here... 

Example: 'Bought Reliance around 2450, thinking it'll bounce off the 200 DMA. Target 2650, stopping out below 2380. Chart setup looks like a cup and handle.'"
            rows={10}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !text.trim()}
          style={{ width: '100%' }}
        >
          {loading ? '🤖 Analyzing...' : '🤖 Extract Trade Details'}
        </button>
      </form>
    </div>
  );
}
