import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";

const rankColors: Record<string, string> = {
  S: "#2d5e3e", A: "#1b3a5b", B: "#8a5a1a", C: "#8b2520",
};
const categoryLabels: Record<string, string> = {
  bag: "バッグ", watch: "時計", jewelry: "ジュエリー", wallet: "財布",
  accessory: "アクセサリー", camera: "カメラ", instrument: "楽器", other: "その他",
};
const statusLabels: Record<string, string> = {
  draft: "下書き", ready: "準備完了", published: "公開中",
};

interface Props {
  item: {
    _id: Id<"items">;
    brand?: string;
    productName?: string;
    category: string;
    conditionRank: string;
    status: string;
    photoUrl?: string;
  };
}

export function ItemCard({ item }: Props) {
  return (
    <Link href={`/items/${item._id}`}>
      <div
        className="rounded-lg border overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
              No image
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>
              {categoryLabels[item.category] ?? item.category}
            </span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ background: rankColors[item.conditionRank] ?? "#ccc", color: "#fff" }}
            >
              {item.conditionRank}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--ink-tertiary)" }}>{item.brand}</p>
          <p className="text-sm font-medium truncate">{item.productName ?? "（未設定）"}</p>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}
          >
            {statusLabels[item.status]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
