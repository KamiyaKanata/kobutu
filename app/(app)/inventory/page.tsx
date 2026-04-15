"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, TrendingUp, Package, AlertTriangle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const categories = [
  { value: "fashion", label: "ファッション", subs: ["レディーストップス", "メンズトップス", "アウター", "ボトムス", "ワンピース", "バッグ", "シューズ", "アクセサリー"] },
  { value: "hobby", label: "ホビー・雑貨", subs: ["フィギュア", "カード", "ゲーム", "カメラ", "楽器", "雑貨"] },
  { value: "kimono", label: "着物・帯", subs: ["振袖", "訪問着", "小紋", "帯", "羽織", "小物"] },
  { value: "luxury", label: "ブランド品", subs: ["バッグ", "財布", "時計", "ジュエリー", "スカーフ"] },
];

type Lot = {
  _id: Id<"inventoryLots">;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  totalQuantity: number;
  soldQuantity: number;
  purchaseDate: number;
  unitCost?: number;
  unitPrice?: number;
  note?: string;
};

function turnoverColor(rate: number) {
  if (rate >= 0.8) return "var(--success)";
  if (rate >= 0.5) return "var(--warning)";
  return "var(--danger)";
}

function LotCard({ lot, onUpdateSold }: { lot: Lot; onUpdateSold: (id: Id<"inventoryLots">, qty: number) => void }) {
  const remaining = lot.totalQuantity - lot.soldQuantity;
  const turnover = lot.totalQuantity > 0 ? lot.soldQuantity / lot.totalQuantity : 0;
  const grossProfit = lot.unitCost && lot.unitPrice
    ? ((lot.unitPrice - lot.unitCost) / lot.unitCost * 100).toFixed(0)
    : null;
  const [editing, setEditing] = useState(false);
  const [soldInput, setSoldInput] = useState(String(lot.soldQuantity));

  const catLabel = categories.find((c) => c.value === lot.category)?.label ?? lot.category;

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      {/* ヘッダー */}
      <div className="px-4 pt-4 pb-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{lot.name}</p>
          {remaining === 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "#dcfce7", color: "#166534" }}>完売</span>
          )}
          {remaining > 0 && turnover < 0.3 && (
            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-1" style={{ background: "#fef3c7", color: "#92400e" }}>
              <AlertTriangle size={10} />滞留
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
          {catLabel}{lot.subcategory ? ` › ${lot.subcategory}` : ""}{lot.brand ? ` › ${lot.brand}` : ""}
        </p>
        <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
          仕入日: {new Date(lot.purchaseDate).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {/* 在庫バー */}
      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--ink-secondary)" }}>販売済: {lot.soldQuantity}/{lot.totalQuantity}点</span>
          <span style={{ color: turnoverColor(turnover) }}>回転率 {Math.round(turnover * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${turnover * 100}%`, background: turnoverColor(turnover) }} />
        </div>
        <p className="text-xs" style={{ color: remaining > 0 ? "var(--ink-secondary)" : "var(--ink-tertiary)" }}>
          残: {remaining}点
        </p>
      </div>

      {/* 粗利 */}
      {lot.unitCost && lot.unitPrice && (
        <div className="px-4 pb-3 flex gap-4 text-xs" style={{ color: "var(--ink-secondary)" }}>
          <span>仕入: {lot.unitCost.toLocaleString()}円/点</span>
          <span>販売: {lot.unitPrice.toLocaleString()}円/点</span>
          {grossProfit && <span style={{ color: "var(--success)" }}>粗利率 +{grossProfit}%</span>}
        </div>
      )}

      {/* 販売数更新 */}
      <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
        {editing ? (
          <div className="flex gap-2 items-center">
            <Input type="number" className="text-sm h-7 w-20" value={soldInput}
              onChange={(e) => setSoldInput(e.target.value)}
              min={0} max={lot.totalQuantity} />
            <span className="text-xs" style={{ color: "var(--ink-tertiary)" }}>/ {lot.totalQuantity}点</span>
            <Button size="sm" className="h-7 text-xs ml-auto"
              style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
              onClick={() => { onUpdateSold(lot._id, Math.min(parseInt(soldInput) || 0, lot.totalQuantity)); setEditing(false); }}>
              更新
            </Button>
            <button onClick={() => setEditing(false)} className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs hover:underline" style={{ color: "var(--accent)" }}>
            販売数を更新
          </button>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const store = useQuery(api.stores.get);
  const lots = useQuery(api.inventoryLots.list, store ? { storeId: store._id } : "skip");
  const create = useMutation(api.inventoryLots.create);
  const updateSold = useMutation(api.inventoryLots.updateSold);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "fashion", subcategory: "", brand: "",
    totalQuantity: "", purchaseDate: "", unitCost: "", unitPrice: "", note: "",
  });
  const [filterCat, setFilterCat] = useState("all");

  const subs = categories.find((c) => c.value === form.category)?.subs ?? [];

  function upd(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleCreate() {
    if (!store || !form.name || !form.totalQuantity || !form.purchaseDate) return;
    setSaving(true);
    await create({
      storeId: store._id,
      name: form.name,
      category: form.category,
      subcategory: form.subcategory || undefined,
      brand: form.brand || undefined,
      totalQuantity: parseInt(form.totalQuantity),
      purchaseDate: new Date(form.purchaseDate).getTime(),
      unitCost: form.unitCost ? parseInt(form.unitCost) : undefined,
      unitPrice: form.unitPrice ? parseInt(form.unitPrice) : undefined,
      note: form.note || undefined,
    });
    setForm({ name: "", category: "fashion", subcategory: "", brand: "", totalQuantity: "", purchaseDate: "", unitCost: "", unitPrice: "", note: "" });
    setShowForm(false);
    setSaving(false);
  }

  const filtered = (lots ?? []).filter((l) => filterCat === "all" || l.category === filterCat);

  // サマリー集計
  const totalItems = (lots ?? []).reduce((s, l) => s + l.totalQuantity, 0);
  const soldItems  = (lots ?? []).reduce((s, l) => s + l.soldQuantity, 0);
  const staleLots  = (lots ?? []).filter((l) => l.soldQuantity / l.totalQuantity < 0.3 && l.totalQuantity > l.soldQuantity).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>在庫管理</h2>
          <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
            仕入れロットごとの在庫数・販売数・回転率を管理します。
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
          <Plus size={14} className="mr-1" />ロットを追加
        </Button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "総在庫点数", value: `${totalItems}点`, icon: <Package size={14} /> },
          { label: "販売済み", value: `${soldItems}点`, icon: <TrendingUp size={14} /> },
          { label: "残在庫", value: `${totalItems - soldItems}点`, icon: <Package size={14} /> },
          { label: "滞留ロット", value: `${staleLots}件`, icon: <AlertTriangle size={14} />, warn: staleLots > 0 },
        ].map(({ label, value, icon, warn }) => (
          <div key={label} className="rounded-lg border p-4 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div style={{ color: warn ? "var(--danger)" : "var(--accent)" }}>{icon}</div>
            <p className="text-xl font-medium" style={{ fontFamily: "var(--font-display)", color: warn ? "var(--danger)" : "var(--accent)" }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* 新規ロットフォーム */}
      {showForm && (
        <div className="rounded-lg border p-5 space-y-4" style={{ background: "var(--bg-card)", borderColor: "var(--accent)" }}>
          <p className="text-sm font-medium">新規ロット登録</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">ロット名 <span style={{ color: "var(--danger)" }}>*</span></Label>
              <Input className="text-sm" placeholder="例: 2026年4月 レディーストップス仕入れ" value={form.name} onChange={(e) => upd("name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">大分類</Label>
              <Select value={form.category} onValueChange={(v) => { if (v) { upd("category", v); upd("subcategory", ""); } }}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">中分類</Label>
              <Select value={form.subcategory} onValueChange={(v) => { if (v) upd("subcategory", v); }}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="選択（任意）" /></SelectTrigger>
                <SelectContent>
                  {subs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ブランド</Label>
              <Input className="text-sm" placeholder="例: UNITED ARROWS" value={form.brand} onChange={(e) => upd("brand", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">仕入日 <span style={{ color: "var(--danger)" }}>*</span></Label>
              <Input type="date" className="text-sm" value={form.purchaseDate} onChange={(e) => upd("purchaseDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">仕入点数 <span style={{ color: "var(--danger)" }}>*</span></Label>
              <Input type="number" className="text-sm" placeholder="例: 30" value={form.totalQuantity} onChange={(e) => upd("totalQuantity", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">仕入単価（円/点）</Label>
              <Input type="number" className="text-sm" placeholder="例: 800" value={form.unitCost} onChange={(e) => upd("unitCost", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">販売単価（円/点）</Label>
              <Input type="number" className="text-sm" placeholder="例: 1500" value={form.unitPrice} onChange={(e) => upd("unitPrice", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving || !form.name || !form.totalQuantity || !form.purchaseDate}
              style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
              {saving ? "登録中..." : "ロットを登録"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} style={{ color: "var(--ink-secondary)" }}>キャンセル</Button>
          </div>
        </div>
      )}

      {/* カテゴリフィルター */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ value: "all", label: "すべて" }, ...categories].map(({ value, label }) => (
          <button key={value} onClick={() => setFilterCat(value)}
            className="text-xs px-3 py-1.5 rounded-full border transition-colors"
            style={{
              borderColor: filterCat === value ? "var(--accent)" : "var(--border)",
              background: filterCat === value ? "rgba(27,58,91,0.08)" : "var(--bg-card)",
              color: filterCat === value ? "var(--accent)" : "var(--ink-secondary)",
              fontWeight: filterCat === value ? 500 : 400,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ロットカード */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--ink-tertiary)" }}>
          <Package size={28} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
          <p className="text-sm">ロットデータがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((lot) => (
            <LotCard key={lot._id} lot={lot as Lot}
              onUpdateSold={(id, qty) => updateSold({ id, soldQuantity: qty })} />
          ))}
        </div>
      )}
    </div>
  );
}
