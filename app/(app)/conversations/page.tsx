"use client";
import { useRef, useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Mic, Video, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Feedback = {
  _id: Id<"conversationFeedbacks">;
  fileName: string;
  fileType: "audio" | "video";
  staffName?: string;
  status: "analyzing" | "done";
  overallScore?: number;
  goodPoints?: string[];
  improvementPoints?: string[];
  keyMoments?: { time: string; label: "good" | "improve"; note: string }[];
  transcript?: string;
  createdAt: number;
};

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{ background: i <= score ? "var(--accent)" : "var(--border)" }}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ fb }: { fb: Feedback }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (fb.status === "analyzing") {
    return (
      <div className="rounded-lg border p-5 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{fb.fileName}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>
              {fb.staffName ? `担当: ${fb.staffName} — ` : ""}{new Date(fb.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(138,90,26,0.1)", color: "var(--warning)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--warning)" }} />
            解析中
          </span>
        </div>
        <div className="flex gap-1 pt-1">
          {["音声を文字起こし中…", "会話を分析中…", "フィードバックを生成中…"].map((msg, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-primary)", color: "var(--ink-tertiary)" }}>
              {msg}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      {/* ヘッダー */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{fb.fileName}</p>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            {fb.staffName ? `担当: ${fb.staffName} — ` : ""}{new Date(fb.createdAt).toLocaleString("ja-JP")}
          </p>
        </div>
        <div className="text-right space-y-1 flex-shrink-0">
          <div className="flex justify-end">
            <ScoreDots score={fb.overallScore ?? 0} />
          </div>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            総合スコア {fb.overallScore}/5
          </p>
        </div>
      </div>

      {/* キーモーメント */}
      {fb.keyMoments && fb.keyMoments.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--ink-secondary)" }}>キーモーメント</p>
          <div className="space-y-1.5">
            {fb.keyMoments.map((km, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: "var(--ink-tertiary)" }}>
                  {km.time}
                </span>
                {km.label === "good" ? (
                  <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
                ) : (
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
                )}
                <span className="text-xs" style={{ color: "var(--ink-secondary)" }}>{km.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good / Improve */}
      <div className="grid grid-cols-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 space-y-2" style={{ borderRight: `1px solid var(--border)` }}>
          <p className="text-xs font-medium" style={{ color: "var(--success)" }}>良かった点</p>
          <ul className="space-y-1.5">
            {(fb.goodPoints ?? []).map((pt, i) => (
              <li key={i} className="flex gap-1.5 text-xs" style={{ color: "var(--ink-secondary)" }}>
                <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }}>✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--warning)" }}>改善ポイント</p>
          <ul className="space-y-1.5">
            {(fb.improvementPoints ?? []).map((pt, i) => (
              <li key={i} className="flex gap-1.5 text-xs" style={{ color: "var(--ink-secondary)" }}>
                <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }}>→</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 文字起こし（折りたたみ） */}
      {fb.transcript && (
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs hover:bg-gray-50 transition-colors"
            style={{ color: "var(--ink-secondary)" }}
          >
            <span>文字起こしを{showTranscript ? "閉じる" : "表示する"}</span>
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
  const feedbacks = useQuery(
    api.conversationFeedbacks.list,
    store ? { storeId: store._id } : "skip"
  );
  const createFeedback = useMutation(api.conversationFeedbacks.create);
  const analyzeConversation = useAction(api.ai.analyzeConversation);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileSelect(file: File) {
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
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
      staffName: staffName || undefined,
    });

    setSelectedFile(null);
    setStaffName("");
    setUploading(false);

    // バックグラウンドで解析（awaitしない）
    analyzeConversation({ feedbackId });
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          会話分析
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          接客時の音声・動画をアップロードすると、AIが会話を文字起こしして接客品質をフィードバックします。
        </p>
      </div>

      {/* アップロードエリア */}
      <div className="rounded-lg border p-6 space-y-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <p className="text-sm font-medium">音声・動画をアップロード</p>

        <div
          className="rounded border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? "var(--accent)" : "var(--border)",
            background: dragging ? "rgba(27,58,91,0.04)" : "var(--bg-primary)",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="text-center space-y-2">
              {selectedFile.type.startsWith("video") ? (
                <Video size={28} style={{ color: "var(--accent)", margin: "0 auto" }} />
              ) : (
                <Mic size={28} style={{ color: "var(--accent)", margin: "0 auto" }} />
              )}
              <p className="text-sm font-medium" style={{ color: "var(--ink-primary)" }}>{selectedFile.name}</p>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Upload size={24} style={{ color: "var(--ink-tertiary)", margin: "0 auto" }} />
              <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
                ファイルをドラッグ＆ドロップ、またはクリックして選択
              </p>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
                対応形式: MP3, WAV, M4A, MP4, MOV, WebM
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">担当スタッフ名（任意）</Label>
          <Input
            className="text-sm"
            placeholder="例: 田中"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !store}
          className="w-full"
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
        >
          {uploading ? "アップロード中..." : "アップロードして解析する"}
        </Button>

        <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
          ※ プロトタイプのため実際のファイルはアップロードされません。モックの解析結果を返します。
        </p>
      </div>

      {/* 履歴 */}
      {feedbacks && feedbacks.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium" style={{ color: "var(--ink-secondary)" }}>
            解析履歴 ({feedbacks.length}件)
          </p>
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb._id} fb={fb as Feedback} />
          ))}
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
