'use client';

import React, { useState } from 'react';
import { CommunityMessage, MessageAuthor } from '@/types/community';
import { MessageItem } from './message-item';
import { MessageComposer } from './message-composer';
import { deleteMessage } from '@/app/actions/community';
import { User, Lock, HelpCircle } from 'lucide-react';

interface SupportInboxProps {
  channelId: string;
  initialMessages: CommunityMessage[];
  isAdmin: boolean;
  currentUserId: string;
}

export function SupportInbox({
  channelId,
  initialMessages,
  isAdmin,
  currentUserId,
}: SupportInboxProps) {
  const [messages, setMessages] = useState<CommunityMessage[]>(initialMessages);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handleMessageSent = (newMsg: CommunityMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
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
      setMessages(initialMessages);
    }
  };

  // For Admin: group parent tickets by student
  const parentTickets = messages.filter((m) => !m.parent_message_id);
  const studentMap = new Map<string, { author: MessageAuthor | undefined; count: number; lastMessage: CommunityMessage }>();

  parentTickets.forEach((ticket) => {
    const existing = studentMap.get(ticket.user_id);
    if (!existing || new Date(ticket.created_at) > new Date(existing.lastMessage.created_at)) {
      studentMap.set(ticket.user_id, {
        author: ticket.author,
        count: (existing?.count || 0) + 1,
        lastMessage: ticket,
      });
    }
  });

  const studentsList = Array.from(studentMap.entries()).map(([userId, data]) => ({
    userId,
    author: data.author,
    count: data.count,
    lastMessage: data.lastMessage,
  }));

  // Filter messages according to selected student if Admin
  const filteredParents = isAdmin && selectedStudentId
    ? parentTickets.filter((m) => m.user_id === selectedStudentId)
    : parentTickets;

  const replyMap = new Map<string, CommunityMessage[]>();
  messages.forEach((m) => {
    if (m.parent_message_id) {
      const existing = replyMap.get(m.parent_message_id) || [];
      existing.push(m);
      replyMap.set(m.parent_message_id, existing);
    }
  });

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#0A0A0A]">
      {/* If Admin: Student selector sub-sidebar */}
      {isAdmin && (
        <div className="w-60 bg-[#0E0E0E] border-r border-white/5 p-3 flex flex-col shrink-0 overflow-y-auto space-y-1.5 scrollbar-thin">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black text-neutral-500 uppercase tracking-wider">
            <span>Demandes d'aide ({studentsList.length})</span>
            {selectedStudentId && (
              <button
                type="button"
                onClick={() => setSelectedStudentId(null)}
                className="text-[#39FF14] hover:underline text-[9px]"
              >
                Tous
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSelectedStudentId(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
              selectedStudentId === null
                ? 'bg-white/10 text-white font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>Toutes les demandes</span>
            <span className="text-[10px] text-neutral-400 font-mono">{parentTickets.length}</span>
          </button>

          {studentsList.map(({ userId, author, count }) => (
            <button
              key={userId}
              type="button"
              onClick={() => setSelectedStudentId(userId)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                selectedStudentId === userId
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{author?.full_name || 'Élève'}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 shrink-0">
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Support Header */}
            <div className="pt-6 pb-4 border-b border-white/5 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAdmin ? 'Support & Assistance Élèves' : 'Support Privé & Confidentiel'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg">
                {isAdmin
                  ? "Gestion centralisée des demandes d'assistance de tous les membres OPAL."
                  : "Seul vous et l'administrateur avez accès à vos messages dans cet espace. Posez vos questions en toute confidentialité."}
              </p>
            </div>

            {filteredParents.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto opacity-30 text-[#39FF14]" />
                <p className="text-neutral-400 font-medium">
                  {isAdmin
                    ? 'Aucune demande de support en attente.'
                    : 'Aucun message dans votre espace support pour le moment. Écrivez votre premier message ci-dessous.'}
                </p>
              </div>
            ) : (
              filteredParents.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  replies={replyMap.get(msg.id) || []}
                  onReply={(m) => setReplyingTo(m)}
                  onDelete={handleDeleteMessage}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        </div>

        {/* Composer */}
        <MessageComposer
          channelId={channelId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onMessageSent={handleMessageSent}
          placeholder={isAdmin ? "Répondre à l'élève..." : 'Décrivez votre question ou problème technique...'}
        />
      </div>
    </div>
  );
}
