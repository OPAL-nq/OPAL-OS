'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  sendDirectMessage,
  getDirectMessages,
  markConversationAsRead,
  markDirectMessageAsRead,
} from '@/app/actions/direct-messages';
import type { DirectMessage, ConversationSummary } from '@/types/direct-messages';
import type { Profile } from '@/types/database';
import {
  Search,
  Send,
  User,
  ArrowLeft,
  ShieldCheck,
  Check,
  CheckCheck,
  ExternalLink,
  Flame,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AdminChatInboxProps {
  initialConversations: ConversationSummary[];
  currentAdmin: Profile;
  initialSelectedUserId?: string;
}

export function AdminChatInbox({
  initialConversations,
  currentAdmin,
  initialSelectedUserId,
}: AdminChatInboxProps) {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialSelectedUserId || (initialConversations[0]?.userId ?? null)
  );
  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'intensive' | 'community'>('all');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedUserId
  );

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Load messages when selecting a user
  useEffect(() => {
    if (!selectedUserId) {
      setActiveMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);

    getDirectMessages(selectedUserId)
      .then((msgs) => {
        if (isMounted) {
          setActiveMessages(msgs);
          setIsLoadingMessages(false);
          setTimeout(() => scrollToBottom(false), 50);

          // Mark conversation as read
          markConversationAsRead(selectedUserId);

          // Update local unread state in conversation list
          setConversations((prev) =>
            prev.map((c) =>
              c.userId === selectedUserId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      })
      .catch((err) => {
        console.error('Error fetching messages for user:', err);
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserId]);

  // Realtime Supabase subscription
  useEffect(() => {
    let isMounted = true;

    const channel = supabase
      .channel('admin-direct-messages-inbox')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;

          if (isMounted) {
            const senderOrReceiverId =
              newMsg.sender_id === currentAdmin.id
                ? newMsg.receiver_id
                : newMsg.sender_id;

            // 1. If currently active conversation
            if (senderOrReceiverId === selectedUserId) {
              setActiveMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => scrollToBottom(true), 80);

              if (newMsg.receiver_id === currentAdmin.id) {
                await markDirectMessageAsRead(newMsg.id);
              }
            }

            // 2. Update conversation list snippet, unread count & sort
            setConversations((prev) => {
              const existingIndex = prev.findIndex(
                (c) => c.userId === senderOrReceiverId
              );

              if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                const isUnreadForAdmin =
                  newMsg.receiver_id === currentAdmin.id &&
                  senderOrReceiverId !== selectedUserId;

                const updated: ConversationSummary = {
                  ...existing,
                  lastMessage: newMsg,
                  unreadCount: isUnreadForAdmin
                    ? existing.unreadCount + 1
                    : existing.unreadCount,
                };

                const newList = [
                  updated,
                  ...prev.filter((_, idx) => idx !== existingIndex),
                ];
                return newList;
              } else {
                // Fetch new profile if missing
                return prev;
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const updatedMsg = payload.new as DirectMessage;
          if (isMounted) {
            setActiveMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, currentAdmin.id, selectedUserId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUserId) return;
    const content = inputText.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: DirectMessage = {
      id: tempId,
      sender_id: currentAdmin.id,
      receiver_id: selectedUserId,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };

    setActiveMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const realMsg = await sendDirectMessage({
        content,
        receiverId: selectedUserId,
      });

      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMsg : m))
      );

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === selectedUserId ? { ...c, lastMessage: realMsg } : c
        )
      );

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err: any) {
      console.error('Failed to send admin reply:', err);
      setErrorMsg(err?.message || "Impossible d'envoyer la réponse.");
      setActiveMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const nameMatch =
      c.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profile.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!nameMatch) return false;

    if (filterTab === 'unread') return c.unreadCount > 0;
    if (filterTab === 'intensive') return c.profile.plan === 'intensive';
    if (filterTab === 'community') return c.profile.plan === 'community';
    return true;
  });

  const formatMessageDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="h-[calc(100vh-10rem)] max-w-7xl mx-auto bg-[#0E0E0E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex relative">
      {/* ==================================================================== */}
      {/* 1. LEFT COLUMN: CONVERSATION LIST                                    */}
      {/* ==================================================================== */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 border-r border-white/10 bg-[#121212] flex flex-col shrink-0 transition-all z-20',
          selectedUserId ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header & Search */}
        <div className="p-3.5 border-b border-white/10 space-y-3 bg-[#141414]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Boîte de Réception</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 text-xs font-mono">
                {conversations.length}
              </span>
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève..."
              className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#39FF14]/50"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors whitespace-nowrap',
                filterTab === 'all'
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1',
                filterTab === 'unread'
                  ? 'bg-[#39FF14]/20 text-[#39FF14] font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              <span>Non lus</span>
              {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
              )}
            </button>
            <button
              onClick={() => setFilterTab('intensive')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors whitespace-nowrap',
                filterTab === 'intensive'
                  ? 'bg-[#39FF14]/20 text-[#39FF14] font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Intensive
            </button>
            <button
              onClick={() => setFilterTab('community')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors whitespace-nowrap',
                filterTab === 'community'
                  ? 'bg-blue-500/20 text-blue-400 font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Community
            </button>
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 space-y-2">
              <MessageSquare className="w-6 h-6 mx-auto opacity-30" />
              <p className="text-xs">Aucune conversation trouvée.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.userId === selectedUserId;
              const isMeLastSender = conv.lastMessage.sender_id === currentAdmin.id;
              const memberName =
                conv.profile.full_name || conv.profile.email.split('@')[0];

              return (
                <div
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  className={cn(
                    'p-3.5 transition-all cursor-pointer flex items-start gap-3 select-none relative group',
                    isSelected
                      ? 'bg-white/[0.07] border-l-2 border-[#39FF14]'
                      : 'hover:bg-white/[0.03] text-neutral-300'
                  )}
                >
                  {/* Member Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                      {memberName.substring(0, 2)}
                    </div>

                    {conv.profile.plan === 'intensive' && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black border border-[#39FF14] flex items-center justify-center text-[#39FF14]">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          'text-xs font-bold truncate',
                          isSelected ? 'text-white' : 'text-neutral-200'
                        )}
                      >
                        {memberName}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                        {formatMessageDate(conv.lastMessage.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-neutral-400 truncate leading-snug flex-1">
                        {isMeLastSender && (
                          <span className="text-neutral-500 mr-1">Vous :</span>
                        )}
                        {conv.lastMessage.content}
                      </p>

                      {/* Unread badge */}
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] rounded-full bg-[#39FF14] text-black text-[10px] font-black flex items-center justify-center px-1 shadow-[0_0_8px_rgba(57,255,20,0.6)] shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase',
                          conv.profile.plan === 'intensive'
                            ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        )}
                      >
                        {conv.profile.plan === 'intensive' ? 'Intensive PRO' : 'Community'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. RIGHT COLUMN: ACTIVE CHAT THREAD                                  */}
      {/* ==================================================================== */}
      <div
        className={cn(
          'flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden',
          !selectedUserId ? 'hidden md:flex' : 'flex'
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 sm:px-6 border-b border-white/10 bg-[#121212] flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white bg-white/5"
                  title="Retour aux conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0">
                  {(
                    selectedConversation.profile.full_name ||
                    selectedConversation.profile.email
                  ).substring(0, 2)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {selectedConversation.profile.full_name || 'Élève'}
                    </h3>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0',
                        selectedConversation.profile.plan === 'intensive'
                          ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      )}
                    >
                      {selectedConversation.profile.plan}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {selectedConversation.profile.email}
                  </p>
                </div>
              </div>

              {/* Quick links to student profile */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/students`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
                >
                  <ExternalLink className="w-3 h-3 text-[#39FF14]" />
                  <span className="hidden sm:inline">Dossier Élève</span>
                </Link>
              </div>
            </div>

            {/* Chat Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center text-neutral-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#39FF14]" />
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-xs">Aucun message dans cette conversation.</p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMe = msg.sender_id === currentAdmin.id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]',
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed relative break-words shadow-sm',
                          isMe
                            ? 'bg-[#39FF14]/15 border border-[#39FF14]/30 text-white rounded-tr-xs shadow-[0_2px_12px_rgba(57,255,20,0.08)]'
                            : 'bg-[#181818] border border-white/10 text-neutral-100 rounded-tl-xs'
                        )}
                      >
                        {!isMe && (
                          <div className="text-[11px] font-bold text-neutral-400 mb-1 flex items-center gap-1">
                            <span>
                              {selectedConversation.profile.full_name || 'Élève'}
                            </span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-[10px] mt-1.5 font-mono select-none',
                            isMe ? 'justify-end text-neutral-400' : 'justify-start text-neutral-500'
                          )}
                        >
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {isMe && (
                            <span>
                              {msg.read ? (
                                <span title="Lu par le membre">
                                  <CheckCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                                </span>
                              ) : (
                                <span title="Délivré">
                                  <Check className="w-3.5 h-3.5 text-neutral-500" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-400 hover:text-white font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#121212] shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1 relative bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#39FF14]/50 focus-within:ring-1 focus-within:ring-[#39FF14]/50 transition-all">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Répondre à ${selectedConversation.profile.full_name || 'cet élève'}...`}
                    rows={2}
                    className="w-full bg-transparent p-3 text-sm text-white placeholder-neutral-500 resize-none outline-none scrollbar-thin scrollbar-thumb-white/10"
                    disabled={isSending}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className={cn(
                    'h-12 px-4 sm:px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shrink-0',
                    !inputText.trim() || isSending
                      ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                      : 'bg-[#39FF14] text-black hover:bg-[#32e612] shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-95'
                  )}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Répondre</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
              <MessageSquare className="w-7 h-7 text-[#39FF14]" />
            </div>
            <h3 className="text-base font-bold text-white">
              Boîte de Réception Membres
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              Sélectionnez une conversation dans la colonne de gauche pour lire les messages et répondre aux membres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
