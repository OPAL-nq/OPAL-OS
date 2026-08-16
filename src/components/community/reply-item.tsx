import React from 'react';
import { CommunityMessage } from '@/types/community';
import { ShieldCheck, Sparkles, Trash2 } from 'lucide-react';

interface ReplyItemProps {
  reply: CommunityMessage;
  onDelete?: (replyId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function formatMessageDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const time = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) {
      return `Aujourd'hui à ${time}`;
    }

    const date = d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
    return `${date} à ${time}`;
  } catch {
    return dateString;
  }
}

export function ReplyItem({ reply, onDelete, currentUserId, isAdmin }: ReplyItemProps) {
  const author = reply.author;
  const isAuthor = currentUserId === reply.user_id;
  const canDelete = isAuthor || isAdmin;
  const isMessageAdmin = author?.role === 'admin';
  const authorName = author?.full_name || 'Membre OPAL';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedDate = formatMessageDate(reply.created_at);

  return (
    <div className="relative group/reply flex items-start gap-2 pt-1">
      {/* Avatar */}
      <div className="relative shrink-0 pt-0.5">
        {author?.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={authorName}
            className="w-5 h-5 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
              isMessageAdmin
                ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40'
                : 'bg-white/10 text-white border border-white/10'
            }`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-0.5 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className={`text-xs font-bold ${
              isMessageAdmin ? 'text-[#39FF14]' : 'text-neutral-200'
            }`}
          >
            {authorName}
          </span>
          {isMessageAdmin && (
            <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider bg-[#39FF14]/15 text-[#39FF14]">
              Admin
            </span>
          )}
          <span className="text-[9px] text-neutral-500 font-mono">{formattedDate}</span>

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(reply.id)}
              className="opacity-0 group-hover/reply:opacity-100 transition-opacity p-0.5 text-neutral-500 hover:text-red-400"
              title="Supprimer la réponse"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
          {reply.content}
        </div>

        {reply.image_url && (
          <div className="pt-1">
            <a
              href={reply.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg overflow-hidden border border-white/10 max-w-xs hover:border-[#39FF14]/40 transition-colors"
            >
              <img
                src={reply.image_url}
                alt="Capture"
                className="max-h-40 w-auto object-cover rounded-lg"
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
