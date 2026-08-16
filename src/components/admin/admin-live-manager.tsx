'use client';

import React, { useState } from 'react';
import { LiveSession, LiveReplay, LiveType, LiveStatus } from '@/types/live';
import {
  createLive,
  updateLive,
  deleteLive,
  togglePublishLive,
  createReplay,
  updateReplay,
  deleteReplay,
} from '@/app/actions/live';
import { LiveStatusBadge } from '@/components/live/live-status-badge';
import { formatLiveDate, getLiveTypeLabel } from '@/components/live/live-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Radio,
  PlaySquare,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Video,
  Check,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface AdminLiveManagerProps {
  lives: LiveSession[];
  replays: LiveReplay[];
}

export function AdminLiveManager({ lives, replays }: AdminLiveManagerProps) {
  const [activeTab, setActiveTab] = useState<'lives' | 'replays'>('lives');

  // Live Form State
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [editingLive, setEditingLive] = useState<LiveSession | null>(null);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDesc, setLiveDesc] = useState('');
  const [liveType, setLiveType] = useState<LiveType>('live_trading');
  const [liveScheduledAt, setLiveScheduledAt] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('scheduled');
  const [livePublished, setLivePublished] = useState(true);

  // Replay Form State
  const [showReplayForm, setShowReplayForm] = useState(false);
  const [editingReplay, setEditingReplay] = useState<LiveReplay | null>(null);
  const [replayLiveId, setReplayLiveId] = useState(lives[0]?.id || '');
  const [replayTitle, setReplayTitle] = useState('');
  const [replayVideoUrl, setReplayVideoUrl] = useState('');
  const [replayThumbnailUrl, setReplayThumbnailUrl] = useState('');
  const [replayDuration, setReplayDuration] = useState<number>(3600);
  const [replayPublished, setReplayPublished] = useState(true);

  const [loading, setLoading] = useState(false);

  // Open Live Edit
  const handleEditLive = (live: LiveSession) => {
    setEditingLive(live);
    setLiveTitle(live.title);
    setLiveDesc(live.description || '');
    setLiveType(live.type);
    setLiveScheduledAt(new Date(live.scheduled_at).toISOString().slice(0, 16));
    setLiveStreamUrl(live.stream_url || '');
    setLiveStatus(live.status);
    setLivePublished(live.published);
    setShowLiveForm(true);
  };

  const handleSaveLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim() || !liveScheduledAt) return;

    setLoading(true);
    try {
      if (editingLive) {
        await updateLive(editingLive.id, {
          title: liveTitle,
          description: liveDesc,
          type: liveType,
          scheduled_at: new Date(liveScheduledAt).toISOString(),
          stream_url: liveStreamUrl,
          status: liveStatus,
          published: livePublished,
        });
      } else {
        await createLive({
          title: liveTitle,
          description: liveDesc,
          type: liveType,
          scheduled_at: new Date(liveScheduledAt).toISOString(),
          stream_url: liveStreamUrl,
          status: liveStatus,
          published: livePublished,
        });
      }

      setShowLiveForm(false);
      setEditingLive(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde du Live');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLive = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette session Live ?')) {
      try {
        await deleteLive(id);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleToggleLivePublish = async (id: string, current: boolean) => {
    try {
      await togglePublishLive(id, !current);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur publication');
    }
  };

  // Open Replay Edit
  const handleEditReplay = (replay: LiveReplay) => {
    setEditingReplay(replay);
    setReplayLiveId(replay.live_id);
    setReplayTitle(replay.title);
    setReplayVideoUrl(replay.video_url);
    setReplayThumbnailUrl(replay.thumbnail_url || '');
    setReplayDuration(replay.duration_seconds || 0);
    setReplayPublished(replay.published);
    setShowReplayForm(true);
  };

  const handleSaveReplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replayTitle.trim() || !replayVideoUrl.trim()) return;

    setLoading(true);
    try {
      if (editingReplay) {
        await updateReplay(editingReplay.id, {
          title: replayTitle,
          video_url: replayVideoUrl,
          thumbnail_url: replayThumbnailUrl,
          duration_seconds: replayDuration,
          published: replayPublished,
        });
      } else {
        await createReplay({
          live_id: replayLiveId,
          title: replayTitle,
          video_url: replayVideoUrl,
          thumbnail_url: replayThumbnailUrl,
          duration_seconds: replayDuration,
          published: replayPublished,
        });
      }

      setShowReplayForm(false);
      setEditingReplay(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde du Replay');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReplay = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce replay ?')) {
      try {
        await deleteReplay(id);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Nav Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('lives')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lives'
                ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Sessions Lives ({lives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('replays')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'replays'
                ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Replays Archivés ({replays.length})</span>
          </button>
        </div>

        <div>
          {activeTab === 'lives' ? (
            <Button
              onClick={() => {
                setEditingLive(null);
                setLiveTitle('');
                setLiveDesc('');
                setLiveType('live_trading');
                setLiveScheduledAt(new Date().toISOString().slice(0, 16));
                setLiveStreamUrl('');
                setLiveStatus('scheduled');
                setLivePublished(true);
                setShowLiveForm(true);
              }}
              className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nouveau Live
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingReplay(null);
                setReplayLiveId(lives[0]?.id || '');
                setReplayTitle('');
                setReplayVideoUrl('');
                setReplayThumbnailUrl('');
                setReplayDuration(3600);
                setReplayPublished(true);
                setShowReplayForm(true);
              }}
              className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nouveau Replay
            </Button>
          )}
        </div>
      </div>

      {/* LIVE SESSIONS TAB */}
      {activeTab === 'lives' && (
        <div className="space-y-6">
          {showLiveForm && (
            <Card className="bg-[#181818] border-[#39FF14]/30 p-6 space-y-5">
              <h3 className="text-base font-bold text-white">
                {editingLive ? 'Modifier la session Live' : 'Créer une nouvelle session Live'}
              </h3>

              <form onSubmit={handleSaveLive} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Titre du Live *</label>
                    <Input
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="Ex: Live Trading Session US — NQ Open & Breakouts"
                      className="bg-black/60 border-white/10 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Description / Ordre du jour</label>
                    <textarea
                      rows={3}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="Détails, niveaux clés surveillés et préparation..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#39FF14]/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Type de Session</label>
                    <select
                      value={liveType}
                      onChange={(e) => setLiveType(e.target.value as LiveType)}
                      className="w-full h-9 bg-black/60 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/50"
                    >
                      <option value="live_trading">Live Trading</option>
                      <option value="masterclass">Masterclass</option>
                      <option value="collective">Session Collective</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Statut actuel</label>
                    <select
                      value={liveStatus}
                      onChange={(e) => setLiveStatus(e.target.value as LiveStatus)}
                      className="w-full h-9 bg-black/60 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/50"
                    >
                      <option value="scheduled">Programmé (scheduled)</option>
                      <option value="live">En direct (live)</option>
                      <option value="ended">Terminé (ended)</option>
                      <option value="cancelled">Annulé (cancelled)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Date et Heure *</label>
                    <Input
                      type="datetime-local"
                      value={liveScheduledAt}
                      onChange={(e) => setLiveScheduledAt(e.target.value)}
                      className="bg-black/60 border-white/10 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">URL du Stream (YouTube Live / externe)</label>
                    <Input
                      value={liveStreamUrl}
                      onChange={(e) => setLiveStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-black/60 border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="livePublished"
                    checked={livePublished}
                    onChange={(e) => setLivePublished(e.target.checked)}
                    className="rounded border-white/20 bg-black text-[#39FF14] focus:ring-[#39FF14]"
                  />
                  <label htmlFor="livePublished" className="text-xs text-neutral-300 font-medium">
                    Publier immédiatement (visible par les élèves)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLiveForm(false)}
                    className="text-xs text-neutral-400"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs"
                  >
                    {editingLive ? 'Mettre à jour le Live' : 'Créer le Live'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Lives Table */}
          {lives.length === 0 ? (
            <Card className="bg-[#141414] border-white/10 p-8 text-center text-xs text-neutral-400">
              Aucune session Live créée pour l'instant.
            </Card>
          ) : (
            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Session</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date & Heure</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Visibilité</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lives.map((l) => (
                      <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{l.title}</div>
                          {l.stream_url && (
                            <span className="text-[10px] text-neutral-500 font-mono truncate max-w-xs block">
                              {l.stream_url}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                              getLiveTypeLabel(l.type).color
                            }`}
                          >
                            {getLiveTypeLabel(l.type).label}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300 font-mono">
                          {formatLiveDate(l.scheduled_at).date} à{' '}
                          <span className="text-[#39FF14]">{formatLiveDate(l.scheduled_at).time}</span>
                        </td>
                        <td className="p-4">
                          <LiveStatusBadge status={l.status} />
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleLivePublish(l.id, l.published)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                              l.published
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-white/10'
                            }`}
                          >
                            {l.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{l.published ? 'Publié' : 'Brouillon'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/live/${l.id}`} target="_blank">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-neutral-400 hover:text-white"
                                title="Voir la salle live"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditLive(l)}
                              className="h-8 w-8 text-neutral-400 hover:text-white"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteLive(l.id)}
                              className="h-8 w-8 text-neutral-400 hover:text-red-400"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPLAYS TAB */}
      {activeTab === 'replays' && (
        <div className="space-y-6">
          {showReplayForm && (
            <Card className="bg-[#181818] border-[#39FF14]/30 p-6 space-y-5">
              <h3 className="text-base font-bold text-white">
                {editingReplay ? 'Modifier le Replay' : 'Ajouter un nouveau Replay'}
              </h3>

              <form onSubmit={handleSaveReplay} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Session Live rattachée</label>
                    <select
                      value={replayLiveId}
                      onChange={(e) => setReplayLiveId(e.target.value)}
                      className="w-full h-9 bg-black/60 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/50"
                      required
                    >
                      {lives.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({formatLiveDate(l.scheduled_at).date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Titre du Replay *</label>
                    <Input
                      value={replayTitle}
                      onChange={(e) => setReplayTitle(e.target.value)}
                      placeholder="Ex: Replay Live Trading NQ — Débriefing et Setups"
                      className="bg-black/60 border-white/10 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">URL Vidéo YouTube *</label>
                    <Input
                      value={replayVideoUrl}
                      onChange={(e) => setReplayVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-black/60 border-white/10 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">Durée estimée (secondes)</label>
                    <Input
                      type="number"
                      step="60"
                      value={replayDuration}
                      onChange={(e) => setReplayDuration(Number(e.target.value))}
                      placeholder="3600"
                      className="bg-black/60 border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">Miniature / Thumbnail URL (Optionnel)</label>
                    <Input
                      value={replayThumbnailUrl}
                      onChange={(e) => setReplayThumbnailUrl(e.target.value)}
                      placeholder="https://... (automatique si YouTube)"
                      className="bg-black/60 border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="replayPublished"
                    checked={replayPublished}
                    onChange={(e) => setReplayPublished(e.target.checked)}
                    className="rounded border-white/20 bg-black text-[#39FF14] focus:ring-[#39FF14]"
                  />
                  <label htmlFor="replayPublished" className="text-xs text-neutral-300 font-medium">
                    Publier immédiatement dans la galerie des replays
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplayForm(false)}
                    className="text-xs text-neutral-400"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs"
                  >
                    {editingReplay ? 'Mettre à jour le Replay' : 'Enregistrer le Replay'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Replays Table */}
          {replays.length === 0 ? (
            <Card className="bg-[#141414] border-white/10 p-8 text-center text-xs text-neutral-400">
              Aucun replay archivé pour l'instant.
            </Card>
          ) : (
            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Replay</th>
                      <th className="p-4">Session Source</th>
                      <th className="p-4">Durée</th>
                      <th className="p-4">Visibilité</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {replays.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{r.title}</div>
                          <span className="text-[10px] text-neutral-500 font-mono truncate max-w-xs block">
                            {r.video_url}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300">
                          {r.live?.title || 'Session Live'}
                        </td>
                        <td className="p-4 text-neutral-400 font-mono">
                          {Math.floor(r.duration_seconds / 60)} min
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.published
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-white/10'
                            }`}
                          >
                            {r.published ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditReplay(r)}
                              className="h-8 w-8 text-neutral-400 hover:text-white"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteReplay(r.id)}
                              className="h-8 w-8 text-neutral-400 hover:text-red-400"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
