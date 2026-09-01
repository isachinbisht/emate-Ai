'use client';

import React, { useEffect } from 'react';
import { Download, Maximize2, RefreshCw, X, Loader2 } from 'lucide-react';
import type { GeneratedImage } from '@/lib/chatHistory';
import { ImageGeneration } from '@/components/ui/ai-chat-image-generation-1';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  theme?: 'light' | 'dark';
  /** Re-run generation for this image. Called with (imageId, prompt). */
  onRegenerate?: (imageId: string, prompt: string) => void;
}

/**
 * A generated-image response card. Renders the loader while `generating`,
 * the image (with download / lightbox-zoom / regenerate overlay) when `done`,
 * and an inline error with Retry when `error`.
 */
export default function GeneratedImageCard({
  image,
  theme = 'dark',
  onRegenerate,
}: GeneratedImageCardProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const isDark = theme === 'dark';

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const handleDownload = () => {
    if (!image.url) return;
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `e-mate-${image.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (image.status === 'generating') {
    return (
      <ImageGeneration>
        <div className="w-full aspect-video flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <Loader2
            className="animate-spin"
            style={{ color: isDark ? '#8aa2ff' : '#1f51ff' }}
            size={28}
          />
        </div>
      </ImageGeneration>
    );
  }

  if (image.status === 'error') {
    return (
      <div
        className="max-w-md my-2 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 text-sm"
        style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}
      >
        <p className="font-medium mb-1">Image generation failed</p>
        <p className="text-xs mb-3 opacity-80">
          This can happen if the provider is busy or the prompt was rejected.
        </p>
        {onRegenerate && (
          <button
            type="button"
            onClick={() => onRegenerate(image.id, image.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer bg-red-600 text-white hover:bg-red-700"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    );
  }

  // done
  return (
    <>
      <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-md my-2 shadow-sm">
        <img
          src={image.url}
          alt={image.prompt}
          className="w-full h-auto object-cover block cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        />

        {/* Hover action overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            title="Download image"
            aria-label="Download image"
            className="h-8 w-8 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            title="Zoom image"
            aria-label="Zoom image"
            className="h-8 w-8 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <Maximize2 size={15} />
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(image.id, image.prompt)}
              title="Regenerate image"
              aria-label="Regenerate image"
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image"
            className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div
            className="max-w-4xl w-full max-h-[85vh] overflow-auto flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
            <p className="text-sm text-zinc-300 max-w-md text-center">{image.prompt}</p>
          </div>
        </div>
      )}
    </>
  );
}

// Download / zoom / regenerate button class used by the overlay.
GeneratedImageCard.displayName = 'GeneratedImageCard';
