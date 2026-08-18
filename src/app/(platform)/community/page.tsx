import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  MessageSquare,
  Radio,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-static';

const DISCORD_INVITE_URL = 'https://discord.gg/rz7QrkDpc';

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 pb-16 px-4">
      {/* 1. Hero Section with Glow & Discord Branding */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-black p-8 sm:p-12 text-center shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Official Discord Icon Badge */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-[#39FF14] rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#141414] border border-white/15 flex items-center justify-center shadow-2xl p-4">
              {/* Discord SVG */}
              <svg
                viewBox="0 0 127.14 96.36"
                className="w-12 h-12 sm:w-14 sm:h-14 fill-[#5865F2]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
          </div>

          {/* Badges */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#8ea1e1] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
            Serveur Officiel OPAL • Communauté Active
          </div>

          {/* Title & Subtitle */}
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Le QG de la Communauté <span className="text-[#39FF14]">OPAL</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Toute la communauté se retrouve désormais sur notre serveur Discord officiel. Rejoignez Maxym et l’ensemble des membres pour échanger en direct, suivre les analyses de marché quotidiennes et partager vos setups.
            </p>
          </div>

          {/* Main CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-all hover:scale-105"
              >
                <svg
                  viewBox="0 0 127.14 96.36"
                  className="w-5 h-5 mr-2.5 fill-white shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>Rejoindre le Discord Officiel</span>
                <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
              </Button>
            </a>

            <Link href="/messages">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-neutral-300 hover:text-white font-medium text-xs px-6 py-6 rounded-2xl"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-[#39FF14]" />
                Accéder à mes Messages Privés
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. What's happening inside the Discord */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Au Cœur de la Communauté</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Ce que vous trouverez sur le Discord</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Card 1 */}
          <Card className="bg-[#141414] border-white/10 hover:border-[#5865F2]/40 transition-all p-6 rounded-2xl">
            <CardContent className="p-0 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Annonces & Lives Quotidiens</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Soyez alerté en temps réel du lancement des sessions en direct, des debriefs hebdo et des annonces pédagogiques importantes.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-[#141414] border-white/10 hover:border-[#39FF14]/40 transition-all p-6 rounded-2xl">
            <CardContent className="p-0 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Analyses & Cartographie de Session</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Retrouvez les partages de graphiques, niveaux de Volume Profile (VAH / VAL / POC), Session VWAP et hauts/bas Asian/London.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-[#141414] border-white/10 hover:border-amber-500/40 transition-all p-6 rounded-2xl">
            <CardContent className="p-0 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Setups & Retours d’Expérience</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Échangez sur les exécutions de la stratégie (IFVG, BPR, FVG), le calibrage du risque en ticks et le respect de la discipline.
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="bg-[#141414] border-white/10 hover:border-blue-500/40 transition-all p-6 rounded-2xl">
            <CardContent className="p-0 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Entraide & Esprit d'Équipe</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Une communauté bienveillante de traders passionnés pour progresser ensemble, sans ego et avec une vraie rigueur d’apprentissage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Simple Onboarding Steps */}
      <Card className="bg-[#111111] border-white/10 p-6 sm:p-8 rounded-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#39FF14]" />
            <span>Comment nous rejoindre ?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <div className="text-sm font-bold text-white">Cliquez sur le lien</div>
              <div className="text-xs text-neutral-400">
                Utilisez le bouton ci-dessus pour ouvrir l'invitation officielle du serveur Discord.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div className="text-sm font-bold text-white">Rejoignez le serveur</div>
              <div className="text-xs text-neutral-400">
                Connectez votre compte Discord ou créez-en un gratuitement en 30 secondes.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#39FF14]/20 text-[#39FF14] font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div className="text-sm font-bold text-white">Présentez-vous & participez</div>
              <div className="text-xs text-neutral-400">
                Accédez immédiatement à tous les salons de discussion et aux replays partagés.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Bottom Final Callout */}
      <div className="rounded-2xl border border-[#5865F2]/30 bg-gradient-to-r from-[#5865F2]/10 via-[#141414] to-[#39FF14]/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-white">Prêt à rejoindre les membres OPAL ?</div>
          <div className="text-xs text-neutral-400">
            Lien d'invitation direct : <span className="text-white font-mono">{DISCORD_INVITE_URL}</span>
          </div>
        </div>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs px-6 py-5 rounded-xl shadow-lg">
            Ouvrir Discord
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}
