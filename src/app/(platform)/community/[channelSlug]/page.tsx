import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CommunityChannel, CommunityMessage, MessageAuthor } from '@/types/community';
import { ChannelSidebar } from '@/components/community/channel-sidebar';
import { ChannelHeader } from '@/components/community/channel-header';
import { MessageList } from '@/components/community/message-list';
import { SupportInbox } from '@/components/community/support-inbox';

export const dynamic = 'force-dynamic';

interface ChannelPageProps {
  params: Promise<{
    channelSlug: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channelSlug } = await params;
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

  // 1. Fetch accessible channels from database (respects deletions and published status)
  let channelsQuery = supabase
    .from('community_channels')
    .select('*')
    .order('position', { ascending: true });

  if (!isAdmin) {
    channelsQuery = channelsQuery.eq('published', true);
  }

  const { data: channelsData } = await channelsQuery;
  const channels = (channelsData || []) as CommunityChannel[];

  // 2. If no channels exist at all in DB
  if (channels.length === 0) {
    const { CommunityInitialSetup } = await import('@/components/community/community-initial-setup');
    return <CommunityInitialSetup isAdmin={isAdmin} />;
  }

  // 3. Find active channel
  let activeChannel = channels.find((c) => c.slug === channelSlug);
  if (!activeChannel) {
    activeChannel = channels[0];
  }

  // 4. Fetch messages for active channel (Optimized: 50 most recent messages)
  let messagesQuery = supabase
    .from('community_messages')
    .select('*')
    .eq('channel_id', activeChannel.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // If support channel and not admin: only view own tickets & replies
  if (activeChannel.slug === 'support' && !isAdmin && user) {
    messagesQuery = messagesQuery.or(`user_id.eq.${user.id},parent_message_id.not.is.null`);
  }

  const { data: messagesRaw } = await messagesQuery;
  const messagesData = (messagesRaw || []).reverse();

  // 5. Batch-fetch author profiles for all messages
  const userIds = Array.from(new Set((messagesData || []).map((m: any) => m.user_id)));
  const profilesMap = new Map<string, MessageAuthor>();

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, plan')
      .in('id', userIds);

    (profilesData || []).forEach((p: any) => {
      profilesMap.set(p.id, {
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        role: p.role || 'user',
        plan: p.plan || 'community',
      });
    });
  }

  // Map messages with their resolved author profile
  const initialMessages: CommunityMessage[] = (messagesData || []).map((m: any) => ({
    id: m.id,
    channel_id: m.channel_id,
    user_id: m.user_id,
    content: m.content,
    image_url: m.image_url,
    parent_message_id: m.parent_message_id,
    created_at: m.created_at,
    author: profilesMap.get(m.user_id) || {
      id: m.user_id,
      full_name: 'Membre OPAL',
      avatar_url: null,
      role: 'user',
      plan: 'community',
    },
  }));

  const isSupport = activeChannel.slug === 'support';

  return (
    <div className="-m-6 md:-m-8 h-[calc(100vh-4rem)] flex overflow-hidden bg-[#0A0A0A]">
      {/* Left Discord-Style Channels Sidebar */}
      <ChannelSidebar
        channels={channels}
        activeSlug={activeChannel.slug}
        isAdmin={isAdmin}
      />

      {/* Right Discord-Style Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0C0C0C] h-full overflow-hidden">
        <ChannelHeader channel={activeChannel} allChannels={channels} />

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isSupport ? (
            <SupportInbox
              channelId={activeChannel.id}
              initialMessages={initialMessages}
              isAdmin={isAdmin}
              currentUserId={user?.id || ''}
            />
          ) : (
            <MessageList
              initialMessages={initialMessages}
              channelId={activeChannel.id}
              channelSlug={activeChannel.slug}
              isAdmin={isAdmin}
              currentUserId={user?.id || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
}
