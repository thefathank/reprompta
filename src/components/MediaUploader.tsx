import { useCallback, useState } from "react";
import { Upload, X, Image, Film, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { compressImageIfNeeded } from "@/lib/compress";

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptVideo?: boolean;
}

const ACCEPTED = {
  image: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm"],
};
const ALL_TYPES = [...ACCEPTED.image, ...ACCEPTED.video];
const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_DURATION_S = 30;

function checkVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video metadata"));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function MediaUploader({ onFileSelect, disabled, acceptVideo = true }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkingLabel, setCheckingLabel] = useState("Checking video…");
  const [preview, setPreview] = useState<{ url: string; type: "image" | "video"; name: string } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
    const allowed = acceptVideo ? ALL_TYPES : ACCEPTED.image;
    if (!allowed.includes(file.type)) {
      if (!acceptVideo && ACCEPTED.video.includes(file.type)) {
        toast({ title: "Video not available", description: "Upgrade your plan to analyze videos.", variant: "destructive" });
      }
      return;
    }
      if (file.size > MAX_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${MAX_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
          variant: "destructive",
        });
        return;
      }
      const type = file.type.startsWith("image") ? "image" : "video";
      if (type === "video") {
        setCheckingLabel("Checking video…");
        setChecking(true);
        try {
          const duration = await checkVideoDuration(file);
          if (duration > MAX_VIDEO_DURATION_S) {
            toast({
              title: "Video too long",
              description: `Maximum duration is ${MAX_VIDEO_DURATION_S}s. Your video is ${Math.round(duration)}s.`,
              variant: "destructive",
            });
            setChecking(false);
            return;
          }
        } catch {
          // If we can't read metadata, allow it through
        } finally {
          setChecking(false);
        }
      }
      let finalFile: File = file;
      if (type === "image") {
        setCheckingLabel("Optimizing image…");
        setChecking(true);
        try {
          finalFile = await compressImageIfNeeded(file);
        } finally {
          setChecking(false);
        }
      }
      setPreview({ url: URL.createObjectURL(finalFile), type, name: finalFile.name });
      onFileSelect(finalFile);
    },
    [onFileSelect, acceptVideo]
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
        (disabled || checking) && "pointer-events-none opacity-50"
      )}
    >
      {checking ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{checkingLabel}</p>
        </>
      ) : (
        <>
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Drop media here or click to upload</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {acceptVideo ? "JPG, PNG, WEBP, MP4, WEBM · Max 20MB · Videos ≤ 30s" : "JPG, PNG, WEBP · Max 20MB"}
            </p>
          </div>
        </>
      )}
      <input type="file" accept={(acceptVideo ? ALL_TYPES : ACCEPTED.image).join(",")} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={disabled || checking} />
    </label>
  );
}
