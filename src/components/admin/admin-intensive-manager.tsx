'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  Calendar,
  Clock,
  Target,
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminCoachingForm } from './admin-coaching-form';
import type { IntensiveClientSummary } from '@/types';

interface AdminIntensiveManagerProps {
  clients: IntensiveClientSummary[];
}

export function AdminIntensiveManager({ clients }: AdminIntensiveManagerProps) {
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase();
    const name = (c.profile.full_name || '').toLowerCase();
    const email = (c.profile.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const totalClients = clients.length;
  const clientsWithNextSession = clients.filter((c) => c.nextSession !== null).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Gestion de l'Accompagnement Élite</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Cockpit Admin Intensive
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Suivi individuel, planification des coachings et feuilles de route des membres Intensive
          </p>
        </div>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Clients Intensive
              </span>
              <User className="w-4 h-4 text-[#39FF14]" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{totalClients}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Accompagnements actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Coachings Planifiés
              </span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{clientsWithNextSession}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Séances à venir</p>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Fréquence Standard
              </span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">2x / semaine</p>
            <p className="text-xs text-neutral-400 mt-0.5">Sessions individuelles 1-on-1</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Rechercher un élève Intensive par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#141414] border-white/10 text-white placeholder:text-neutral-500 h-11 text-xs"
        />
      </div>

      {/* 4. Client Cards Grid */}
      {filteredClients.length === 0 ? (
        <Card className="bg-[#141414] border-white/5 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Aucun membre Intensive trouvé
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {search
              ? 'Aucun élève ne correspond à votre recherche.'
              : 'Pour assigner un élève à Intensive, modifiez son plan vers "intensive" dans la gestion des élèves.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const name = client.profile.full_name || client.profile.email || 'Élève';
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const nextDate = client.nextSession
              ? new Date(client.nextSession.scheduled_at)
              : null;

            return (
              <Card
                key={client.profile.id}
                className="bg-[#141414] border-white/5 hover:border-[#39FF14]/30 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Client Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-xs font-black text-[#39FF14] shrink-0">
                        {client.profile.avatar_url ? (
                          <img
                            src={client.profile.avatar_url}
                            alt={name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-[#39FF14] transition-colors">
                          {name}
                        </h3>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {client.profile.email}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 shrink-0">
                      Intensive
                    </span>
                  </div>

                  {/* Next Coaching Box */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400">
                      <span>Prochain Coaching</span>
                      <Calendar className="w-3 h-3 text-[#39FF14]" />
                    </div>

                    {nextDate ? (
                      <div className="text-xs font-semibold text-white">
                        <span className="capitalize">
                          {nextDate.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>{' '}
                        à{' '}
                        <span className="text-[#39FF14]">
                          {nextDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500 italic">
                        Aucun créneau planifié
                      </div>
                    )}
                  </div>

                  {/* Current Objective */}
                  {client.lastFollowUp?.current_objective && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Objectif Prioritaire
                      </span>
                      <p className="text-xs text-neutral-300 line-clamp-2 italic leading-relaxed">
                        « {client.lastFollowUp.current_objective} »
                      </p>
                    </div>
                  )}

                  {/* Quick stats pills */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#39FF14]" />
                      <span>{client.objectivesCount.active} actifs</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span>{client.objectivesCount.completed} terminés</span>
                    </div>
                  </div>
                </CardContent>

                {/* Card Action */}
                <div className="p-3.5 bg-[#111111] border-t border-white/5 flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 text-[11px] font-semibold h-8 px-2.5 shrink-0"
                    title="Consulter le journal de trading et débriefs de l'élève"
                  >
                    <Link href={`/admin/students/${client.profile.id}`}>
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
                      <span>Journal</span>
                    </Link>
                  </Button>

                  <AdminCoachingForm
                    clientId={client.profile.id}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 text-[11px] font-semibold h-8 px-2.5 shrink-0"
                        title="Planifier une nouvelle séance de coaching"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#39FF14]" />
                        <span>+ Séance</span>
                      </Button>
                    }
                  />

                  <Button
                    asChild
                    size="sm"
                    className="bg-white/5 hover:bg-[#39FF14] text-white hover:text-black font-bold text-[11px] h-8 flex-1 transition-colors"
                  >
                    <Link href={`/admin/intensive/${client.profile.id}`}>
                      <span>Cockpit</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
