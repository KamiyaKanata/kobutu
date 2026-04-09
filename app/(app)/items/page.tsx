"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ItemsPage() {
  const store = useQuery(api.stores.get);
  const items = useQuery(
    api.items.list,
    store ? { storeId: store._id } : "skip"
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          商品一覧
        </h2>
        <Link href="/items/new">
          <Button style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
            <Plus size={16} className="mr-1" />
            商品を登録
          </Button>
        </Link>
      </div>

      {items === undefined ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border aspect-square animate-pulse" style={{ background: "var(--border)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--ink-tertiary)" }}>
          <p className="text-sm">商品がありません</p>
          <Link href="/items/new">
            <Button className="mt-4" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
              最初の商品を登録する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item as any} />
          ))}
        </div>
      )}
    </div>
  );
}
