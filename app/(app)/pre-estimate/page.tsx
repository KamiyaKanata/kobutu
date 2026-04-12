"use client";
import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";

type Reasoning = { label: string; detail: string };
type Result = { min: number; max: number; note: string; reasoning: Reasoning[] };

export default function PreEstimatePage() {
  const store = useQuery(api.stores.get);
  const estimate = useAction(api.ai.estimatePrice);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    itemCategory: "",
    selfReportedCondition: "",
  });

  async function handleSubmit() {
    if (!store || !form.itemCategory || !form.selfReportedCondition) return;
    setLoading(true);
    const res = await estimate({ storeId: store._id, ...form });
    setResult(res as Result);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>事前査定</h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          品目・状態を入力するとAIが概算査定額と根拠を提示します。
        </p>
      </div>

      {!result ? (
        <div className="rounded-lg border p-6 space-y-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">お名前（任意）</Label>
              <Input className="text-sm" value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">連絡先（任意）</Label>
              <Input className="text-sm" value={form.customerContact} onChange={(e) => setForm((p) => ({ ...p, customerContact: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">品目カテゴリ</Label>
            <Select onValueChange={(v: string | null) => setForm((p) => ({ ...p, itemCategory: v ?? p.itemCategory }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="選択してください" /></SelectTrigger>
              <SelectContent>
                {[["bag","バッグ"],["watch","時計"],["jewelry","ジュエリー"],["wallet","財布"],["camera","カメラ"],["other","その他"]].map(([v,l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">状態・特徴（自己申告）</Label>
            <Textarea className="text-sm" rows={3}
              placeholder="例: ほぼ未使用。箱・保証書あり。傷なし。ブランドはシャネル。"
              value={form.selfReportedCondition}
              onChange={(e) => setForm((p) => ({ ...p, selfReportedCondition: e.target.value }))} />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !form.itemCategory || !form.selfReportedCondition}
            className="w-full" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
            {loading ? "査定中..." : "AIに査定してもらう"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 査定額 */}
          <div className="rounded-lg border p-6 text-center space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>概算買取価格</p>
            <p className="text-4xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
              {result.min.toLocaleString()}円 〜 {result.max.toLocaleString()}円
            </p>
            <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
              ※ 実物確認後に正式査定額をご提示します
            </p>
          </div>

          {/* 根拠の内訳 */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>査定根拠の内訳</p>
            </div>
            {result.reasoning.map(({ label, detail }, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
                <ChevronRight size={12} style={{ color: "var(--ink-tertiary)", flexShrink: 0 }} />
                <span className="text-xs font-medium w-32 flex-shrink-0">{label}</span>
                <span className="text-xs" style={{ color: "var(--ink-secondary)" }}>{detail}</span>
              </div>
            ))}
          </div>

          <div className="rounded border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
            <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>{result.note}</p>
          </div>

          <Button onClick={() => setResult(null)} variant="outline" style={{ borderColor: "var(--border)" }}>
            もう一度査定する
          </Button>
        </div>
      )}
    </div>
  );
}
