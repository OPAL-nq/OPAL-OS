import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { LiveReplay } from '@/types/live';
import { ReplayCard } from '@/components/live/replay-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlaySquare, ArrowLeft, Radio, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LiveReplaysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  const isAdmin = profile?.role === 'admin';

  let query = supabase
    .from('live_replays')
    .select('*, live:live_id(*)')
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    query = query.eq('published', true);
  }

  const { data: replaysData } = await query;
  const replays = (replaysData || []) as LiveReplay[];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Live Hub</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <PlaySquare className="w-4 h-4" />
            <span>OPAL Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Replays des Sessions en Direct
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Visionnez l'ensemble des lives, débriefings et masterclasses passés en haute définition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/live">
            <Button
              variant="outline"
              className="border-white/10 text-xs font-bold text-neutral-300 hover:text-white"
            >
              <Radio className="w-4 h-4 mr-1.5 text-red-400" />
              Prochains Lives
            </Button>
          </Link>
        </div>
      </div>

      {/* REPLAYS GRID */}
      {replays.length === 0 ? (
        <Card className="bg-[#141414] border-white/10 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 mx-auto flex items-center justify-center text-neutral-400">
            <PlaySquare className="w-7 h-7 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Aucun replay disponible</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Les enregistrements des lives seront publiés ici dès la fin des sessions en direct.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {replays.map((replay) => (
            <ReplayCard key={replay.id} replay={replay} />
          ))}
        </div>
      )}
    </div>
  );
}
