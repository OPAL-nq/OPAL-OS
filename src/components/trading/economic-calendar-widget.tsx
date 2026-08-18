'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EconomicCalendarWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isExpanded || !containerRef.current) return;

    // Clear previous injection safely
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '420',
      locale: 'fr',
      importanceFilter: '0,1',
      currencyFilter: 'USD,EUR,GBP',
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isMounted, isExpanded]);

  return (
    <Card className="bg-[#141414] border-white/10 overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-white">
                Calendrier Économique US & Macro (Direct)
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-bold uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Annonces économiques majeures à surveiller avant votre session (CPI, NFP, FOMC)
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-neutral-400 hover:text-white">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 bg-[#0A0A0A] relative min-h-[420px]">
          <div
            className="tradingview-widget-container"
            ref={containerRef}
            suppressHydrationWarning
            style={{ height: '420px', width: '100%' }}
          />
        </CardContent>
      )}
    </Card>
  );
}
