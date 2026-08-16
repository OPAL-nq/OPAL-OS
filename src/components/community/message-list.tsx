'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CommunityMessage } from '@/types/community';
import { MessageItem } from './message-item';
import { MessageComposer } from './message-composer';
import { deleteMessage } from '@/app/actions/community';
import { createClient } from '@/lib/supabase/client';
import { Lock, Hash } from 'lucide-react';

interface MessageListProps {
  initialMessages: CommunityMessage[];
  channelId: string;
  channelSlug: string;
  isAdmin: boolean;
  currentUserId?: string;
}

export function MessageList({
  initialMessages,
  channelId,
  channelSlug,
  isAdmin,
  currentUserId,
}: MessageListProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>(initialMessages);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const isAnnouncement = channelSlug === 'annonces';
  const canPost = !isAnnouncement || isAdmin;

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    setMessages(initialMessages);
    scrollToBottom('auto');
  }, [initialMessages, channelId]);

  // Realtime subscription (INSERT and DELETE)
  useEffect(() => {
    const channel = supabase
      .channel(`community-messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const newRow = payload.new as any;

          // Fetch author profile
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role, plan')
            .eq('id', newRow.user_id)
            .single();

          const hydratedMessage: CommunityMessage = {
            id: newRow.id,
            channel_id: newRow.channel_id,
            user_id: newRow.user_id,
            content: newRow.content,
            image_url: newRow.image_url,
            parent_message_id: newRow.parent_message_id,
            created_at: newRow.created_at,
            author: authorProfile
              ? {
                  id: authorProfile.id,
                  full_name: authorProfile.full_name,
                  avatar_url: authorProfile.avatar_url,
                  role: authorProfile.role || 'user',
                  plan: authorProfile.plan || 'community',
                }
              : undefined,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === hydratedMessage.id)) {
              return prev;
            }
            return [...prev, hydratedMessage];
          });

          setTimeout(() => scrollToBottom('smooth'), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'community_messages',
        },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) {
            setMessages((prev) =>
              prev.filter((m) => m.id !== deletedId && m.parent_message_id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, supabase]);

  const handleMessageSent = (newMsg: CommunityMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleDeleteMessage = async (messageId: string) => {
    // Optimistic removal
    setMessages((prev) =>
      prev.filter((m) => m.id !== messageId && m.parent_message_id !== messageId)
    );

    try {
      await deleteMessage(messageId);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression du message');
      // Revert if error
      setMessages(initialMessages);
    }
  };

  // Group root messages and their replies
  const parentMessages = messages.filter((m) => !m.parent_message_id);
  const replyMap = new Map<string, CommunityMessage[]>();

  messages.forEach((m) => {
    if (m.parent_message_id) {
      const existing = replyMap.get(m.parent_message_id) || [];
      existing.push(m);
      replyMap.set(m.parent_message_id, existing);
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0A0A]">
      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Welcome Header at the top of the channel */}
          <div className="pt-6 pb-4 border-b border-white/5 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
              {isAnnouncement ? (
                <Lock className="w-6 h-6 text-[#39FF14]" />
              ) : (
                <Hash className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Bienvenue dans le salon #{channelSlug} !
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg">
              {isAnnouncement
                ? "Ce canal est réservé aux annonces officielles de l'équipe OPAL."
                : `C'est le début du salon #${channelSlug}. Échangez librement avec les autres membres d'OPAL OS.`}
            </p>
          </div>

          {/* Message Rows */}
          {parentMessages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              replies={replyMap.get(msg.id) || []}
              onReply={(m) => setReplyingTo(m)}
              onDelete={handleDeleteMessage}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer or Read-Only Bar */}
      {canPost ? (
        <MessageComposer
          channelId={channelId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onMessageSent={handleMessageSent}
          placeholder={`Envoyer un message dans #${channelSlug}...`}
        />
      ) : (
        <div className="p-4 bg-[#0C0C0C] border-t border-white/5 text-center shrink-0">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-xs text-neutral-400 py-1">
            <Lock className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>Ce salon est en lecture seule (réservé aux annonces officielles).</span>
          </div>
        </div>
      )}
    </div>
  );
}
