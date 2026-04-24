/**
 * Smart Ticker Detection
 * Detects stock tickers in text and provides links to TradingView & Groww.
 */

// Common Indian & US tickers pattern: $AAPL, RELIANCE, TCS, INFY etc.
const TICKER_REGEX = /\$?([A-Z]{2,10})(?:\b)/g;

// Exclude common English words that look like tickers
const EXCLUDE = new Set([
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN',
  'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HIS', 'HOW', 'ITS',
  'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'DID', 'GET',
  'HAS', 'HIM', 'LET', 'SAY', 'SHE', 'TOO', 'USE', 'WITH', 'WILL',
  'BUY', 'SELL', 'LONG', 'SHORT', 'CALL', 'PUT', 'STOP', 'LOSS',
  'FROM', 'THAT', 'THIS', 'HAVE', 'BEEN', 'THEY', 'EACH', 'MAKE',
  'LIKE', 'JUST', 'OVER', 'SUCH', 'TAKE', 'YEAR', 'THEM', 'SOME',
  'THAN', 'WHAT', 'WHEN', 'OPEN', 'HIGH', 'LOW', 'CLOSE', 'RISK',
  'NOTE', 'NOTES', 'EXIT', 'ENTRY', 'PRICE', 'TRADE', 'STOCK',
]);

export interface DetectedTicker {
  ticker: string;
  tradingViewUrl: string;
  growwUrl: string;
}

export function detectTickers(text: string): DetectedTicker[] {
  const matches = new Set<string>();
  let match;
  const regex = new RegExp(TICKER_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    const ticker = match[1];
    if (!EXCLUDE.has(ticker) && ticker.length >= 2) {
      matches.add(ticker);
    }
  }
  return Array.from(matches).map((ticker) => ({
    ticker,
    tradingViewUrl: `https://www.tradingview.com/chart/?symbol=${ticker}`,
    growwUrl: `https://groww.in/stocks/${ticker.toLowerCase()}`,
  }));
}

/**
 * Returns text with tickers wrapped in a special delimiter for React rendering.
 * Format: {{TICKER:SYMBOL}}
 */
export function markTickers(text: string): string {
  const regex = new RegExp(TICKER_REGEX.source, 'g');
  return text.replace(regex, (match, ticker) => {
    if (EXCLUDE.has(ticker) || ticker.length < 2) return match;
    return `{{TICKER:${ticker}}}`;
  });
}
