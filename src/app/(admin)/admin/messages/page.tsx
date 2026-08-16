import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAdminConversations } from '@/app/actions/direct-messages';
import { AdminChatInbox } from '@/components/admin/admin-chat-inbox';
import type { Profile } from '@/types/database';

export const metadata = {
  title: 'Messagerie Membres | Cockpit Admin OPAL',
  description: 'Boîte de réception des messages privés échangés avec les membres.',
};

interface AdminMessagesPageProps {
  searchParams: Promise<{ userId?: string; user?: string }>;
}

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const targetUserId = params.userId || params.user;

  // Fetch all conversations for admin
  const conversations = await getAdminConversations();

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Administration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>💬 Messagerie & Support Privé</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Gérez vos conversations privées et le coaching One-on-One en direct
          </p>
        </div>
      </div>

      {/* Main Inbox Component */}
      <AdminChatInbox
        initialConversations={conversations}
        currentAdmin={profile as Profile}
        initialSelectedUserId={targetUserId}
      />
    </div>
  );
}
