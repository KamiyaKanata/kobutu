"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Package, BookOpen, AlertCircle, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const store = useQuery(api.stores.get);
  const stats = useQuery(api.items.dashboardStats, store ? { storeId: store._id } : "skip");
  const preEstimates = useQuery(api.preEstimates.list, store ? { storeId: store._id } : "skip");
  const seed = useMutation(api.seed.run);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const pendingEstimates = (preEstimates ?? []).filter((e) => e.status === "pending");
  const aiRegistered = stats?.total ?? 0;
  const estimatedMinutes = aiRegistered * 17;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
            ダッシュボード
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
            {store?.name ?? "読み込み中..."}
          </p>
        </div>
        {!seeded && (
          <Button
            onClick={async () => { setSeeding(true); await seed({}); setSeeding(false); setSeeded(true); }}
            disabled={seeding}
            variant="outline"
            style={{ borderColor: "var(--border)", color: "var(--ink-secondary)", fontSize: "12px" }}
          >
            {seeding ? "投入中..." : "デモデータを投入"}
          </Button>
        )}
      </div>

      {/* パイプラインサマリー */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-tertiary)" }}>商品パイプライン</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "下書き（未解析）", value: stats?.draft ?? "—", sublabel: "写真待ち・解析待ち", color: "var(--ink-tertiary)" },
            { label: "AI解析済み", value: stats?.ready ?? "—", sublabel: "チャネル展開待ち", color: "var(--warning)" },
            { label: "展開済み", value: stats?.published ?? "—", sublabel: "EC・SNS掲載中", color: "var(--success)" },
            { label: "展開率", value: stats ? `${stats.deployRate}%` : "—", sublabel: "全商品中の掲載割合", color: "var(--accent)" },
          ].map(({ label, value, sublabel, color }) => (
            <div key={label} className="rounded-lg border p-4 space-y-1" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-2xl font-medium" style={{ color, fontFamily: "var(--font-display)" }}>{value}</p>
              <p className="text-xs font-medium" style={{ color: "var(--ink-primary)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 要対応リスト */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-tertiary)" }}>要対応アイテム</p>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {stats && stats.noChannel > 0 && (
            <ActionRow
              priority="high"
              icon={<Package size={14} />}
              text={`チャネル未展開の商品が ${stats.noChannel} 件あります`}
              sub="AI解析済みなのに販売テキストが未生成です"
              href="/items"
            />
          )}
          {stats && stats.noBrand > 0 && (
            <ActionRow
              priority="medium"
              icon={<Package size={14} />}
              text={`ブランド未判定の商品が ${stats.noBrand} 件あります`}
              sub="AI解析を実行してブランドを特定してください"
              href="/items"
            />
          )}
          {pendingEstimates.length > 0 && (
            <ActionRow
              priority="high"
              icon={<AlertCircle size={14} />}
              text={`未返信の事前査定が ${pendingEstimates.length} 件あります`}
              sub="お客様からの査定リクエストに対応してください"
              href="/pre-estimate"
            />
          )}
          {(!stats || (stats.noChannel === 0 && stats.noBrand === 0)) && pendingEstimates.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-4">
              <CheckCircle size={14} style={{ color: "var(--success)" }} />
              <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>現在対応が必要なアイテムはありません</p>
            </div>
          )}
        </div>
      </div>

      {/* AI活用スコア */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-tertiary)" }}>AI活用状況（今月）</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-4 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <Sparkles size={16} style={{ color: "var(--accent)" }} />
            <p className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
              {aiRegistered}件
            </p>
            <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>AI商品登録</p>
          </div>
          <div className="rounded-lg border p-4 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <BookOpen size={16} style={{ color: "var(--accent)" }} />
            <p className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
              {estimatedMinutes}分
            </p>
            <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>推定削減時間（1件17分換算）</p>
          </div>
          <div className="rounded-lg border p-4 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <Package size={16} style={{ color: "var(--accent)" }} />
            <p className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
              {(stats?.total ?? 0) * 4}件
            </p>
            <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>チャネルテキスト自動生成</p>
          </div>
        </div>
      </div>

      {/* クイックリンク */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/items/new", label: "商品を登録", sub: "写真からAI解析" },
          { href: "/ledger/new", label: "台帳に記録", sub: "本人確認・OCR入力" },
          { href: "/conversations", label: "会話を分析", sub: "接客品質フィードバック" },
        ].map(({ href, label, sub }) => (
          <Link key={href} href={href}>
            <div className="rounded-lg border p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>{sub}</p>
              </div>
              <ArrowRight size={14} style={{ color: "var(--ink-tertiary)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActionRow({ priority, icon, text, sub, href }: {
  priority: "high" | "medium";
  icon: React.ReactNode;
  text: string;
  sub: string;
  href: string;
}) {
  const color = priority === "high" ? "var(--danger)" : "var(--warning)";
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div style={{ color }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{text}</p>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{sub}</p>
        </div>
        <ArrowRight size={14} style={{ color: "var(--ink-tertiary)" }} />
      </div>
    </Link>
  );
}
