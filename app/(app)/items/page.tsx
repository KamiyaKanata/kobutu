"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";

const categories = [
  { value: "all", label: "すべて" },
  { value: "bag", label: "バッグ" },
  { value: "watch", label: "時計" },
  { value: "jewelry", label: "ジュエリー" },
  { value: "wallet", label: "財布" },
  { value: "camera", label: "カメラ" },
  { value: "accessory", label: "アクセサリー" },
  { value: "instrument", label: "楽器" },
  { value: "other", label: "その他" },
];

export default function ItemsPage() {
  const store = useQuery(api.stores.get);
  const items = useQuery(api.items.list, store ? { storeId: store._id } : "skip");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");

  const brands = useMemo(() => {
    if (!items) return [];
    const set = new Set(items.map((i) => i.brand).filter(Boolean) as string[]);
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const catMatch = activeCategory === "all" || item.category === activeCategory;
      const brandMatch = activeBrand === "all" || item.brand === activeBrand;
      return catMatch && brandMatch;
    });
  }, [items, activeCategory, activeBrand]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>商品一覧</h2>
        <Link href="/items/new">
          <Button style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
            <Plus size={16} className="mr-1" />商品を登録
          </Button>
        </Link>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className="text-xs px-3 py-1.5 rounded-full border transition-colors"
            style={{
              borderColor: activeCategory === value ? "var(--accent)" : "var(--border)",
              background: activeCategory === value ? "rgba(27,58,91,0.08)" : "var(--bg-card)",
              color: activeCategory === value ? "var(--accent)" : "var(--ink-secondary)",
              fontWeight: activeCategory === value ? 500 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ブランドフィルター */}
      {brands.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs self-center mr-1" style={{ color: "var(--ink-tertiary)" }}>ブランド:</span>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className="text-xs px-3 py-1 rounded border transition-colors"
              style={{
                borderColor: activeBrand === brand ? "var(--accent)" : "var(--border)",
                background: activeBrand === brand ? "rgba(27,58,91,0.06)" : "transparent",
                color: activeBrand === brand ? "var(--accent)" : "var(--ink-secondary)",
              }}
            >
              {brand === "all" ? "すべて" : brand}
            </button>
          ))}
        </div>
      )}

      {/* 件数 */}
      {items && (
        <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
          {filtered.length}件{(activeCategory !== "all" || activeBrand !== "all") ? `（全${items.length}件中）` : ""}
        </p>
      )}

      {/* グリッド */}
      {items === undefined ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border aspect-square animate-pulse" style={{ background: "var(--border)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--ink-tertiary)" }}>
          <p className="text-sm">
            {items.length === 0 ? "商品がありません" : "条件に一致する商品がありません"}
          </p>
          {items.length === 0 && (
            <Link href="/items/new">
              <Button className="mt-4" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                最初の商品を登録する
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item as any} />
          ))}
        </div>
      )}
    </div>
  );
}
