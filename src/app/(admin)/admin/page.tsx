import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, GraduationCap, Radio, Flame } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch count of users
  const { data: users, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  const profiles = (users || []) as Profile[];
  const communityCount = profiles.filter((p) => p.plan === 'community').length;
  const intensiveCount = profiles.filter((p) => p.plan === 'intensive').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Mode Administrateur</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Tableau de bord Admin
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestion des utilisateurs, des contenus et de l'accompagnement
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-neutral-400">
                Utilisateurs Total
              </CardDescription>
              <Users className="w-4 h-4 text-[#39FF14]" />
            </div>
            <CardTitle className="text-2xl text-white font-bold">
              {count || profiles.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-neutral-400">Comptes inscrits sur OPAL</span>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-neutral-400">
                Membres Community
              </CardDescription>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white font-bold">
              {communityCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-neutral-400">Accès formation & outils</span>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-neutral-400">
                Membres Intensive
              </CardDescription>
              <Flame className="w-4 h-4 text-[#39FF14]" />
            </div>
            <CardTitle className="text-2xl text-[#39FF14] font-bold">
              {intensiveCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-neutral-400">Accompagnement privé</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
          Modules d'Administration OPAL
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/academy" className="group">
            <Card className="bg-[#141414] border-white/5 group-hover:border-[#39FF14]/40 transition-all p-5 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-[#39FF14] transition-colors text-sm">
                  Admin Academy
                </h3>
                <p className="text-xs text-neutral-400">
                  Gestion des modules, chapitres, leçons vidéo et ressources URL.
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/live" className="group">
            <Card className="bg-[#141414] border-white/5 group-hover:border-[#39FF14]/40 transition-all p-5 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-[#39FF14] transition-colors text-sm">
                  Admin Lives & Replays
                </h3>
                <p className="text-xs text-neutral-400">
                  Programmation des sessions live, diffusion et replays vidéo.
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/community" className="group">
            <Card className="bg-[#141414] border-white/5 group-hover:border-[#39FF14]/40 transition-all p-5 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-[#39FF14] transition-colors text-sm">
                  Admin Community
                </h3>
                <p className="text-xs text-neutral-400">
                  Gestion des 9 salons, ordre d'affichage et modération.
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/students" className="group">
            <Card className="bg-[#141414] border-white/5 group-hover:border-[#39FF14]/40 transition-all p-5 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white group-hover:text-[#39FF14] transition-colors text-sm">
                  Suivi Élèves & Trades
                </h3>
                <p className="text-xs text-neutral-400">
                  Inspection des journals de trading, sessions et statistiques.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Users table summary */}
      <Card className="bg-[#141414] border-white/5">
        <CardHeader>
          <CardTitle className="text-base text-white">Utilisateurs récents</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Derniers comptes créés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400">
              Aucun profil trouvé dans la base de données.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-neutral-400 border-b border-white/5 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-medium text-white">
                        {p.full_name || 'Sans nom'}
                      </td>
                      <td className="py-3 px-4 text-neutral-400">{p.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] border ${
                            p.plan === 'intensive'
                              ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20'
                              : 'bg-white/5 text-neutral-400 border-white/10'
                          }`}
                        >
                          {p.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">{p.role}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {new Date(p.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
