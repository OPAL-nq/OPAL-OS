'use client';

import React, { useState, useRef } from 'react';
import { CommunityMessage } from '@/types/community';
import { sendMessage } from '@/app/actions/community';
import { ImageUploader } from './image-uploader';
import { Send, X, CornerDownRight, Loader2 } from 'lucide-react';

interface MessageComposerProps {
  channelId: string;
  replyingTo: CommunityMessage | null;
  onCancelReply: () => void;
  onMessageSent?: (newMessage: CommunityMessage) => void;
  placeholder?: string;
}

export function MessageComposer({
  channelId,
  replyingTo,
  onCancelReply,
  onMessageSent,
  placeholder,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!content.trim() && !imageUrl) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newMsg = await sendMessage(
        channelId,
        content,
        imageUrl,
        replyingTo ? replyingTo.id : null
      );

      setContent('');
      setImageUrl(null);
      if (replyingTo) onCancelReply();
      if (onMessageSent) onMessageSent(newMsg);

      // Re-focus textarea
      textareaRef.current?.focus();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasPayload = content.trim().length > 0 || !!imageUrl;

  return (
    <div className="p-3 sm:p-4 bg-[#0C0C0C] border-t border-white/5 shrink-0">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Reply Indicator Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2 text-neutral-300 truncate">
              <CornerDownRight className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
              <span className="text-neutral-400">En réponse à</span>
              <span className="font-bold text-white">
                {replyingTo.author?.full_name || 'Membre'}
              </span>
              <span className="text-neutral-500 truncate max-w-sm">
                : {replyingTo.content.substring(0, 60)}
              </span>
            </div>

            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 text-neutral-500 hover:text-white transition-colors"
              title="Annuler la réponse"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Image Attachment Preview */}
        {imageUrl && (
          <div className="relative inline-block rounded-xl overflow-hidden border border-white/15 group">
            <img
              src={imageUrl}
              alt="Aperçu"
              className="h-20 w-auto object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:text-red-400 transition-colors"
              title="Supprimer l'image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-[#161616] border border-white/10 focus-within:border-[#39FF14]/40 focus-within:ring-1 focus-within:ring-[#39FF14]/20 rounded-xl px-3 py-2 transition-all">
          {/* Upload Button */}
          <div className="shrink-0">
            <ImageUploader onImageUploaded={(url: string) => setImageUrl(url)} />
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Envoyer un message... (Entrée pour envoyer)'}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 outline-none resize-none max-h-32 py-1 leading-relaxed"
          />

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!hasPayload || isSubmitting}
            className={`p-2 rounded-lg transition-all shrink-0 flex items-center justify-center ${
              hasPayload && !isSubmitting
                ? 'bg-[#39FF14] text-black hover:bg-[#32e012] shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'bg-white/5 text-neutral-600 cursor-not-allowed'
            }`}
            title="Envoyer (Entrée)"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
