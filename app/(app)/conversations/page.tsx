"use client";
import { useRef, useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Mic, Video, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Star, Search } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Feedback = {
  _id: Id<"conversationFeedbacks">;
  fileName: string;
  fileType: "audio" | "video";
  staffName?: string;
  storeName?: string;
  recordedAt?: number;
  status: "analyzing" | "done";
  overallScore?: number;
  goodPoints?: string[];
  improvementPoints?: string[];
  keyMoments?: { time: string; label: "good" | "improve"; note: string }[];
  transcript?: string;
  isFavorite?: boolean;
  createdAt: number;
};

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="w-3 h-3 rounded-full"
          style={{ background: i <= score ? "var(--accent)" : "var(--border)" }} />
      ))}
    </div>
  );
}

function FeedbackCard({ fb, onToggleFav }: { fb: Feedback; onToggleFav: (id: Id<"conversationFeedbacks">) => void }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const metaLine = [
    fb.storeName,
    fb.staffName ? `担当: ${fb.staffName}` : null,
    fb.recordedAt ? `録音日: ${new Date(fb.recordedAt).toLocaleDateString("ja-JP")}` : null,
    `アップロード: ${new Date(fb.createdAt).toLocaleDateString("ja-JP")}`,
  ].filter(Boolean).join(" — ");

  if (fb.status === "analyzing") {
    return (
      <div className="rounded-lg border p-5 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{fb.fileName}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>{metaLine}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(138,90,26,0.1)", color: "var(--warning)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--warning)" }} />
            解析中
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: fb.isFavorite ? "var(--warning)" : "var(--border)" }}>
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {fb.isFavorite && <Star size={13} fill="currentColor" style={{ color: "var(--warning)", flexShrink: 0 }} />}
            <p className="text-sm font-medium truncate">{fb.fileName}</p>
          </div>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{metaLine}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onToggleFav(fb._id)}
            title={fb.isFavorite ? "お気に入り解除" : "お気に入りに追加"}
            className="transition-opacity hover:opacity-70"
          >
            <Star size={16} fill={fb.isFavorite ? "currentColor" : "none"} style={{ color: "var(--warning)" }} />
          </button>
          <div className="text-right space-y-1">
            <ScoreDots score={fb.overallScore ?? 0} />
            <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{fb.overallScore}/5</p>
          </div>
        </div>
      </div>

      {fb.keyMoments && fb.keyMoments.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--ink-secondary)" }}>キーモーメント</p>
          <div className="space-y-1.5">
            {fb.keyMoments.map((km, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: "var(--ink-tertiary)" }}>{km.time}</span>
                {km.label === "good"
                  ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                  : <AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />}
                <span className="text-xs" style={{ color: "var(--ink-secondary)" }}>{km.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 space-y-2" style={{ borderRight: "1px solid var(--border)" }}>
          <p className="text-xs font-medium" style={{ color: "var(--success)" }}>良かった点</p>
          <ul className="space-y-1.5">
            {(fb.goodPoints ?? []).map((pt, i) => (
              <li key={i} className="flex gap-1.5 text-xs" style={{ color: "var(--ink-secondary)" }}>
                <span className="flex-shrink-0" style={{ color: "var(--success)" }}>✓</span>{pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--warning)" }}>改善ポイント</p>
          <ul className="space-y-1.5">
            {(fb.improvementPoints ?? []).map((pt, i) => (
              <li key={i} className="flex gap-1.5 text-xs" style={{ color: "var(--ink-secondary)" }}>
                <span className="flex-shrink-0" style={{ color: "var(--warning)" }}>→</span>{pt}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {fb.transcript && (
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setShowTranscript((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs hover:bg-gray-50 transition-colors"
            style={{ color: "var(--ink-secondary)" }}>
            <span>文字起こし{showTranscript ? "を閉じる" : "を表示"}</span>
            {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showTranscript && (
            <div className="px-5 pb-5">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap p-4 rounded"
                style={{ background: "var(--bg-primary)", color: "var(--ink-secondary)", fontFamily: "inherit" }}>
                {fb.transcript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConversationsPage() {
  const store = useQuery(api.stores.get);
  const feedbacks = useQuery(api.conversationFeedbacks.list, store ? { storeId: store._id } : "skip");
  const createFeedback = useMutation(api.conversationFeedbacks.create);
  const toggleFavorite = useMutation(api.conversationFeedbacks.toggleFavorite);
  const analyzeConversation = useAction(api.ai.analyzeConversation);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ staffName: "", storeName: "", recordedAt: "" });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterFav, setFilterFav] = useState(false);
  const [searchStaff, setSearchStaff] = useState("");

  function handleFileSelect(file: File) { setSelectedFile(file); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!selectedFile || !store) return;
    setUploading(true);
    const fileType = selectedFile.type.startsWith("video") ? "video" : "audio";
    const feedbackId = await createFeedback({
      storeId: store._id,
      fileName: selectedFile.name,
      fileType,
      staffName: form.staffName || undefined,
      storeName: form.storeName || undefined,
      recordedAt: form.recordedAt ? new Date(form.recordedAt).getTime() : undefined,
    });
    setSelectedFile(null);
    setForm({ staffName: "", storeName: "", recordedAt: "" });
    setUploading(false);
    analyzeConversation({ feedbackId });
  }

  const filtered = (feedbacks ?? []).filter((fb) => {
    if (filterFav && !fb.isFavorite) return false;
    if (searchStaff && !(fb.staffName ?? "").includes(searchStaff)) return false;
    return true;
  });

  const favCount = (feedbacks ?? []).filter((f) => f.isFavorite).length;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>会話分析</h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          接客時の音声・動画をアップロードしてAIが接客品質をフィードバックします。
        </p>
      </div>

      {/* アップロード */}
      <div className="rounded-lg border p-6 space-y-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <p className="text-sm font-medium">音声・動画をアップロード</p>
        <div
          className="rounded border-2 border-dashed flex flex-col items-center justify-center py-8 cursor-pointer transition-colors"
          style={{ borderColor: dragging ? "var(--accent)" : "var(--border)", background: dragging ? "rgba(27,58,91,0.04)" : "var(--bg-primary)" }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="text-center space-y-1">
              {selectedFile.type.startsWith("video")
                ? <Video size={24} style={{ color: "var(--accent)", margin: "0 auto" }} />
                : <Mic size={24} style={{ color: "var(--accent)", margin: "0 auto" }} />}
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{(selectedFile.size/1024/1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <Upload size={20} style={{ color: "var(--ink-tertiary)", margin: "0 auto" }} />
              <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>ドラッグ＆ドロップ、またはクリックして選択</p>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>MP3 / WAV / M4A / MP4 / MOV</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">録音日</Label>
            <Input type="date" className="text-sm" value={form.recordedAt} onChange={(e) => setForm((p) => ({ ...p, recordedAt: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">店舗名</Label>
            <Input className="text-sm" placeholder="例: 渋谷店" value={form.storeName} onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">担当者名</Label>
            <Input className="text-sm" placeholder="例: 田中" value={form.staffName} onChange={(e) => setForm((p) => ({ ...p, staffName: e.target.value }))} />
          </div>
        </div>

        <Button onClick={handleUpload} disabled={!selectedFile || uploading || !store} className="w-full"
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
          {uploading ? "アップロード中..." : "アップロードして解析する"}
        </Button>
        <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
          ※ プロトタイプのため実ファイルはアップロードされません。モックの解析結果を返します。
        </p>
      </div>

      {/* 履歴フィルター */}
      {feedbacks && feedbacks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium" style={{ color: "var(--ink-secondary)" }}>
              解析履歴 ({feedbacks.length}件)
            </p>
            <button
              onClick={() => setFilterFav((v) => !v)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: filterFav ? "var(--warning)" : "var(--border)",
                color: filterFav ? "var(--warning)" : "var(--ink-tertiary)",
                background: filterFav ? "rgba(138,90,26,0.08)" : "transparent",
              }}
            >
              <Star size={11} fill={filterFav ? "currentColor" : "none"} />
              お気に入り ({favCount})
            </button>
            <div className="relative ml-auto">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-tertiary)" }} />
              <Input className="text-xs pl-7 h-7 w-36" placeholder="担当者で絞込"
                value={searchStaff} onChange={(e) => setSearchStaff(e.target.value)} />
            </div>
          </div>

          {filtered.map((fb) => (
            <FeedbackCard key={fb._id} fb={fb as Feedback}
              onToggleFav={(id) => toggleFavorite({ id })} />
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "var(--ink-tertiary)" }}>
              条件に一致する履歴がありません
            </p>
          )}
        </div>
      )}

      {feedbacks?.length === 0 && (
        <div className="text-center py-12" style={{ color: "var(--ink-tertiary)" }}>
          <Mic size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
          <p className="text-sm">まだ解析履歴がありません</p>
        </div>
      )}
    </div>
  );
}
