'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  FileText,
  LineChart,
  User,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminCoachingForm } from './admin-coaching-form';
import { AdminCoachingReportForm } from './admin-coaching-report-form';
import { AdminCoachingPreparationModal } from './admin-coaching-preparation-modal';
import { AdminObjectiveForm } from './admin-objective-form';
import { AdminFollowUpForm } from './admin-follow-up-form';
import {
  deleteCoachingSession,
  completeCoachingSession,
  deleteObjective,
  updateObjectiveStatus,
  deleteCoachingReport,
} from '@/app/actions/intensive';
import type {
  Profile,
  CoachingSession,
  CoachingReport,
  IntensiveObjective,
  IntensiveFollowUp,
} from '@/types';
import { cn } from '@/lib/utils';

interface AdminIntensiveClientProps {
  client: Profile;
  sessions: CoachingSession[];
  reports: CoachingReport[];
  objectives: IntensiveObjective[];
  followUp: IntensiveFollowUp | null;
}

export function AdminIntensiveClient({
  client,
  sessions,
  reports,
  objectives,
  followUp,
}: AdminIntensiveClientProps) {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'coaching' | 'objectives' | 'reports'>('cockpit');

  const clientName = client.full_name || client.email || 'Élève Intensive';
  const initials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const nextSession = sessions.find((s) => s.status === 'scheduled');
  const pastSessions = sessions.filter((s) => s.status !== 'scheduled');

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette séance ?')) {
      await deleteCoachingSession(sessionId);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    await completeCoachingSession(sessionId);
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet objectif ?')) {
      await deleteObjective(objectiveId);
    }
  };

  const handleToggleObjectiveStatus = async (
    objectiveId: string,
    currentStatus: 'active' | 'completed' | 'paused'
  ) => {
    const nextStatus =
      currentStatus === 'active'
        ? 'completed'
        : currentStatus === 'completed'
        ? 'paused'
        : 'active';
    await updateObjectiveStatus(objectiveId, nextStatus);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce compte rendu ?')) {
      await deleteCoachingReport(reportId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/intensive"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la liste des élèves Intensive</span>
        </Link>

        <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-lg font-black text-[#39FF14] shrink-0">
              {client.avatar_url ? (
                <img
                  src={client.avatar_url}
                  alt={clientName}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {clientName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30">
                  Membre Intensive
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">{client.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 text-neutral-200 hover:text-white hover:bg-white/5 text-xs font-semibold h-9"
            >
              <Link href={`/admin/students/${client.id}`}>
                <TrendingUp className="w-4 h-4 mr-1.5 text-[#39FF14]" />
                <span>Journal de Trading</span>
              </Link>
            </Button>
            <AdminCoachingForm clientId={client.id} />
            <AdminFollowUpForm userId={client.id} followUp={followUp} />
            <AdminObjectiveForm userId={client.id} />
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Next session card */}
        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-neutral-400">
                Prochain Coaching
              </span>
              <Calendar className="w-4 h-4 text-[#39FF14]" />
            </div>
            {nextSession ? (
              <div>
                <p className="text-sm font-bold text-white capitalize">
                  {new Date(nextSession.scheduled_at).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-xs text-[#39FF14] font-semibold">
                  {new Date(nextSession.scheduled_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  ({nextSession.duration_minutes} min)
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">Aucun créneau planifié</p>
            )}
          </CardContent>
        </Card>

        {/* Sessions count */}
        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-neutral-400">
                Séances Totales
              </span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">{sessions.length}</p>
            <p className="text-[10px] text-neutral-400">
              {sessions.filter((s) => s.status === 'completed').length} terminées
            </p>
          </CardContent>
        </Card>

        {/* Active objectives */}
        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-neutral-400">
                Objectifs Actifs
              </span>
              <Target className="w-4 h-4 text-[#39FF14]" />
            </div>
            <p className="text-xl font-bold text-[#39FF14]">
              {objectives.filter((o) => o.status === 'active').length}
            </p>
            <p className="text-[10px] text-neutral-400">
              sur {objectives.length} objectifs totaux
            </p>
          </CardContent>
        </Card>

        {/* Reports count */}
        <Card className="bg-[#141414] border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-neutral-400">
                Comptes Rendus
              </span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-white">{reports.length}</p>
            <p className="text-[10px] text-neutral-400">rédigés et partagés</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Cockpit Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Coachings & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A: COACHING SESSIONS */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#39FF14]" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                  Séances de Coaching ({sessions.length})
                </CardTitle>
              </div>
              <AdminCoachingForm clientId={client.id} />
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  Aucune séance planifiée pour le moment.
                </p>
              ) : (
                sessions.map((session) => {
                  const date = new Date(session.scheduled_at);
                  const isCompleted = session.status === 'completed';
                  const isCancelled = session.status === 'cancelled';
                  const existingReport = reports.find((r) => r.session_id === session.id);

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl bg-[#0A0A0A] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold mt-0.5',
                            isCompleted
                              ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                              : isCancelled
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          )}
                        >
                          {isCompleted ? '✓' : isCancelled ? '✕' : '⏳'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white capitalize">
                              {date.toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                            <span className="text-xs text-[#39FF14]">
                              {date.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              ({session.duration_minutes} min)
                            </span>
                          </div>

                          {session.notes && (
                            <p className="text-[11px] text-neutral-400 italic mt-0.5">
                              « {session.notes} »
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {/* Preparation sheet modal */}
                        <AdminCoachingPreparationModal
                          session={session}
                          clientName={clientName}
                        />

                        {/* Report button */}
                        <AdminCoachingReportForm
                          sessionId={session.id}
                          clientId={client.id}
                          reportToEdit={existingReport}
                          trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                'h-7 px-2.5 text-[10px] font-semibold border',
                                existingReport
                                  ? 'border-purple-500/30 text-purple-300 bg-purple-500/10'
                                  : 'border-white/10 text-neutral-300 hover:bg-white/5'
                              )}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              <span>{existingReport ? 'Compte rendu ✓' : '+ Report'}</span>
                            </Button>
                          }
                        />

                        {/* Complete action */}
                        {!isCompleted && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCompleteSession(session.id)}
                            className="h-7 px-2 text-[10px] text-[#39FF14] hover:bg-[#39FF14]/10"
                            title="Marquer comme terminée"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {/* Edit session */}
                        <AdminCoachingForm
                          clientId={client.id}
                          sessionToEdit={session}
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[10px] text-neutral-400 hover:text-white"
                              title="Modifier la séance"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          }
                        />

                        {/* Delete session */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSession(session.id)}
                          className="h-7 px-2 text-[10px] text-neutral-500 hover:text-red-400"
                          title="Supprimer la séance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* SECTION B: OBJECTIVES MANAGER */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#39FF14]" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                  Feuille de Route & Objectifs ({objectives.length})
                </CardTitle>
              </div>
              <AdminObjectiveForm userId={client.id} />
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {objectives.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  Aucun objectif défini. Cliquez sur « Ajouter un Objectif » pour commencer.
                </p>
              ) : (
                objectives.map((obj) => {
                  const isActive = obj.status === 'active';
                  const isCompleted = obj.status === 'completed';

                  return (
                    <div
                      key={obj.id}
                      className={cn(
                        'p-4 rounded-xl bg-[#0A0A0A] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors',
                        isActive ? 'border-[#39FF14]/20' : 'border-white/5'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleObjectiveStatus(obj.id, obj.status)}
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors',
                            isActive
                              ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/30'
                              : isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-white/5 text-neutral-500 border-white/10'
                          )}
                          title="Changer le statut"
                        >
                          {isActive ? (
                            <Target className="w-3.5 h-3.5" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <PauseCircle className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                'text-xs font-bold',
                                isCompleted ? 'text-neutral-400 line-through' : 'text-white'
                              )}
                            >
                              {obj.title}
                            </h4>
                            <span
                              className={cn(
                                'px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider',
                                isActive
                                  ? 'bg-[#39FF14]/10 text-[#39FF14]'
                                  : isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-white/5 text-neutral-400'
                              )}
                            >
                              {isActive ? 'Actif' : isCompleted ? 'Terminé' : 'En pause'}
                            </span>
                          </div>

                          {obj.description && (
                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                              {obj.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <AdminObjectiveForm
                          userId={client.id}
                          objectiveToEdit={obj}
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[10px] text-neutral-400 hover:text-white"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          }
                        />

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteObjective(obj.id)}
                          className="h-7 px-2 text-[10px] text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Synthetic Follow-up & Reports */}
        <div className="space-y-6">
          {/* SECTION C: SYNTHETIC FOLLOW-UP */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[#39FF14]" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                  Suivi Synthétique
                </CardTitle>
              </div>
              <AdminFollowUpForm
                userId={client.id}
                followUp={followUp}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px] border-white/10 text-neutral-300 hover:bg-white/5"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    <span>Éditer</span>
                  </Button>
                }
              />
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {followUp ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#39FF14]">
                      Objectif Actuel
                    </span>
                    <p className="text-xs font-bold text-white bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                      « {followUp.current_objective || 'Non renseigné'} »
                    </p>
                  </div>

                  {followUp.points_worked && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        Points Travaillés
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                        {followUp.points_worked}
                      </p>
                    </div>
                  )}

                  {followUp.errors_to_fix && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        Erreurs à Corriger
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                        {followUp.errors_to_fix}
                      </p>
                    </div>
                  )}

                  {followUp.progression && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                        Progression
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                        {followUp.progression}
                      </p>
                    </div>
                  )}

                  {followUp.next_step && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#39FF14]">
                        Prochaine Étape
                      </span>
                      <p className="text-xs text-white font-medium bg-[#39FF14]/5 p-2.5 rounded-lg border border-[#39FF14]/20 leading-relaxed">
                        → {followUp.next_step}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/5 text-[10px] text-neutral-500">
                    Mis à jour le{' '}
                    {new Date(followUp.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  Aucun suivi synthétique pour le moment. Cliquez sur « Éditer » pour en créer un.
                </p>
              )}
            </CardContent>
          </Card>

          {/* SECTION D: COACHING REPORTS */}
          <Card className="bg-[#141414] border-white/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                  Comptes Rendus ({reports.length})
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              {reports.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  Aucun compte rendu rédigé.
                </p>
              ) : (
                reports.map((rep) => {
                  const date = new Date(rep.created_at);

                  return (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white capitalize">
                          {date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          <AdminCoachingReportForm
                            sessionId={rep.session_id}
                            clientId={client.id}
                            reportToEdit={rep}
                            trigger={
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1.5 text-[10px] text-neutral-400 hover:text-white"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            }
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteReport(rep.id)}
                            className="h-6 px-1.5 text-[10px] text-neutral-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {rep.key_points && (
                        <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                          <strong className="text-white">Points clés :</strong> {rep.key_points}
                        </p>
                      )}

                      {rep.next_steps && (
                        <p className="text-[10px] text-[#39FF14] line-clamp-1">
                          → {rep.next_steps}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
