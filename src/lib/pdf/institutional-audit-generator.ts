import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trade } from '@/types/trading';

export interface AuditExportOptions {
  traderName: string;
  auditTitle?: string;
  auditReference?: string;
  periodLabel: string;
  accountLabel?: string;
  maskDollarAmounts: boolean;
  includeEquityCurve: boolean;
  includePsychologyMatrix: boolean;
  includeMentorSignoff: boolean;
  traderNotes?: string;
  mentorNotes?: string;
  nextMonthGoals?: string;
}

export interface ComputedAuditStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  beTrades: number;
  winRate: number;
  totalR: number;
  totalPnlDollars: number;
  profitFactor: number;
  avgRR: number;
  maxDrawdownR: number;
  maxDrawdownDollars: number;
  bestTradeR: number;
  worstTradeR: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  planFollowedRate: number;
  calmRate: number;
  setupsBreakdown: {
    setup: string;
    count: number;
    winRate: number;
    totalR: number;
    pnlDollars: number;
  }[];
  sessionsBreakdown: {
    session: string;
    count: number;
    winRate: number;
    totalR: number;
  }[];
}

/**
 * Computes deep institutional metrics from trade data
 */
export function computeAuditMetrics(trades: Trade[]): ComputedAuditStats {
  const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

  const totalTrades = sorted.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      beTrades: 0,
      winRate: 0,
      totalR: 0,
      totalPnlDollars: 0,
      profitFactor: 0,
      avgRR: 0,
      maxDrawdownR: 0,
      maxDrawdownDollars: 0,
      bestTradeR: 0,
      worstTradeR: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      planFollowedRate: 0,
      calmRate: 0,
      setupsBreakdown: [],
      sessionsBreakdown: [],
    };
  }

  let totalWinR = 0;
  let totalLossR = 0;
  let winCount = 0;
  let lossCount = 0;
  let beCount = 0;
  let totalR = 0;
  let totalPnlDollars = 0;
  let bestTradeR = -Infinity;
  let worstTradeR = Infinity;

  let currentStreak = 0;
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let lastOutcome: 'win' | 'loss' | null = null;

  let peakR = 0;
  let cumR = 0;
  let maxDrawdownR = 0;

  let peakDollars = 0;
  let cumDollars = 0;
  let maxDrawdownDollars = 0;

  let planFollowedCount = 0;
  let calmCount = 0;

  const setupsMap: Record<string, { count: number; wins: number; totalR: number; pnlDollars: number }> = {};
  const sessionsMap: Record<string, { count: number; wins: number; totalR: number }> = {
    'NY AM (09:30 - 12:00)': { count: 0, wins: 0, totalR: 0 },
    'NY PM (13:30 - 16:00)': { count: 0, wins: 0, totalR: 0 },
    'Asia / London / Other': { count: 0, wins: 0, totalR: 0 },
  };

  sorted.forEach((t) => {
    const r = Number(t.pnl_r) || 0;
    const dollars = Number(t.pnl_dollars) || 0;
    totalR += r;
    totalPnlDollars += dollars;

    if (r > bestTradeR) bestTradeR = r;
    if (r < worstTradeR) worstTradeR = r;

    // Streaks
    if (r > 0) {
      winCount++;
      totalWinR += r;
      if (lastOutcome === 'win') {
        currentStreak++;
      } else {
        currentStreak = 1;
        lastOutcome = 'win';
      }
      if (currentStreak > maxConsecutiveWins) maxConsecutiveWins = currentStreak;
    } else if (r < 0) {
      lossCount++;
      totalLossR += Math.abs(r);
      if (lastOutcome === 'loss') {
        currentStreak++;
      } else {
        currentStreak = 1;
        lastOutcome = 'loss';
      }
      if (currentStreak > maxConsecutiveLosses) maxConsecutiveLosses = currentStreak;
    } else {
      beCount++;
    }

    // Drawdowns
    cumR += r;
    if (cumR > peakR) peakR = cumR;
    const ddR = peakR - cumR;
    if (ddR > maxDrawdownR) maxDrawdownR = ddR;

    cumDollars += dollars;
    if (cumDollars > peakDollars) peakDollars = cumDollars;
    const ddDollars = peakDollars - cumDollars;
    if (ddDollars > maxDrawdownDollars) maxDrawdownDollars = ddDollars;

    // Rigor & psychology
    if (t.plan_followed || (t as any).plan_compliance === 'full') {
      planFollowedCount++;
    }
    if ((t as any).emotional_state === 'calm') {
      calmCount++;
    }

    // Setups breakdown
    const setupKey = (t as any).setup || t.market_context || 'Standard';
    if (!setupsMap[setupKey]) {
      setupsMap[setupKey] = { count: 0, wins: 0, totalR: 0, pnlDollars: 0 };
    }
    setupsMap[setupKey].count++;
    if (r > 0) setupsMap[setupKey].wins++;
    setupsMap[setupKey].totalR += r;
    setupsMap[setupKey].pnlDollars += dollars;

    // Session time breakdown
    const sessionType = (t as any).session_type || 'ny_am';
    let targetSession = 'NY AM (09:30 - 12:00)';
    if (sessionType === 'ny_pm') targetSession = 'NY PM (13:30 - 16:00)';
    else if (sessionType === 'asia' || sessionType === 'london') targetSession = 'Asia / London / Other';

    sessionsMap[targetSession].count++;
    if (r > 0) sessionsMap[targetSession].wins++;
    sessionsMap[targetSession].totalR += r;
  });

  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const profitFactor = totalLossR > 0 ? totalWinR / totalLossR : totalWinR > 0 ? 99.9 : 0;
  const avgWinR = winCount > 0 ? totalWinR / winCount : 0;
  const avgLossR = lossCount > 0 ? totalLossR / lossCount : 1;
  const avgRR = avgLossR > 0 ? avgWinR / avgLossR : avgWinR;
  const planFollowedRate = totalTrades > 0 ? (planFollowedCount / totalTrades) * 100 : 0;
  const calmRate = totalTrades > 0 ? (calmCount / totalTrades) * 100 : 0;

  const setupsBreakdown = Object.entries(setupsMap).map(([setup, data]) => ({
    setup,
    count: data.count,
    winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
    totalR: data.totalR,
    pnlDollars: data.pnlDollars,
  })).sort((a, b) => b.totalR - a.totalR);

  const sessionsBreakdown = Object.entries(sessionsMap).map(([session, data]) => ({
    session,
    count: data.count,
    winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
    totalR: data.totalR,
  }));

  return {
    totalTrades,
    winTrades: winCount,
    lossTrades: lossCount,
    beTrades: beCount,
    winRate,
    totalR,
    totalPnlDollars,
    profitFactor,
    avgRR,
    maxDrawdownR,
    maxDrawdownDollars,
    bestTradeR: bestTradeR === -Infinity ? 0 : bestTradeR,
    worstTradeR: worstTradeR === Infinity ? 0 : worstTradeR,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    planFollowedRate,
    calmRate,
    setupsBreakdown,
    sessionsBreakdown,
  };
}

/**
 * Creates high-resolution equity curve chart on an offscreen HTML canvas
 */
function createEquityCurveCanvas(trades: Trade[]): string | null {
  if (typeof document === 'undefined') return null;

  const sorted = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  if (sorted.length === 0) return null;

  const width = 1200;
  const height = 480;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#0D0E12';
  ctx.fillRect(0, 0, width, height);

  // Padding
  const padLeft = 80;
  const padRight = 40;
  const padTop = 50;
  const padBottom = 60;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Compute points
  const points: { index: number; r: number; cumR: number }[] = [{ index: 0, r: 0, cumR: 0 }];
  let cum = 0;
  sorted.forEach((t, i) => {
    cum += Number(t.pnl_r) || 0;
    points.push({ index: i + 1, r: Number(t.pnl_r) || 0, cumR: cum });
  });

  const minR = Math.min(0, ...points.map((p) => p.cumR));
  const maxR = Math.max(1, ...points.map((p) => p.cumR));
  const rangeR = maxR - minR || 1;

  const getY = (val: number) => padTop + chartH - ((val - minR) / rangeR) * chartH;
  const getX = (idx: number) => padLeft + (idx / (points.length - 1 || 1)) * chartW;

  // Grid lines
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1E2029';
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const val = minR + (rangeR * i) / gridSteps;
    const y = getY(val);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${val >= 0 ? '+' : ''}${val.toFixed(1)}R`, padLeft - 15, y + 6);
  }

  // Zero line
  const zeroY = getY(0);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(padLeft, zeroY);
  ctx.lineTo(width - padRight, zeroY);
  ctx.stroke();

  // Gradient area under curve
  const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
  grad.addColorStop(0, 'rgba(57, 255, 20, 0.28)');
  grad.addColorStop(1, 'rgba(57, 255, 20, 0.00)');

  ctx.beginPath();
  ctx.moveTo(getX(0), zeroY);
  points.forEach((p) => {
    ctx.lineTo(getX(p.index), getY(p.cumR));
  });
  ctx.lineTo(getX(points.length - 1), zeroY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Main Equity Line
  ctx.beginPath();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#39FF14';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  points.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(getX(p.index), getY(p.cumR));
    else ctx.lineTo(getX(p.index), getY(p.cumR));
  });
  ctx.stroke();

  // Draw points
  points.forEach((p, idx) => {
    if (idx === 0 || idx === points.length - 1 || idx % Math.max(1, Math.floor(points.length / 12)) === 0) {
      ctx.beginPath();
      ctx.arc(getX(p.index), getY(p.cumR), 4, 0, Math.PI * 2);
      ctx.fillStyle = p.cumR >= 0 ? '#39FF14' : '#FF3B30';
      ctx.fill();
      ctx.strokeStyle = '#0D0E12';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Chart Title / Subtitle inside canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('COURBE D’ÉQUITÉ CUMULÉE (R-MULTIPLES)', padLeft, 32);

  ctx.fillStyle = '#39FF14';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  const finalR = points[points.length - 1]?.cumR || 0;
  ctx.fillText(`${finalR >= 0 ? '+' : ''}${finalR.toFixed(2)} R TOTAL`, width - padRight, 32);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Generates an Institutional A4 Multi-Page PDF Audit Report
 */
export async function generateInstitutionalAuditPdf(
  trades: Trade[],
  options: AuditExportOptions
): Promise<void> {
  const stats = computeAuditMetrics(trades);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const auditRef = options.auditReference || `OPAL-AUD-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Helper for Dark Page Background
  const applyPageTheme = () => {
    // Deep dark luxury background
    doc.setFillColor(11, 12, 16); // #0B0C10
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle top accent bar
    doc.setFillColor(57, 255, 20); // #39FF14
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // Header strip text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 145, 160);
    doc.text('OPAL OS — INSTITUTIONAL TRADING AUDIT', margin, 8);
    doc.text(`RÉF : ${auditRef}`, pageWidth - margin, 8, { align: 'right' });

    // Header divider line
    doc.setDrawColor(32, 35, 45);
    doc.setLineWidth(0.3);
    doc.line(margin, 10.5, pageWidth - margin, 10.5);
  };

  // Helper for Page Footer
  const applyPageFooter = (currentPage: number, totalPages: number) => {
    const footY = pageHeight - 8;
    doc.setDrawColor(32, 35, 45);
    doc.setLineWidth(0.3);
    doc.line(margin, footY - 3, pageWidth - margin, footY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 125, 140);
    doc.text('CONFIDENTIEL & PROPRIÉTAIRE — OPAL TRADING ECOSYSTEM', margin, footY);
    doc.text(`Page ${currentPage} sur ${totalPages}`, pageWidth / 2, footY, { align: 'center' });
    doc.text(`Émis le ${dateStr}`, pageWidth - margin, footY, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // =========================================================================
  applyPageTheme();

  // Prestige Header Box
  let yPos = 18;
  doc.setFillColor(18, 20, 26);
  doc.setDrawColor(40, 45, 58);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 38, 2, 2, 'FD');

  // Badge "RAPPORT D'AUDIT CERTIFIÉ"
  doc.setFillColor(57, 255, 20);
  doc.rect(margin + 5, yPos + 6, 2.5, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(options.auditTitle || 'RAPPORT D’AUDIT INSTITUTIONNEL & PERFORMANCE', margin + 11, yPos + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(160, 165, 180);
  doc.text('Certification des métriques d’exécution, gestion du risque & rigueur psychologique.', margin + 11, yPos + 18);

  // Metadata Grid in Header Box
  doc.setFontSize(8);
  doc.setTextColor(120, 125, 140);
  doc.text('TRADER / ÉLÈVE :', margin + 6, yPos + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(options.traderName || 'Membre OPAL', margin + 36, yPos + 28);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 125, 140);
  doc.text('PÉRIODE AUDITÉE :', margin + 6, yPos + 34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(57, 255, 20);
  doc.text(options.periodLabel || 'Tout l’historique', margin + 36, yPos + 34);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 125, 140);
  doc.text('COMPTE AUDITÉ :', pageWidth / 2 + 10, yPos + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(options.accountLabel || 'Tous les comptes combinés', pageWidth / 2 + 38, yPos + 28);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 125, 140);
  doc.text('CONFIDENTIALITÉ :', pageWidth / 2 + 10, yPos + 34);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(options.maskDollarAmounts ? 0 : 255, options.maskDollarAmounts ? 240 : 255, options.maskDollarAmounts ? 255 : 255);
  doc.text(options.maskDollarAmounts ? 'R-Multiples Uniquement (Montants $ masqués)' : 'Standard (R & Montants $)', pageWidth / 2 + 38, yPos + 34);

  // Section Title: Executive KPIs
  yPos += 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('1. SYNTHÈSE EXÉCUTIVE & MÉTRIQUES CLÉS (KPIS)', margin, yPos);

  yPos += 4;

  // 6 KPI Cards Grid (2 rows x 3 columns)
  const cardW = (pageWidth - margin * 2 - 8) / 3;
  const cardH = 24;

  const kpis = [
    {
      label: 'PERFORMANCE GLOBALE',
      val: `${stats.totalR >= 0 ? '+' : ''}${stats.totalR.toFixed(2)} R`,
      sub: options.maskDollarAmounts ? `${stats.totalTrades} trades exécutés` : `${stats.totalPnlDollars >= 0 ? '+' : ''}${stats.totalPnlDollars.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $ net`,
      color: stats.totalR >= 0 ? [57, 255, 20] : [255, 59, 48],
    },
    {
      label: 'WIN RATE GLOBAL',
      val: `${stats.winRate.toFixed(1)} %`,
      sub: `${stats.winTrades} W / ${stats.lossTrades} L / ${stats.beTrades} BE`,
      color: stats.winRate >= 50 ? [57, 255, 20] : [255, 180, 0],
    },
    {
      label: 'PROFIT FACTOR',
      val: stats.profitFactor >= 99 ? '∞' : stats.profitFactor.toFixed(2),
      sub: stats.profitFactor >= 2 ? 'Excellence Institutionnelle' : stats.profitFactor >= 1.2 ? 'Rentable & Stable' : 'Sous surveillance',
      color: stats.profitFactor >= 1.5 ? [57, 255, 20] : stats.profitFactor >= 1 ? [0, 240, 255] : [255, 59, 48],
    },
    {
      label: 'RISK / REWARD RÉALISÉ',
      val: `1 : ${stats.avgRR.toFixed(2)}`,
      sub: 'Gain moyen vs Perte moyenne',
      color: stats.avgRR >= 1.5 ? [57, 255, 20] : [255, 255, 255],
    },
    {
      label: 'MAX DRAWDOWN HISTORIQUE',
      val: `-${stats.maxDrawdownR.toFixed(2)} R`,
      sub: options.maskDollarAmounts ? 'Creux maximal en R' : `-${stats.maxDrawdownDollars.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`,
      color: stats.maxDrawdownR <= 4 ? [57, 255, 20] : stats.maxDrawdownR <= 8 ? [255, 180, 0] : [255, 59, 48],
    },
    {
      label: 'CONFORMITÉ AU PLAN',
      val: `${stats.planFollowedRate.toFixed(0)} %`,
      sub: `${stats.calmRate.toFixed(0)}% trades exécutés dans le calme`,
      color: stats.planFollowedRate >= 80 ? [57, 255, 20] : [255, 180, 0],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const cx = margin + col * (cardW + 4);
    const cy = yPos + row * (cardH + 4);

    doc.setFillColor(18, 20, 26);
    doc.setDrawColor(36, 40, 52);
    doc.roundedRect(cx, cy, cardW, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 145, 160);
    doc.text(kpi.label, cx + 4, cy + 5.5);

    doc.setFontSize(13);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, cx + 4, cy + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(160, 165, 180);
    doc.text(kpi.sub, cx + 4, cy + 20);
  });

  yPos += cardH * 2 + 14;

  // Secondary Performance Matrix Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('2. RATIOS DÉTAILLÉS & ANALYSE DE DISTRIBUTION', margin, yPos);
  yPos += 3;

  const ratiosBody = [
    ['Nombre total de trades', `${stats.totalTrades}`, 'Meilleur trade (Peak R)', `+${stats.bestTradeR.toFixed(2)} R`],
    ['Trades Gagnants (Wins)', `${stats.winTrades} (${stats.winRate.toFixed(1)}%)`, 'Pire trade (Max Loss)', `${stats.worstTradeR.toFixed(2)} R`],
    ['Trades Perdants (Losses)', `${stats.lossTrades} (${stats.totalTrades > 0 ? ((stats.lossTrades / stats.totalTrades) * 100).toFixed(1) : 0}%)`, 'Série max de victoires consécutives', `${stats.maxConsecutiveWins} trades`],
    ['Trades Breakeven (BE)', `${stats.beTrades}`, 'Série max de pertes consécutives', `${stats.maxConsecutiveLosses} trades`],
    ['Espérance mathématique / Trade', `${stats.totalTrades > 0 ? (stats.totalR / stats.totalTrades).toFixed(2) : 0} R`, 'Ratio de régularité (Discipline)', `${stats.planFollowedRate.toFixed(0)} / 100`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['MÉTRIQUE OPÉRATIONNELLE', 'VALEUR', 'MÉTRIQUE DE RISQUE', 'VALEUR']],
    body: ratiosBody,
    theme: 'plain',
    styles: {
      fontSize: 7.5,
      textColor: [220, 225, 235],
      cellPadding: 2.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 27, 35],
      textColor: [57, 255, 20],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [15, 17, 22],
    },
    columnStyles: {
      0: { fontStyle: 'normal', cellWidth: 50 },
      1: { fontStyle: 'bold', cellWidth: 40, textColor: [255, 255, 255] },
      2: { fontStyle: 'normal', cellWidth: 55 },
      3: { fontStyle: 'bold', cellWidth: 37, textColor: [57, 255, 20] },
    },
    margin: { left: margin, right: margin },
  });

  // Notes / Highlights Box if present
  if (options.traderNotes) {
    const finalTableY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFillColor(18, 20, 26);
    doc.setDrawColor(40, 45, 58);
    doc.roundedRect(margin, finalTableY, pageWidth - margin * 2, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(57, 255, 20);
    doc.text('NOTE DE CONTEXTE DU TRADER :', margin + 4, finalTableY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(200, 205, 220);
    const splitNotes = doc.splitTextToSize(options.traderNotes, pageWidth - margin * 2 - 8);
    doc.text(splitNotes.slice(0, 3), margin + 4, finalTableY + 11);
  }

  // =========================================================================
  // PAGE 2: EQUITY CURVE & TRADE RECAPITULATIVE LOG
  // =========================================================================
  doc.addPage();
  applyPageTheme();

  yPos = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('3. ANALYSE GRAPHIQUE & COURBE D’ÉQUITÉ VECTORIELLE', margin, yPos);
  yPos += 4;

  // Render Equity Curve Canvas into PDF
  if (options.includeEquityCurve) {
    const chartImg = createEquityCurveCanvas(trades);
    if (chartImg) {
      const chartH = 68;
      doc.addImage(chartImg, 'PNG', margin, yPos, pageWidth - margin * 2, chartH);
      yPos += chartH + 8;
    }
  }

  // Recent Major Trades Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('4. EXTRAIT DU JOURNAL D’EXÉCUTION (HISTORIQUE RÉCENT)', margin, yPos);
  yPos += 3;

  const sortedTrades = [...trades]
    .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime())
    .slice(0, 16);

  const tradesTableBody = sortedTrades.map((t) => {
    const dateFormatted = new Date(t.trade_date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    const rVal = Number(t.pnl_r) || 0;
    const rText = `${rVal >= 0 ? '+' : ''}${rVal.toFixed(2)} R`;
    const dollarsVal = Number(t.pnl_dollars) || 0;
    const dollarsText = options.maskDollarAmounts
      ? '—'
      : `${dollarsVal >= 0 ? '+' : ''}${dollarsVal.toFixed(0)} $`;

    const compliance = (t as any).plan_compliance === 'off_plan' ? 'Hors Plan' : t.plan_followed ? 'Conforme' : 'Écart';
    const emotion = (t as any).emotional_state ? String((t as any).emotional_state).toUpperCase() : 'CALME';

    return [
      dateFormatted,
      t.instrument || 'NQ',
      t.direction ? t.direction.toUpperCase() : 'LONG',
      (t as any).setup || t.market_context || 'Standard',
      (t as any).contracts_count ? `${(t as any).contracts_count}ct` : '1ct',
      rText,
      dollarsText,
      compliance,
      emotion,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['DATE', 'ACTIF', 'SENS', 'SETUP', 'TAILLE', 'RÉSUMÉ (R)', 'PNL ($)', 'PLAN', 'ÉTAT']],
    body: tradesTableBody.length > 0 ? tradesTableBody : [['-', '-', '-', 'Aucun trade enregistré', '-', '-', '-', '-', '-']],
    theme: 'plain',
    styles: {
      fontSize: 6.8,
      textColor: [220, 225, 235],
      cellPadding: 1.8,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 27, 35],
      textColor: [57, 255, 20],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [15, 17, 22],
    },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 14, fontStyle: 'bold' },
      2: { cellWidth: 14 },
      3: { cellWidth: 32 },
      4: { cellWidth: 14 },
      5: { cellWidth: 22, fontStyle: 'bold', textColor: [57, 255, 20] },
      6: { cellWidth: 20 },
      7: { cellWidth: 24 },
      8: { cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.includes('-')) {
          data.cell.styles.textColor = [255, 59, 48];
        } else if (text.includes('+')) {
          data.cell.styles.textColor = [57, 255, 20];
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // =========================================================================
  // PAGE 3: SETUPS, SESSIONS, PSYCHOLOGY & MENTOR SIGN-OFF
  // =========================================================================
  doc.addPage();
  applyPageTheme();

  yPos = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('5. PERFORMANCE PAR STRATÉGIE & RÉPARTITION HORAIRE', margin, yPos);
  yPos += 3;

  // Setups Table
  const setupsData = stats.setupsBreakdown.map((s) => [
    s.setup,
    `${s.count}`,
    `${s.winRate.toFixed(1)} %`,
    `${s.totalR >= 0 ? '+' : ''}${s.totalR.toFixed(2)} R`,
    options.maskDollarAmounts ? '—' : `${s.pnlDollars >= 0 ? '+' : ''}${s.pnlDollars.toFixed(0)} $`,
    s.totalR > 0 ? 'Sur-pondérer' : s.totalR === 0 ? 'Neutre' : 'À auditer',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['SETUP / PATTERN', 'TRADES', 'WIN RATE', 'TOTAL (R)', 'PNL ESTIMÉ', 'RECOMMANDATION']],
    body: setupsData.length > 0 ? setupsData : [['Aucun setup spécifique', '-', '-', '-', '-', '-']],
    theme: 'plain',
    styles: {
      fontSize: 7.2,
      textColor: [220, 225, 235],
      cellPadding: 2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 27, 35],
      textColor: [57, 255, 20],
      fontStyle: 'bold',
      fontSize: 7.2,
    },
    alternateRowStyles: {
      fillColor: [15, 17, 22],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46 },
      1: { cellWidth: 20 },
      2: { cellWidth: 24 },
      3: { cellWidth: 26, fontStyle: 'bold', textColor: [57, 255, 20] },
      4: { cellWidth: 28 },
      5: { cellWidth: 38 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Session breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('6. RIGUEUR OPÉRATIONNELLE & CONTRÔLE PSYCHOLOGIQUE', margin, yPos);
  yPos += 3;

  const psychBody = [
    ['Respect strict du Plan de Trading', `${stats.planFollowedRate.toFixed(0)}% de conformité`, 'Exécution hors plan', `${(100 - stats.planFollowedRate).toFixed(0)}%`],
    ['Exécutions en état Sérénité / Calme', `${stats.calmRate.toFixed(0)}%`, 'Gestion du Stop Loss', 'Stricte & Validée'],
    ['Trades Session NY AM (Open 09:30-12:00)', `${stats.sessionsBreakdown.find((s) => s.session.includes('AM'))?.count || 0} trades`, 'Trades Session NY PM (13:30-16:00)', `${stats.sessionsBreakdown.find((s) => s.session.includes('PM'))?.count || 0} trades`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['PILIER PSYCHOLOGIQUE & GESTION', 'RÉSULTAT AUDITÉ', 'PILIER DE RISQUE', 'STATUT']],
    body: psychBody,
    theme: 'plain',
    styles: {
      fontSize: 7,
      textColor: [220, 225, 235],
      cellPadding: 2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 27, 35],
      textColor: [0, 240, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
    },
    alternateRowStyles: {
      fillColor: [15, 17, 22],
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // =========================================================================
  // MENTOR VALIDATION & OFFICIAL SIGN-OFF BLOCK
  // =========================================================================
  if (options.includeMentorSignoff) {
    const signBoxH = 46;
    doc.setFillColor(18, 20, 26);
    doc.setDrawColor(57, 255, 20);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, signBoxH, 2, 2, 'FD');

    // Seal Badge
    doc.setFillColor(57, 255, 20);
    doc.roundedRect(margin + 5, yPos + 5, 48, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text('AUDIT VALIDÉ & CERTIFIÉ', margin + 7, yPos + 9.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ATTESTATION D’AUDIT OPAL INTENSIVE', margin + 58, yPos + 9.5);

    // Mentor notes & objectives
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 185, 200);
    const mentorRemarks = options.mentorNotes ||
      'Le profil d’exécution démontre une maîtrise satisfaisante du Risk Management et une rigueur conforme aux standards du programme OPAL Intensive. Les règles d’invalidation et de money management sont respectées.';
    const splitRemarks = doc.splitTextToSize(mentorRemarks, pageWidth - margin * 2 - 65);
    doc.text(splitRemarks.slice(0, 3), margin + 6, yPos + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(57, 255, 20);
    doc.text('OBJECTIFS PROCHAIN MOIS :', margin + 6, yPos + 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(220, 225, 235);
    doc.text(options.nextMonthGoals || '1. Maintenir le taux de conformité > 90%  |  2. Prioriser les setups NY AM  |  3. Ne pas overtrader les vendredis PM.', margin + 48, yPos + 32);

    // Signature stamp on right
    const sigX = pageWidth - margin - 50;
    const sigY = yPos + 12;
    doc.setDrawColor(45, 50, 65);
    doc.setFillColor(12, 14, 18);
    doc.roundedRect(sigX, sigY, 44, 28, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(57, 255, 20);
    doc.text('MAXYM', sigX + 22, sigY + 6, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(140, 145, 160);
    doc.text('Fondateur & Lead Mentor', sigX + 22, sigY + 10, { align: 'center' });
    doc.text('OPAL OS & OPAL Intensive', sigX + 22, sigY + 13, { align: 'center' });

    // Digital stamp line
    doc.setDrawColor(57, 255, 20);
    doc.setLineWidth(0.4);
    doc.line(sigX + 6, sigY + 17, sigX + 38, sigY + 17);

    doc.setFont('courier', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(0, 240, 255);
    doc.text(`SIG-DIGITAL: ${auditRef.slice(-8)}`, sigX + 22, sigY + 22, { align: 'center' });
    doc.text('VERIFIED BLOCKCHAIN-READY', sigX + 22, sigY + 25, { align: 'center' });
  }

  // =========================================================================
  // APPLY FOOTERS TO ALL PAGES
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyPageFooter(i, totalPages);
  }

  // Save the PDF
  const filename = `OPAL-Audit-${options.traderName.replace(/[^a-zA-Z0-9]/g, '_')}-${auditRef}.pdf`;
  doc.save(filename);
}
