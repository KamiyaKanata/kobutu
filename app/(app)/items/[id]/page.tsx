"use client";
import { use } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const rankColors: Record<string, string> = {
  S: "#2d5e3e", A: "#1b3a5b", B: "#8a5a1a", C: "#8b2520",
};
const statusLabels: Record<string, string> = {
  draft: "下書き", ready: "準備完了", published: "公開中",
};

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = useQuery(api.items.get, { itemId: id as Id<"items"> });

  if (item === undefined) {
    return <div className="animate-pulse h-96 rounded-lg" style={{ background: "var(--border)" }} />;
  }
  if (item === null) {
    return <p style={{ color: "var(--ink-secondary)" }}>商品が見つかりません</p>;
  }

  const photo = item.photos?.[0];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/items">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-2 space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {photo?.photoUrl ? (
              <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
                No image
              </div>
            )}
          </div>
          <Link href={`/items/${id}/channels`}>
            <Button className="w-full" variant="outline" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              <ExternalLink size={14} className="mr-1" />
              販売チャネル展開
            </Button>
          </Link>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{ background: "transparent", border: `1px solid ${rankColors[item.conditionRank] ?? "#ccc"}`, color: rankColors[item.conditionRank] ?? "#ccc" }}
            >
              {item.conditionRank}ランク
            </span>
            <Badge variant="outline" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
              {statusLabels[item.status]}
            </Badge>
          </div>

          <div>
            <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>{item.brand}</p>
            <h2 className="text-xl font-medium mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
              {item.productName ?? "（商品名未設定）"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {([["色", item.color], ["素材", item.material]] as [string, string | undefined][]).map(
              ([label, value]) =>
                value ? (
                  <div key={label}>
                    <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ) : null
            )}
          </div>

          {item.conditionNote && (
            <div className="p-3 rounded border text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
              {item.conditionNote}
            </div>
          )}

          {item.descriptionEc && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--ink-tertiary)" }}>販売説明文</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {item.descriptionEc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
