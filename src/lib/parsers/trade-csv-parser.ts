import Papa from 'papaparse';
import type { InstrumentType, TradeDirection } from '@/types/trading';

export type DetectedPlatform =
  | 'ninjatrader'
  | 'tradovate'
  | 'topstepx'
  | 'quantower'
  | 'tradingview'
  | 'generic';

export interface ParsedRawTrade {
  id: string; // temporary client UUID
  selected: boolean;
  trade_date: string; // ISO format or YYYY-MM-DD HH:mm:ss
  instrument: InstrumentType;
  direction: TradeDirection;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  stop_loss_ticks?: number | null;
  take_profit_ticks?: number | null;
  risk_dollars: number;
  pnl_dollars: number;
  pnl_r: number;
  quantity?: number;
  session_tag?: string; // "NY AM (09:30 - 12:00)", "London", etc.
  technique_tag?: string; // "Volume Profile (VAH/VAL/POC)", "Session VWAP", "IFVG", "BPR", etc.
  mindset?: string; // "Discipliné / Zen", "FOMO", etc.
  notes?: string;
  plan_followed: boolean;
  raw_source?: string;
}

export interface ParseResult {
  success: boolean;
  platform: DetectedPlatform;
  platformName: string;
  trades: ParsedRawTrade[];
  errors: string[];
  totalRawRows: number;
}

// Tick values for CME Futures
const TICK_SPECS: Record<InstrumentType, { tickSize: number; tickValue: number }> = {
  NQ: { tickSize: 0.25, tickValue: 5.0 },
  MNQ: { tickSize: 0.25, tickValue: 0.5 },
  ES: { tickSize: 0.25, tickValue: 12.5 },
  MES: { tickSize: 0.25, tickValue: 1.25 },
};

export function normalizeInstrument(raw: string | undefined | null): InstrumentType {
  if (!raw) return 'NQ';
  const clean = raw.toUpperCase().trim();
  if (clean.includes('MNQ') || clean.includes('MICRO NQ') || clean.includes('NQM')) return 'MNQ';
  if (clean.includes('MES') || clean.includes('MICRO ES') || clean.includes('ESM')) return 'MES';
  if (clean.includes('ES') || clean.includes('S&P') || clean.includes('SP500')) return 'ES';
  return 'NQ';
}

function detectSessionFromTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'NY AM (09:30 - 12:00)';
    // Note: If parsing UTC/local time
    const hours = d.getHours();
    if (hours >= 2 && hours < 8) return 'Asie / Londres Pré-market';
    if (hours >= 8 && hours < 14) return 'London Open (08:00 - 14:00)';
    if (hours >= 14 && hours < 18) return 'NY AM (14:30 - 17:30 / 09:30-12:30 EST)';
    if (hours >= 18 && hours <= 22) return 'NY PM (18:00 - 22:00 / 13:00-16:00 EST)';
    return 'NY AM (09:30 - 12:00)';
  } catch {
    return 'NY AM (09:30 - 12:00)';
  }
}

function sanitizeNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val)
    .replace(/[$€£\s,]/g, (match) => (match === ',' ? '.' : ''))
    .replace(/[()]/g, (m) => (m === '(' ? '-' : ''));
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function generateTempId(): string {
  return 'trade_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Main Universal CSV Parse Function
 */
export function parseTradingCsv(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    platform: 'generic',
    platformName: 'Importateur Universel',
    trades: [],
    errors: [],
    totalRawRows: 0,
  };

  if (!csvContent || csvContent.trim().length === 0) {
    result.errors.push('Le fichier CSV est vide.');
    return result;
  }

  // Parse CSV with PapaParse
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
    result.errors.push('Erreur lors de la lecture du format CSV : ' + parsed.errors[0].message);
    return result;
  }

  const rows = parsed.data;
  result.totalRawRows = rows.length;

  if (rows.length === 0) {
    result.errors.push('Aucune ligne de données trouvée dans le CSV.');
    return result;
  }

  const headers = Object.keys(rows[0] || {}).map((h) => h.toLowerCase());

  // 1. NinjaTrader 8 detection
  const isNinjaTrader =
    headers.some((h) => h.includes('trade #') || h.includes('market pos.')) ||
    (headers.includes('instrument') && headers.includes('entry price') && headers.includes('exit price')) ||
    (headers.includes('execution id') && headers.includes('order id'));

  // 2. Tradovate / NinjaTrader Web detection
  const isTradovate =
    headers.some((h) => h.includes('accountspec') || h.includes('orderqty') || h.includes('contract')) ||
    (headers.includes('contract') && headers.includes('buy price') && headers.includes('sell price')) ||
    (headers.includes('contract') && headers.includes('realized p&l'));

  // 3. TopstepX detection
  const isTopstepX =
    headers.some((h) => h.includes('trade id') && h.includes('symbol') && (h.includes('gross pnl') || h.includes('net pnl'))) ||
    headers.some((h) => h.includes('topstep'));

  // 4. Quantower / Rithmic detection
  const isQuantower =
    headers.some((h) => h.includes('gross p/l') || h.includes('net p/l')) ||
    (headers.includes('open time') && headers.includes('close time') && headers.includes('open price'));

  // 5. TradingView detection
  const isTradingView =
    headers.includes('trade #') && (headers.includes('cum. profit') || headers.includes('drawdown'));

  if (isNinjaTrader) {
    result.platform = 'ninjatrader';
    result.platformName = 'NinjaTrader 8';
    result.trades = parseNinjaTrader(rows);
  } else if (isTradovate) {
    result.platform = 'tradovate';
    result.platformName = 'Tradovate / NinjaTrader Web';
    result.trades = parseTradovate(rows);
  } else if (isTopstepX) {
    result.platform = 'topstepx';
    result.platformName = 'TopstepX';
    result.trades = parseTopstepX(rows);
  } else if (isQuantower) {
    result.platform = 'quantower';
    result.platformName = 'Quantower / Rithmic';
    result.trades = parseQuantower(rows);
  } else if (isTradingView) {
    result.platform = 'tradingview';
    result.platformName = 'TradingView';
    result.trades = parseTradingView(rows);
  } else {
    result.platform = 'generic';
    result.platformName = 'Format Générique / Broker CSV';
    result.trades = parseGeneric(rows);
  }

  if (result.trades.length === 0) {
    result.errors.push('Aucun trade valide n’a pu être extrait. Vérifiez les colonnes du fichier CSV.');
    result.success = false;
  } else {
    result.success = true;
  }

  return result;
}

// ----------------------------------------------------
// Specific Platform Parsers
// ----------------------------------------------------

function parseNinjaTrader(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    // Check if Trade Performance format
    const instrument = normalizeInstrument(row['Instrument'] || row['instrument'] || 'NQ');
    const marketPos = (row['Market pos.'] || row['Market Pos'] || row['Side'] || row['Direction'] || '').toLowerCase();
    const direction: TradeDirection = marketPos.includes('short') || marketPos.includes('sell') ? 'Short' : 'Long';

    const entryPrice = sanitizeNumber(row['Entry price'] || row['Entry Price'] || row['Price'] || row['Avg Price']);
    const exitPrice = sanitizeNumber(row['Exit price'] || row['Exit Price'] || row['Close Price']);
    const pnlDollars = sanitizeNumber(
      row['Profit/Loss ($)'] || row['Profit/Loss'] || row['Profit ($)'] || row['P&L ($)'] || row['Realized PnL'] || row['PnL']
    );

    const entryTimeRaw = row['Entry time'] || row['Entry Time'] || row['Time'] || row['Date'] || new Date().toISOString();
    const formattedDate = new Date(entryTimeRaw).toISOString().slice(0, 16);

    // Calculate R based on default 20 ticks stop loss ($100 on NQ, $10 on MNQ)
    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20; // 20 ticks standard risk
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;

    const qty = parseInt(row['Qty'] || row['Quantity'] || '1', 10) || 1;

    if (entryPrice > 0 || pnlDollars !== 0) {
      trades.push({
        id: generateTempId(),
        selected: true,
        trade_date: formattedDate,
        instrument,
        direction,
        entry_price: entryPrice > 0 ? entryPrice : null,
        exit_price: exitPrice > 0 ? exitPrice : null,
        stop_loss: null,
        take_profit: null,
        stop_loss_ticks: 20,
        take_profit_ticks: null,
        risk_dollars: defaultRiskDollars * qty,
        pnl_dollars: pnlDollars,
        pnl_r: pnlR,
        quantity: qty,
        session_tag: detectSessionFromTime(entryTimeRaw),
        technique_tag: 'Volume Profile (VAH/VAL/POC)',
        mindset: pnlDollars >= 0 ? 'Discipliné / Conforme au Plan' : 'Discipliné / Stop Touché',
        notes: `Importé depuis NinjaTrader 8 • ${qty} contrat(s)`,
        plan_followed: true,
        raw_source: JSON.stringify(row),
      });
    }
  }

  return trades;
}

function parseTradovate(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    const rawContract = row['contract'] || row['Contract'] || row['Symbol'] || 'NQ';
    const instrument = normalizeInstrument(rawContract);

    const side = (row['action'] || row['Side'] || row['side'] || row['B/S'] || '').toLowerCase();
    const direction: TradeDirection = side.includes('sell') || side.includes('short') ? 'Short' : 'Long';

    const entryPrice = sanitizeNumber(row['buyPrice'] || row['Buy Price'] || row['price'] || row['Price'] || row['avgPrice']);
    const exitPrice = sanitizeNumber(row['sellPrice'] || row['Sell Price'] || row['exitPrice']);
    const pnlDollars = sanitizeNumber(row['realizedPnl'] || row['Realized P&L'] || row['pnl'] || row['PnL'] || row['P&L']);

    const timeRaw = row['fillTime'] || row['Fill Time'] || row['openTime'] || row['Open Time'] || row['timestamp'] || new Date().toISOString();
    const formattedDate = new Date(timeRaw).toISOString().slice(0, 16);

    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20;
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;
    const qty = parseInt(row['orderQty'] || row['Qty'] || row['qty'] || '1', 10) || 1;

    if (entryPrice > 0 || pnlDollars !== 0) {
      trades.push({
        id: generateTempId(),
        selected: true,
        trade_date: formattedDate,
        instrument,
        direction,
        entry_price: entryPrice > 0 ? entryPrice : null,
        exit_price: exitPrice > 0 ? exitPrice : null,
        stop_loss: null,
        take_profit: null,
        stop_loss_ticks: 20,
        take_profit_ticks: null,
        risk_dollars: defaultRiskDollars * qty,
        pnl_dollars: pnlDollars,
        pnl_r: pnlR,
        quantity: qty,
        session_tag: detectSessionFromTime(timeRaw),
        technique_tag: 'Session VWAP Confluence',
        mindset: 'Discipliné / Conforme au Plan',
        notes: `Importé depuis Tradovate / NinjaTrader Web • ${qty} contrat(s)`,
        plan_followed: true,
      });
    }
  }

  return trades;
}

function parseTopstepX(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    const symbol = row['Symbol'] || row['symbol'] || row['Contract'] || 'NQ';
    const instrument = normalizeInstrument(symbol);

    const side = (row['Side'] || row['side'] || row['Type'] || '').toLowerCase();
    const direction: TradeDirection = side.includes('sell') || side.includes('short') ? 'Short' : 'Long';

    const entryPrice = sanitizeNumber(row['Entry Price'] || row['EntryPrice'] || row['openPrice']);
    const exitPrice = sanitizeNumber(row['Exit Price'] || row['ExitPrice'] || row['closePrice']);
    const pnlDollars = sanitizeNumber(row['Net PnL'] || row['Net P&L'] || row['Gross PnL'] || row['PnL'] || row['Total PnL']);

    const entryTime = row['Entry Time'] || row['EntryTime'] || row['Open Time'] || new Date().toISOString();
    const formattedDate = new Date(entryTime).toISOString().slice(0, 16);

    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20;
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;
    const qty = parseInt(row['Size'] || row['Qty'] || '1', 10) || 1;

    trades.push({
      id: generateTempId(),
      selected: true,
      trade_date: formattedDate,
      instrument,
      direction,
      entry_price: entryPrice > 0 ? entryPrice : null,
      exit_price: exitPrice > 0 ? exitPrice : null,
      stop_loss: null,
      take_profit: null,
      stop_loss_ticks: 20,
      take_profit_ticks: null,
      risk_dollars: defaultRiskDollars * qty,
      pnl_dollars: pnlDollars,
      pnl_r: pnlR,
      quantity: qty,
      session_tag: detectSessionFromTime(entryTime),
      technique_tag: 'IFVG (Inverse Fair Value Gap)',
      mindset: 'Discipliné / Conforme au Plan',
      notes: `Importé depuis TopstepX • ${qty} contrat(s)`,
      plan_followed: true,
    });
  }

  return trades;
}

function parseQuantower(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    const symbol = row['Symbol'] || row['Instrument'] || 'NQ';
    const instrument = normalizeInstrument(symbol);

    const side = (row['Side'] || row['Direction'] || '').toLowerCase();
    const direction: TradeDirection = side.includes('sell') || side.includes('short') ? 'Short' : 'Long';

    const entryPrice = sanitizeNumber(row['Open Price'] || row['Price']);
    const exitPrice = sanitizeNumber(row['Close Price']);
    const pnlDollars = sanitizeNumber(row['Net P/L'] || row['Gross P/L'] || row['P/L'] || row['Realized PnL']);

    const openTime = row['Open Time'] || row['Time'] || new Date().toISOString();
    const formattedDate = new Date(openTime).toISOString().slice(0, 16);

    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20;
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;
    const qty = parseInt(row['Quantity'] || row['Qty'] || '1', 10) || 1;

    trades.push({
      id: generateTempId(),
      selected: true,
      trade_date: formattedDate,
      instrument,
      direction,
      entry_price: entryPrice > 0 ? entryPrice : null,
      exit_price: exitPrice > 0 ? exitPrice : null,
      stop_loss: null,
      take_profit: null,
      stop_loss_ticks: 20,
      take_profit_ticks: null,
      risk_dollars: defaultRiskDollars * qty,
      pnl_dollars: pnlDollars,
      pnl_r: pnlR,
      quantity: qty,
      session_tag: detectSessionFromTime(openTime),
      technique_tag: 'BPR (Balanced Price Range)',
      mindset: 'Discipliné / Conforme au Plan',
      notes: `Importé depuis Quantower / Rithmic • ${qty} contrat(s)`,
      plan_followed: true,
    });
  }

  return trades;
}

function parseTradingView(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    const type = (row['Type'] || row['Side'] || '').toLowerCase();
    const direction: TradeDirection = type.includes('short') || type.includes('sell') ? 'Short' : 'Long';
    const instrument = normalizeInstrument(row['Symbol'] || 'NQ');

    const entryPrice = sanitizeNumber(row['Price'] || row['Entry Price']);
    const pnlDollars = sanitizeNumber(row['Profit'] || row['Profit/Loss'] || row['PnL']);

    const dateTime = row['Date/Time'] || row['Date'] || row['Time'] || new Date().toISOString();
    const formattedDate = new Date(dateTime).toISOString().slice(0, 16);

    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20;
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;
    const qty = parseInt(row['Contracts'] || '1', 10) || 1;

    trades.push({
      id: generateTempId(),
      selected: true,
      trade_date: formattedDate,
      instrument,
      direction,
      entry_price: entryPrice > 0 ? entryPrice : null,
      exit_price: null,
      stop_loss: null,
      take_profit: null,
      stop_loss_ticks: 20,
      take_profit_ticks: null,
      risk_dollars: defaultRiskDollars * qty,
      pnl_dollars: pnlDollars,
      pnl_r: pnlR,
      quantity: qty,
      session_tag: detectSessionFromTime(dateTime),
      technique_tag: 'FVG (Fair Value Gap)',
      mindset: 'Discipliné / Conforme au Plan',
      notes: `Importé depuis TradingView • ${qty} contrat(s)`,
      plan_followed: true,
    });
  }

  return trades;
}

function parseGeneric(rows: Record<string, string>[]): ParsedRawTrade[] {
  const trades: ParsedRawTrade[] = [];

  for (const row of rows) {
    const keys = Object.keys(row);

    // Find date field
    const dateKey = keys.find((k) => /date|time|heure|jour/i.test(k));
    const dateVal = dateKey ? row[dateKey] : new Date().toISOString();
    let formattedDate = new Date().toISOString().slice(0, 16);
    try {
      const parsedD = new Date(dateVal);
      if (!isNaN(parsedD.getTime())) {
        formattedDate = parsedD.toISOString().slice(0, 16);
      }
    } catch {
      // fallback
    }

    // Find instrument field
    const instKey = keys.find((k) => /symbol|instrument|contract|asset|ticker/i.test(k));
    const instrument = normalizeInstrument(instKey ? row[instKey] : 'NQ');

    // Find direction field
    const dirKey = keys.find((k) => /side|direction|type|action|pos/i.test(k));
    const dirVal = dirKey ? (row[dirKey] || '').toLowerCase() : 'long';
    const direction: TradeDirection = dirVal.includes('short') || dirVal.includes('sell') || dirVal.includes('vente') ? 'Short' : 'Long';

    // Find price fields
    const entryPriceKey = keys.find((k) => /entry|open\s*price|prix\s*d['’]entr|buy\s*price/i.test(k)) || keys.find((k) => /price|prix/i.test(k));
    const exitPriceKey = keys.find((k) => /exit|close\s*price|prix\s*de\s*sort|sell\s*price/i.test(k));
    const entryPrice = entryPriceKey ? sanitizeNumber(row[entryPriceKey]) : null;
    const exitPrice = exitPriceKey ? sanitizeNumber(row[exitPriceKey]) : null;

    // Find PnL field
    const pnlKey = keys.find((k) => /pnl|profit|p&l|gain|perte|realized/i.test(k));
    const pnlDollars = pnlKey ? sanitizeNumber(row[pnlKey]) : 0;

    const qtyKey = keys.find((k) => /qty|quantity|size|quantit|contrat/i.test(k));
    const qty = qtyKey ? parseInt(row[qtyKey], 10) || 1 : 1;

    const tickSpec = TICK_SPECS[instrument];
    const defaultRiskDollars = tickSpec.tickValue * 20;
    const pnlR = defaultRiskDollars > 0 ? Number((pnlDollars / defaultRiskDollars).toFixed(2)) : 0;

    if (entryPrice || pnlDollars !== 0) {
      trades.push({
        id: generateTempId(),
        selected: true,
        trade_date: formattedDate,
        instrument,
        direction,
        entry_price: entryPrice && entryPrice > 0 ? entryPrice : null,
        exit_price: exitPrice && exitPrice > 0 ? exitPrice : null,
        stop_loss: null,
        take_profit: null,
        stop_loss_ticks: 20,
        take_profit_ticks: null,
        risk_dollars: defaultRiskDollars * qty,
        pnl_dollars: pnlDollars,
        pnl_r: pnlR,
        quantity: qty,
        session_tag: detectSessionFromTime(dateVal),
        technique_tag: 'Volume Profile (VAH/VAL/POC)',
        mindset: pnlDollars >= 0 ? 'Discipliné / Conforme au Plan' : 'Discipliné / Stop Touché',
        notes: `Importé via CSV générique • ${qty} contrat(s)`,
        plan_followed: true,
      });
    }
  }

  return trades;
}
