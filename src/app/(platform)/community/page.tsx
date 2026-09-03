'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ExternalLink,
  MessageSquare,
  Radio,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

const DISCORD_COMMUNITY_URL = 'https://discord.gg/ZahC742M6';

export default function CommunityPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(DISCORD_COMMUNITY_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4 space-y-8">
      {/* Central Glass Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161616] via-[#0f0f0f] to-black p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#5865F2]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Discord Icon */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-[#39FF14] rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-20 h-20 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center shadow-2xl p-4">
              <svg
                viewBox="0 0 127.14 96.36"
                className="w-12 h-12 fill-[#5865F2] drop-shadow-[0_0_12px_rgba(88,101,242,0.6)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
          </div>

          {/* Header Texts */}
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              Communauté Officielle OPAL
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Rejoindre le Discord
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Retrouvez Maxym et tous les membres OPAL pour échanger au quotidien, suivre les analyses de marché et partager vos setups.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="w-full max-w-md pt-2 space-y-3">
            <a
              href={DISCORD_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                size="lg"
                className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm h-13 rounded-2xl shadow-[0_0_30px_rgba(88,101,242,0.35)] transition-all hover:scale-[1.02]"
              >
                <svg
                  viewBox="0 0 127.14 96.36"
                  className="w-5 h-5 mr-2 fill-white shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>Accéder au Serveur Discord</span>
                <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
              </Button>
            </a>

            {/* Quick Copy Link Bar */}
            <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-black/50 border border-white/5 text-xs text-neutral-400 font-mono">
              <span className="truncate max-w-[260px] sm:max-w-none text-neutral-300">
                {DISCORD_COMMUNITY_URL}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="ml-2 text-neutral-400 hover:text-white transition-colors flex items-center gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span className="text-[#39FF14] text-[11px] font-sans">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-sans">Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Minimal Key Channels List */}
          <div className="w-full max-w-md pt-4 border-t border-white/5 space-y-2 text-left">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-300">
              <Radio className="w-4 h-4 text-[#39FF14] shrink-0" />
              <div>
                <span className="font-semibold text-white">Annonces & Lives : </span>
                <span className="text-neutral-400">Notifications de session & debriefs en direct</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-300">
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Analyses Quotidiennes : </span>
                <span className="text-neutral-400">Volume Profile, VWAP & Niveaux clés</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-300">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Entraide & Salons : </span>
                <span className="text-neutral-400">Échanges et partages d’exécution entre membres</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Messages Helper Footer */}
      <div className="text-center">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>Besoin d'un échange individuel ou privé ? Accéder à la Messagerie Interne</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
