'use client';

import React from 'react';
import { DetectedTicker } from '@/lib/tickerDetect';

interface TickerLinkProps {
  ticker: DetectedTicker;
}

export default function TickerLink({ ticker }: TickerLinkProps) {
  return (
    <span className="ticker-chip">
      ${ticker.ticker}
      <span className="ticker-links">
        <a
          href={ticker.tradingViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ticker-link"
          onClick={(e) => e.stopPropagation()}
        >
          TV
        </a>
        <a
          href={ticker.growwUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ticker-link"
          onClick={(e) => e.stopPropagation()}
        >
          Groww
        </a>
      </span>
    </span>
  );
}
