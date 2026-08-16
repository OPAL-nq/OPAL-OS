'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X, Check, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ScreenshotUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function ScreenshotUploader({ value, onChange }: ScreenshotUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).');
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'guest';
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${userId}/${Date.now()}_trade.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setUrlInput(publicUrl);
    } catch (err: any) {
      console.error('Error uploading screenshot:', err);
      alert('Erreur lors du téléversement : ' + (err.message || 'Échec'));
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab switch between file upload & direct URL */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-300">
          Capture d'écran du Trade
        </label>
        <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/10 text-[11px]">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              tab === 'upload' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Fichier
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              tab === 'url' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Lien URL
          </button>
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name="screenshot_url" value={value} />

      {value ? (
        /* Image Preview Box */
        <div className="relative rounded-xl border border-white/10 bg-black/60 p-3 overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#39FF14] flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5" />
              Capture attachée
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Supprimer
            </Button>
          </div>

          <div className="relative w-full max-h-48 rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            <img
              src={value}
              alt="Capture Trade"
              className="w-full h-auto max-h-48 object-contain"
            />
          </div>
        </div>
      ) : tab === 'upload' ? (
        /* Drag & Drop / File select upload */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-white/15 hover:border-[#39FF14]/50 rounded-xl p-5 text-center transition-all bg-black/30 hover:bg-[#39FF14]/5 space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-10 h-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-neutral-300">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-[#39FF14]" />
            )}
          </div>
          <div className="text-xs font-medium text-white">
            {uploading ? 'Téléversement en cours...' : 'Cliquez pour importer votre capture d’écran'}
          </div>
          <p className="text-[11px] text-neutral-500">
            PNG, JPG, WebP jusqu’à 10 Mo
          </p>
        </div>
      ) : (
        /* URL Input */
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <LinkIcon className="w-3.5 h-3.5" />
            </span>
            <Input
              type="url"
              placeholder="https://www.tradingview.com/x/... ou https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-black/50 border-white/10 pl-8 text-xs text-white"
            />
          </div>
          <Button
            type="button"
            onClick={handleUrlSubmit}
            size="sm"
            className="bg-white text-black hover:bg-neutral-200 text-xs font-bold"
          >
            Valider
          </Button>
        </div>
      )}
    </div>
  );
}
