import { useCallback, useState } from "react";
import { Upload, X, Image, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm"],
};
const ALL_TYPES = [...ACCEPTED.image, ...ACCEPTED.video];

export function MediaUploader({ onFileSelect, disabled }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: "image" | "video"; name: string } | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ALL_TYPES.includes(file.type)) return;
      const type = file.type.startsWith("image") ? "image" : "video";
      setPreview({ url: URL.createObjectURL(file), type, name: file.name });
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="rim-light relative overflow-hidden rounded-md">
        <button
          onClick={clear}
          disabled={disabled}
          className="absolute right-3 top-3 z-10 rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-center p-6">
          {preview.type === "image" ? (
            <img src={preview.url} alt="Preview" className="max-h-56 rounded object-contain" />
          ) : (
            <video src={preview.url} controls className="max-h-56 rounded" />
          )}
        </div>
        <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            {preview.type === "image" ? <Image className="h-3.5 w-3.5" /> : <Film className="h-3.5 w-3.5" />}
            {preview.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed p-16 text-center transition-colors",
        dragOver ? "border-foreground/30 bg-secondary/50" : "border-border hover:border-muted-foreground/40",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Upload className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">Drop media here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP, MP4, WEBM</p>
      </div>
      <input type="file" accept={ALL_TYPES.join(",")} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={disabled} />
    </label>
  );
}
