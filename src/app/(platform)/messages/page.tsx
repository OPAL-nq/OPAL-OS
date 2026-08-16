import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDirectMessages } from '@/app/actions/direct-messages';
import { MemberChat } from '@/components/messages/member-chat';
import type { Profile } from '@/types/database';

export const metadata = {
  title: 'Messagerie Privée | OPAL OS',
  description: 'Échangez en direct et en toute confidentialité avec l\'équipe OPAL.',
};

export default async function MessagesPage() {
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

  if (!profile) {
    redirect('/login');
  }

  // Fetch initial direct messages
  const initialMessages = await getDirectMessages();

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>💬 Messagerie Privée</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Canal de communication direct avec vos mentors et le support OPAL
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <MemberChat
        initialMessages={initialMessages}
        currentProfile={profile as Profile}
      />
    </div>
  );
}
