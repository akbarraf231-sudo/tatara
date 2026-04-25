"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Folder dalam bucket, e.g. "products" */
  folder?: string;
};

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUpload({ value, onChange, folder = "products" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPT.includes(file.type)) {
      setError("Format harus JPG, PNG, WEBP, atau GIF");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran maksimal 5 MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengunggah";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Paste image from clipboard
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      // Hanya proses paste kalau widget ini focus/aktif (dropRef contains the element)
      if (!dropRef.current?.contains(document.activeElement) && document.activeElement !== document.body) {
        // Always allow paste when on the page — accept it
      }
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      if (!item) return;
      const file = item.getAsFile();
      if (file && dropRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        handleFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        ref={dropRef}
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-rose-700/30 ${
          isDragging
            ? "border-rose-500 bg-rose-50"
            : "border-stone-300 bg-stone-50 hover:border-stone-400"
        }`}
      >
        {value ? (
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={value}
                alt="Preview"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs text-stone-600">{value}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="mt-1 text-xs text-rose-700 hover:underline"
              >
                Hapus foto
              </button>
            </div>
            <span className="text-xs text-stone-400">Klik untuk ganti</span>
          </div>
        ) : uploading ? (
          <p className="py-3 text-sm text-stone-500">Mengunggah...</p>
        ) : (
          <div className="py-3">
            <p className="text-2xl">📷</p>
            <p className="mt-1 text-sm font-medium text-stone-700">
              Klik, drag &amp; drop, atau paste foto
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              JPG, PNG, WEBP, max 5 MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // reset so the same file can be re-selected
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
