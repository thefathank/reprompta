import { useCallback, useState } from "react";
import { Upload, Image, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 bg-background/80" onClick={clear} disabled={disabled}>
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center p-4">
          {preview.type === "image" ? (
            <img src={preview.url} alt="Preview" className="max-h-64 rounded-lg object-contain" />
          ) : (
            <video src={preview.url} controls className="max-h-64 rounded-lg" />
          )}
        </div>
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            {preview.type === "image" ? <Image className="h-4 w-4" /> : <Film className="h-4 w-4" />}
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
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-medium">Drop your media here or click to upload</p>
        <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WEBP, MP4, WEBM — up to 20MB</p>
      </div>
      <input type="file" accept={ALL_TYPES.join(",")} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={disabled} />
    </label>
  );
}
