'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  sendDirectMessage,
  markConversationAsRead,
  markDirectMessageAsRead,
} from '@/app/actions/direct-messages';
import type { DirectMessage } from '@/types/direct-messages';
import type { Profile } from '@/types/database';
import {
  Send,
  ShieldCheck,
  Check,
  CheckCheck,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberChatProps {
  initialMessages: DirectMessage[];
  currentProfile: Profile;
}

export function MemberChat({ initialMessages, currentProfile }: MemberChatProps) {
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Initial scroll to bottom & mark as read
  useEffect(() => {
    scrollToBottom(false);
    // Mark messages as read
    markConversationAsRead('any');
  }, []);

  // Supabase Realtime listener
  useEffect(() => {
    let isMounted = true;

    const channel = supabase
      .channel('member-direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;

          // Only handle messages relevant to current user
          if (
            newMsg.sender_id === currentProfile.id ||
            newMsg.receiver_id === currentProfile.id
          ) {
            if (isMounted) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              setTimeout(() => scrollToBottom(true), 80);

              // If message received by current user, mark read
              if (newMsg.receiver_id === currentProfile.id) {
                await markDirectMessageAsRead(newMsg.id);
              }
            }
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
            setMessages((prev) =>
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
  }, [supabase, currentProfile.id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    setInputText('');

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: DirectMessage = {
      id: tempId,
      sender_id: currentProfile.id,
      receiver_id: 'admin',
      content,
      read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const realMsg = await sendDirectMessage({ content });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? realMsg : m))
      );
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMsg(err?.message || "Impossible d'envoyer le message.");
      // Rollback optimistic
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
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

  // Group messages by Date (e.g., Aujourd'hui, Hier, DD/MM/YYYY)
  const formatMessageDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Aujourd'hui";
    if (isYesterday) return 'Hier';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-[#0E0E0E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* 1. Header */}
      <div className="h-16 px-5 border-b border-white/10 bg-[#141414] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-black border border-[#39FF14]/30 flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.15)]">
              <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#39FF14] border-2 border-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Équipe OPAL
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                Support & Coaching
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Ligne directe & confidentielle avec vos mentors
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>Réponse sous 24h ouvrées</span>
        </div>
      </div>

      {/* 2. Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
              <MessageSquare className="w-7 h-7 text-[#39FF14]" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Bienvenue dans votre messagerie privée
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Posez vos questions sur la méthode OPAL, demandez des débriefings sur
                vos trades ou échangez en direct avec votre coach. Vos échanges
                restent strictement confidentiels.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentProfile.id;
            const msgDate = formatMessageDate(msg.created_at);
            const prevMsgDate =
              index > 0 ? formatMessageDate(messages[index - 1].created_at) : null;
            const showDateSeparator = index === 0 || msgDate !== prevMsgDate;

            return (
              <React.Fragment key={msg.id}>
                {/* Date separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {msgDate}
                    </span>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]',
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div
                    className={cn(
                      'p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed relative break-words transition-all',
                      isMe
                        ? 'bg-[#39FF14]/15 border border-[#39FF14]/30 text-white rounded-tr-xs shadow-[0_2px_12px_rgba(57,255,20,0.08)]'
                        : 'bg-[#181818] border border-white/10 text-neutral-100 rounded-tl-xs shadow-md'
                    )}
                  >
                    {!isMe && (
                      <div className="text-[11px] font-black text-[#39FF14] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span>Équipe OPAL</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Metadata: Time & Read status */}
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
                            <span title="Lu">
                              <CheckCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                            </span>
                          ) : (
                            <span title="Envoyé">
                              <Check className="w-3.5 h-3.5 text-neutral-500" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Error Alert */}
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

      {/* 4. Input Fixed Bar */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#141414]/95 backdrop-blur-md shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#39FF14]/50 focus-within:ring-1 focus-within:ring-[#39FF14]/50 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message à l'équipe OPAL... (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
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
                <span className="hidden sm:inline">Envoyer</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
