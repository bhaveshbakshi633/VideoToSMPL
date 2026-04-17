"use client";

import { useCallback, useState } from "react";
import { Upload, Film } from "lucide-react";
import clsx from "clsx";

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onSelect, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onSelect(file);
    },
    [onSelect, disabled],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onSelect(file);
      e.target.value = "";
    },
    [onSelect],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={clsx(
        "relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors",
        dragOver
          ? "border-accent bg-accent/5"
          : "border-border hover:border-border-strong hover:bg-bg-subtle",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/avi"
        onChange={handleInput}
        disabled={disabled}
        className="sr-only"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle">
        {dragOver ? (
          <Film className="h-5 w-5 text-accent" />
        ) : (
          <Upload className="h-5 w-5 text-fg-muted" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drop a video or click to upload</p>
        <p className="mt-1 text-xs text-fg-subtle">MP4 · MOV · WebM · MKV · ≤ 500 MB</p>
      </div>
    </label>
  );
}
