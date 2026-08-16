'use client';

import React, { useState } from 'react';
import { CommunityChannel } from '@/types/community';
import {
  createChannel,
  updateChannel,
  deleteChannel,
  togglePublishChannel,
} from '@/app/actions/community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Hash,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface AdminCommunityManagerProps {
  channels: CommunityChannel[];
}

export function AdminCommunityManager({ channels }: AdminCommunityManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<CommunityChannel | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleEdit = (c: CommunityChannel) => {
    setEditingChannel(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setPosition(c.position);
    setPublished(c.published);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    try {
      if (editingChannel) {
        await updateChannel(editingChannel.id, {
          name,
          slug,
          description,
          position,
          published,
        });
      } else {
        await createChannel({
          name,
          slug,
          description,
          position,
          published,
        });
      }

      setShowForm(false);
      setEditingChannel(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde du salon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce salon et TOUS ses messages ?')) {
      try {
        await deleteChannel(id);
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await togglePublishChannel(id, !current);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur publication');
    }
  };

  const handleSeedDefault = async () => {
    if (confirm('Voulez-vous synchroniser les 9 salons officiels OPAL OS (Annonces, Général, Trading, Questions, Journal, Wins, Motivation, Support, Replays) ?')) {
      setLoading(true);
      try {
        const { seedDefaultChannels } = await import('@/app/actions/community');
        await seedDefaultChannels();
        window.location.reload();
      } catch (err: any) {
        alert(err.message || "Erreur lors de l'initialisation des salons");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">Salons de discussion ({channels.length})</h2>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleSeedDefault}
            className="border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/10 font-bold text-xs h-9"
          >
            <Hash className="w-4 h-4 mr-1.5" />
            Synchroniser les 9 Salons Officiels
          </Button>

          <Button
            onClick={() => {
              setEditingChannel(null);
              setName('');
              setSlug('');
              setDescription('');
              setPosition(channels.length + 1);
              setPublished(true);
              setShowForm(true);
            }}
            className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs h-9 shadow-[0_0_15px_rgba(57,255,20,0.25)]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Salon
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#181818] border-[#39FF14]/30 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            {editingChannel ? 'Modifier le salon' : 'Créer un nouveau salon'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Nom du salon *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 📈 Setups & Graphiques"
                  className="bg-black/60 border-white/10 text-white text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Slug (URL) *</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="setups-graphiques"
                  className="bg-black/60 border-white/10 text-white text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-300">Description du salon</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Partagez vos captures de graphiques et vos analyses..."
                  className="bg-black/60 border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Ordre d'affichage (position)</label>
                <Input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                  className="bg-black/60 border-white/10 text-white text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="channelPublished"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-white/20 bg-black text-[#39FF14] focus:ring-[#39FF14]"
              />
              <label htmlFor="channelPublished" className="text-xs text-neutral-300 font-medium">
                Salon actif et visible par les membres
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-xs text-neutral-400"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#39FF14] text-black hover:bg-[#32e012] font-bold text-xs"
              >
                {editingChannel ? 'Mettre à jour' : 'Créer le salon'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Channels Table */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-neutral-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">Ordre</th>
                <th className="p-4">Salon</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {channels.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-neutral-400 font-bold">#{c.position}</td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                  </td>
                  <td className="p-4 font-mono text-neutral-300">/community/{c.slug}</td>
                  <td className="p-4 text-neutral-400 max-w-xs truncate">{c.description || '—'}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(c.id, c.published)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        c.published
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-white/10'
                      }`}
                    >
                      {c.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{c.published ? 'Actif' : 'Masqué'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/community/${c.slug}`} target="_blank">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-neutral-400 hover:text-white"
                          title="Accéder au salon"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(c)}
                        className="h-8 w-8 text-neutral-400 hover:text-white"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(c.id)}
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
    </div>
  );
}
