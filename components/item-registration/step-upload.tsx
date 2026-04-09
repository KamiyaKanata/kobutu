"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props {
  onNext: (files: File[]) => void;
}

export function StepUpload({ onNext }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 10);
    setFiles(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
          商品写真をアップロード
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          JPEG / PNG / WebP（最大10枚、1枚あたり10MB以内）
        </p>
      </div>

      <label
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 cursor-pointer transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border)" }}
      >
        <Upload size={32} style={{ color: "var(--ink-tertiary)" }} />
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--ink-secondary)" }}>
          ここに写真をドロップ、またはクリックして選択
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-20 h-20 object-cover rounded border"
              style={{ borderColor: "var(--border)" }}
            />
          ))}
        </div>
      )}

      <Button
        onClick={() => onNext(files)}
        disabled={files.length === 0}
        style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
      >
        次へ: AIで解析する
      </Button>
    </div>
  );
}
