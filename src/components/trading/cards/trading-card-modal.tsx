'use client';

import React, { useState, useRef } from 'react';
import { Trade } from '@/types/trading';
import { toPng, toBlob } from 'html-to-image';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  EyeOff,
  Eye,
  TrendingUp,
  TrendingDown,
  X,
  Share2,
  Smartphone,
  Square,
  Shield,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export type CardTheme = 'cyber' | 'indigo' | 'gold';
export type CardFormat = 'square' | 'story';

interface TradingCardModalProps {
  trade: Trade;
  triggerButtonText?: string;
  className?: string;
  userHandle?: string;
}

export function TradingCardModal({
  trade,
  triggerButtonText = 'Créer ma Trading Card',
  className = '',
  userHandle = 'OPAL TRADER',
}: TradingCardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<CardTheme>(trade.pnl_r >= 3 ? 'gold' : 'cyber');
  const [format, setFormat] = useState<CardFormat>('square');
  const [maskDollars, setMaskDollars] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(Boolean(trade.screenshot_url));
  const [includePsychology, setIncludePsychology] = useState(true);
  const [traderName, setTraderName] = useState(userHandle);
  const [customSetup, setCustomSetup] = useState(
    (trade as any).setup || trade.market_context || (trade.direction === 'Long' ? 'Bullish Expansion' : 'Bearish Sweep')
  );

  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const isWin = Number(trade.pnl_r) > 0;
  const isLoss = Number(trade.pnl_r) < 0;
  const pnlR = Number(trade.pnl_r) || 0;
  const pnlDollars = Number(trade.pnl_dollars) || 0;

  const dateFormatted = new Date(trade.trade_date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      const link = document.createElement('a');
      link.download = `OPAL-Card-${trade.instrument}-${pnlR >= 0 ? '+' : ''}${pnlR.toFixed(1)}R-${format}.png`;
      link.href = dataUrl;
      link.click();

      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Erreur export image:', err);
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback to download if ClipboardItem not supported
        handleDownload();
      }
      setIsExporting(false);
    } catch (err) {
      console.error('Erreur copie image:', err);
      setIsExporting(false);
      // Fallback
      handleDownload();
    }
  };

  // Theme Configs
  const themeStyles = {
    cyber: {
      cardBg: 'from-[#090A0F] via-[#0E1017] to-[#08090D]',
      borderColor: 'border-[#39FF14]/30',
      glowColor: 'shadow-[0_0_50px_rgba(57,255,20,0.15)]',
      accentColor: '#39FF14',
      badgeBg: 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30',
      radialGradient: 'radial-gradient(circle at top right, rgba(57,255,20,0.12), transparent 60%)',
    },
    indigo: {
      cardBg: 'from-[#070913] via-[#0D1224] to-[#060812]',
      borderColor: 'border-[#00F0FF]/30',
      glowColor: 'shadow-[0_0_50px_rgba(0,240,255,0.18)]',
      accentColor: '#00F0FF',
      badgeBg: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
      radialGradient: 'radial-gradient(circle at top right, rgba(0,240,255,0.15), transparent 60%)',
    },
    gold: {
      cardBg: 'from-[#0F0C06] via-[#1A1408] to-[#0A0803]',
      borderColor: 'border-[#FFD700]/40',
      glowColor: 'shadow-[0_0_50px_rgba(255,215,0,0.22)]',
      accentColor: '#FFD700',
      badgeBg: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30',
      radialGradient: 'radial-gradient(circle at top right, rgba(255,215,0,0.18), transparent 60%)',
    },
  };

  const curTheme = themeStyles[theme];

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 hover:from-amber-500/20 hover:to-emerald-500/20 border border-[#39FF14]/30 text-white text-xs font-bold shadow-lg hover:shadow-[#39FF14]/15 transition-all duration-200 group ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#39FF14] group-hover:rotate-12 transition-transform" />
        <span>{triggerButtonText}</span>
        <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] text-[#39FF14] font-mono uppercase tracking-wider">
          Viral ⚡
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0B0C10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10121A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Studio Trading Cards & Proof-of-Trade
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-mono font-semibold">
                      OPAL VIRAL ENGINE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Générez une carte HD ultra-stylisée prête à être partagée sur Discord, Twitter/X ou Instagram Stories.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Controls on Left, Live Render on Right */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Format Switcher */}
                <div>
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                    1. Format de Publication
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormat('square')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        format === 'square'
                          ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Square className="w-4 h-4" />
                      <span>Post Carré (1:1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormat('story')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        format === 'story'
                          ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Story (9:16)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Theme Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                    2. Thème Visuel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('cyber')}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                        theme === 'cyber'
                          ? 'bg-neutral-900 border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                          : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#39FF14]" />
                      <span>Cyber Stealth</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('indigo')}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                        theme === 'indigo'
                          ? 'bg-neutral-900 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#00F0FF]" />
                      <span>Midnight Cyan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('gold')}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                        theme === 'gold'
                          ? 'bg-neutral-900 border-[#FFD700] text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                          : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#FFD700]" />
                      <span>Gold Titan</span>
                    </button>
                  </div>
                </div>

                {/* 3. Custom Metadata */}
                <div className="space-y-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Pseudo / Handle du Trader
                    </label>
                    <input
                      type="text"
                      value={traderName}
                      onChange={(e) => setTraderName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Setup / Stratégie affichée
                    </label>
                    <input
                      type="text"
                      value={customSetup}
                      onChange={(e) => setCustomSetup(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>
                </div>

                {/* 4. Display Toggles */}
                <div className="space-y-2 p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {maskDollars ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-neutral-400" />}
                      <span className="text-xs text-white">Masquer les Dollars ($)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={maskDollars}
                      onChange={(e) => setMaskDollars(e.target.checked)}
                      className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                    />
                  </div>

                  {trade.screenshot_url && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span className="text-xs text-white">Inclure la Capture du Chart</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeScreenshot}
                        onChange={(e) => setIncludeScreenshot(e.target.checked)}
                        className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-white">Badge Rigueur & Psychologie</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includePsychology}
                      onChange={(e) => setIncludePsychology(e.target.checked)}
                      className="w-4 h-4 accent-[#39FF14] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/70 border border-white/5 overflow-hidden">
                <div className="text-[11px] font-mono text-neutral-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                  <span>Aperçu HD Haute Résolution</span>
                </div>

                {/* The Visual Card to Capture */}
                <div
                  ref={cardRef}
                  style={{
                    backgroundImage: curTheme.radialGradient,
                  }}
                  className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border ${
                    curTheme.borderColor
                  } ${curTheme.glowColor} bg-gradient-to-br ${
                    curTheme.cardBg
                  } text-white transition-all duration-300 ${
                    format === 'square'
                      ? 'w-[360px] sm:w-[420px] aspect-square p-5 sm:p-6'
                      : 'w-[300px] sm:w-[340px] aspect-[9/16] p-5 sm:p-6'
                  }`}
                >
                  {/* Top Bar: Brand & Trade Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-black text-xs"
                        style={{ backgroundColor: curTheme.accentColor }}
                      >
                        💎
                      </div>
                      <div>
                        <div className="text-[11px] font-black tracking-wider text-white">
                          OPAL OS
                        </div>
                        <div className="text-[8px] font-mono text-neutral-400 uppercase">
                          PROOF OF TRADE
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${curTheme.badgeBg}`}
                      >
                        {trade.instrument}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {dateFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Main Metric Hero Section */}
                  <div className="my-auto py-3 space-y-2 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            trade.direction === 'Long'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {trade.direction === 'Long' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {trade.direction.toUpperCase()}
                        </span>

                        <span className="text-[10px] font-semibold text-neutral-300 truncate max-w-[170px]">
                          {customSetup}
                        </span>
                      </div>

                      {includePsychology && trade.plan_followed && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Plan 100%
                        </span>
                      )}
                    </div>

                    {/* Massive PnL Display */}
                    <div className="space-y-0.5">
                      <div
                        className="text-4xl sm:text-5xl font-black font-mono tracking-tight"
                        style={{
                          color: pnlR >= 0 ? curTheme.accentColor : '#FF3B30',
                          textShadow: pnlR >= 0 ? `0 0 30px ${curTheme.accentColor}40` : 'none',
                        }}
                      >
                        {pnlR > 0 ? `+${pnlR.toFixed(2)}` : pnlR.toFixed(2)}{' '}
                        <span className="text-2xl sm:text-3xl">R</span>
                      </div>

                      {!maskDollars && (
                        <div className="text-xs font-mono text-neutral-400">
                          {pnlDollars >= 0 ? `+$${pnlDollars.toFixed(0)}` : `-$${Math.abs(pnlDollars).toFixed(0)}`}{' '}
                          <span className="text-neutral-500 text-[10px]">
                            (Risque: ${Number(trade.risk_dollars || 0).toFixed(0)})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Optional Screenshot in Card */}
                    {includeScreenshot && trade.screenshot_url && (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 mt-2 max-h-[110px] sm:max-h-[140px] flex items-center justify-center">
                        <img
                          src={trade.screenshot_url}
                          alt="Chart execution"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* Key Levels mini bar */}
                    {(trade.entry_price || trade.take_profit) && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                        <div className="text-neutral-400">
                          Entrée : <span className="text-white font-bold">{trade.entry_price || '—'}</span>
                        </div>
                        <div className="text-neutral-400 text-right">
                          TP : <span className="text-white font-bold">{trade.take_profit || '—'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Trader Handle + Certification Seal */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 z-10 text-[9px]">
                    <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: curTheme.accentColor }}
                      />
                      <span>{traderName || 'OPAL TRADER'}</span>
                    </div>

                    <div className="text-neutral-500 font-mono text-[8px] uppercase tracking-wider">
                      OPAL-OS.APP
                    </div>
                  </div>

                  {/* Aesthetic Background Watermark / Grid */}
                  <div
                    className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl"
                    style={{ backgroundColor: curTheme.accentColor }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#10121A]">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Share2 className="w-4 h-4 text-[#39FF14]" />
                <span>Rendu 100% Haute Définition PNG • Sans compression</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  disabled={isExporting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:border-white/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#39FF14]" />
                      <span className="text-[#39FF14]">Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span>Copier l’Image (Discord)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black text-xs font-bold transition-all shadow-lg shadow-[#39FF14]/20 hover:scale-[1.02]"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Rendu en cours...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Trading Card Téléchargée !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Télécharger l’Image PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
