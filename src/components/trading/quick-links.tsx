'use client';

import React from 'react';
import { ExternalLink, LineChart, Calendar, TrendingUp } from 'lucide-react';

export function QuickLinks() {
  const links = [
    {
      title: 'TradingView',
      description: 'Graphiques NQ & ES en direct',
      url: 'https://www.tradingview.com/chart/',
      icon: LineChart,
      color: 'text-blue-400 group-hover:text-blue-300',
    },
    {
      title: 'Calendrier Économique',
      description: 'ForexFactory / Annonces US (CPI, NFP, FOMC)',
      url: 'https://www.forexfactory.com/calendar',
      icon: Calendar,
      color: 'text-amber-400 group-hover:text-amber-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3.5 rounded-xl bg-[#141414] border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${link.color}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#39FF14] transition-colors flex items-center gap-1.5">
                  {link.title}
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-[#39FF14]" />
                </div>
                <div className="text-xs text-neutral-400">{link.description}</div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
