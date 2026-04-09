"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const store = useQuery(api.stores.get);
  const seed = useMutation(api.seed.run);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    await seed({});
    setSeeding(false);
    setSeeded(true);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          ダッシュボード
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          {store?.name ?? "読み込み中..."}
        </p>
      </div>

      {!seeded && (
        <Card style={{ borderColor: "var(--border)" }}>
          <CardHeader>
            <CardTitle className="text-base">デモデータを投入する</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
              商品5件・古物台帳3件のサンプルデータを投入します。
            </p>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
            >
              {seeding ? "投入中..." : "シードデータを投入"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>商品管理</p>
                <Link href="/items" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  一覧を見る →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>古物台帳</p>
                <Link href="/ledger" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  一覧を見る →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>新規登録</p>
                <Link href="/items/new" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  商品を登録 →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
