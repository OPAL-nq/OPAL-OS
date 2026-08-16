import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CommunityChannel } from '@/types/community';
import { AdminCommunityManager } from '@/components/admin/admin-community-manager';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all channels
  const { data: channelsData } = await supabase
    .from('community_channels')
    .select('*')
    .order('position', { ascending: true });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir la communauté</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#39FF14] uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Administration OPAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Gestion des Salons Communautaires
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Créez, réordonnez et administrez les canaux de discussion pour les membres OPAL.
        </p>
      </div>

      <AdminCommunityManager channels={(channelsData || []) as CommunityChannel[]} />
    </div>
  );
}
