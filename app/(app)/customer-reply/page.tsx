"use client";
import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";

const messageTypes = [
  { value: "inquiry", label: "お問い合わせ" },
  { value: "return", label: "返品・返金" },
  { value: "complaint", label: "クレーム" },
  { value: "review_response", label: "レビュー返信" },
] as const;

export default function CustomerReplyPage() {
  const store = useQuery(api.stores.get);
  const generateReply = useAction(api.ai.generateCustomerReply);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [messageType, setMessageType] = useState("inquiry");

  async function handleGenerate() {
    if (!store || !originalMessage) return;
    setLoading(true);
    const result = await generateReply({
      storeId: store._id,
      originalMessage,
      messageType: messageType as "inquiry" | "return" | "complaint" | "review_response",
    });
    setReply(result);
    setLoading(false);
  }

  function handleCopy() {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          顧客対応文章生成
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          受信メッセージを貼り付けると、AIが返信の下書きを生成します。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">メッセージ種別</Label>
            <Select value={messageType} onValueChange={(v) => { if (v) setMessageType(v); }}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {messageTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">受信メッセージ</Label>
            <Textarea className="text-sm" rows={10}
              placeholder="お客様からのメッセージをここに貼り付けてください"
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} disabled={loading || !originalMessage}
            className="w-full" style={{ background: "var(--accent)", color: "#fff" }}>
            {loading ? "生成中..." : "返信文を生成"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">生成された返信文</Label>
            {reply && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
                <Copy size={12} className="mr-1" />
                {copied ? "コピー済み" : "コピー"}
              </Button>
            )}
          </div>
          <div className="min-h-[280px] rounded border p-4 text-sm whitespace-pre-wrap"
            style={{ borderColor: "var(--border)", color: reply ? "var(--ink-primary)" : "var(--ink-tertiary)", background: "var(--bg-card)" }}>
            {reply ?? "ここに返信文が表示されます"}
          </div>
        </div>
      </div>
    </div>
  );
}
