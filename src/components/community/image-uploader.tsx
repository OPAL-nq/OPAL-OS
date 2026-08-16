'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onCancel?: () => void;
}

export function ImageUploader({ onImageUploaded, onCancel }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).');
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("L'image est trop volumineuse (maximum 8 Mo).");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Vous devez être connecté pour uploader une image.');

      // Local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      // Create unique filename
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('community-images').getPublicUrl(data.path);

      onImageUploaded(publicUrl);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'image");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onCancel) onCancel();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative inline-block rounded-xl overflow-hidden border border-white/20 bg-black/60 p-1">
          <img src={preview} alt="Aperçu upload" className="max-h-24 max-w-xs object-cover rounded-lg" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/80 text-white hover:text-red-400 transition-colors"
            title="Supprimer l'image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#39FF14] animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded-xl text-neutral-400 hover:text-[#39FF14] hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs"
          title="Joindre une image ou capture"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#39FF14]" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
      )}

      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}
