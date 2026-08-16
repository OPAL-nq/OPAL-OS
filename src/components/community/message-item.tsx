'use client';

import React from 'react';
import { CommunityMessage } from '@/types/community';
import { ReplyItem, formatMessageDate } from './reply-item';
import { Reply, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageItemProps {
  message: CommunityMessage;
  replies?: CommunityMessage[];
  onReply: (message: CommunityMessage) => void;
  onDelete?: (messageId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function MessageItem({
  message,
  replies = [],
  onReply,
  onDelete,
  currentUserId,
  isAdmin,
}: MessageItemProps) {
  const author = message.author;
  const isAuthor = currentUserId === message.user_id;
  const canDelete = isAuthor || isAdmin;
  const isMessageAdmin = author?.role === 'admin';
  const isIntensive = author?.plan === 'intensive';
  const authorName = author?.full_name || 'Membre OPAL';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedDate = formatMessageDate(message.created_at);

  return (
    <div className="relative group px-4 py-2 hover:bg-white/[0.025] transition-colors rounded-xl -mx-2">
      {/* Floating Action Bar on Hover */}
      <div className="absolute right-4 -top-3 hidden group-hover:flex items-center gap-1 bg-[#181818] border border-white/10 rounded-lg p-1 shadow-xl z-10 animate-in fade-in duration-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(message)}
          className="h-6 px-2 text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 rounded flex items-center gap-1"
        >
          <Reply className="w-3 h-3 text-[#39FF14]" />
          <span>Répondre</span>
        </Button>

        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(message.id)}
            className="h-6 px-1.5 text-[11px] text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded flex items-center gap-1"
            title="Supprimer le message"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="relative shrink-0 pt-0.5">
          {author?.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={authorName}
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black select-none ${
                isMessageAdmin
                  ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                  : isIntensive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/10 text-neutral-300 border border-white/10'
              }`}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header (Author, Badge, Date) */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-xs font-bold ${
                isMessageAdmin ? 'text-[#39FF14]' : 'text-white'
              }`}
            >
              {authorName}
            </span>

            {isMessageAdmin && (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 inline-flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Admin
              </span>
            )}

            {!isMessageAdmin && isIntensive && (
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 inline-flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Intensive
              </span>
            )}

            <span className="text-[10px] text-neutral-500 font-mono">
              {formattedDate}
            </span>
          </div>

          {/* Body Text */}
          <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attached Image */}
          {message.image_url && (
            <div className="pt-2">
              <a
                href={message.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl overflow-hidden border border-white/10 max-w-sm sm:max-w-md hover:border-[#39FF14]/50 transition-colors shadow-lg group/img"
              >
                <img
                  src={message.image_url}
                  alt="Capture partagée"
                  className="max-h-72 w-auto object-cover rounded-xl group-hover/img:scale-[1.01] transition-transform duration-200"
                />
              </a>
            </div>
          )}

          {/* Replies Section */}
          {replies.length > 0 && (
            <div className="pt-2 pl-2 space-y-1.5 border-l-2 border-white/10 mt-2">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
