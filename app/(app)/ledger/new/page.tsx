"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ScanLine } from "lucide-react";
import Link from "next/link";

export default function LedgerNewPage() {
  const router = useRouter();
  const store = useQuery(api.stores.get);
  const create = useMutation(api.kobutsuLedger.create);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    transactionType: "purchase" as "purchase" | "sale",
    partyName: "",
    partyAddress: "",
    partyBirthDate: "",
    partyOccupation: "",
    idVerificationMethod: "運転免許証",
    idNumber: "",
    itemDescription: "",
    itemFeatures: "",
    quantity: "1",
    amount: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleScanMock() {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 1500));
    setForm((prev) => ({
      ...prev,
      partyName: "山田 太郎",
      partyAddress: "東京都渋谷区渋谷1-1-1",
      partyBirthDate: "1985-04-15",
      partyOccupation: "会社員",
      idVerificationMethod: "運転免許証",
      idNumber: "123456789012",
    }));
    setScanning(false);
  }

  async function handleSave() {
    if (!store) return;
    setSaving(true);
    await create({
      storeId: store._id,
      transactionDate: Date.now(),
      transactionType: form.transactionType,
      partyName: form.partyName,
      partyAddress: form.partyAddress,
      partyBirthDate: form.partyBirthDate || undefined,
      partyOccupation: form.partyOccupation || undefined,
      idVerificationMethod: form.idVerificationMethod,
      idNumber: form.idNumber || undefined,
      itemDescription: form.itemDescription,
      itemFeatures: form.itemFeatures || undefined,
      quantity: parseInt(form.quantity),
      amount: parseInt(form.amount),
    });
    router.push("/ledger");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/ledger">
        <Button variant="ghost" size="sm">
          <ArrowLeft size={16} className="mr-1" />
          台帳一覧に戻る
        </Button>
      </Link>

      <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
        古物台帳 新規登録
      </h2>

      <div className="rounded-lg border p-6 space-y-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="space-y-1">
          <Label className="text-xs">取引種別</Label>
          <Select value={form.transactionType} onValueChange={(v) => { if (v) update("transactionType", v); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">買取</SelectItem>
              <SelectItem value="sale">売却</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 本人確認セクション */}
        <div className="p-4 rounded border space-y-4" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">本人確認情報</p>
            <Button variant="outline" size="sm" onClick={handleScanMock} disabled={scanning}
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              <ScanLine size={14} className="mr-1" />
              {scanning ? "読取中..." : "OCRで読取（デモ）"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">氏名 <span style={{ color: "var(--danger)" }}>*</span></Label>
              <Input className="text-sm" value={form.partyName} onChange={(e) => update("partyName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">生年月日</Label>
              <Input className="text-sm" type="date" value={form.partyBirthDate} onChange={(e) => update("partyBirthDate", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">住所 <span style={{ color: "var(--danger)" }}>*</span></Label>
            <Input className="text-sm" value={form.partyAddress} onChange={(e) => update("partyAddress", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">職業</Label>
            <Input className="text-sm" placeholder="例: 会社員" value={form.partyOccupation} onChange={(e) => update("partyOccupation", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">確認書類の種別 <span style={{ color: "var(--danger)" }}>*</span></Label>
              <Select value={form.idVerificationMethod} onValueChange={(v) => { if (v) update("idVerificationMethod", v); }}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["運転免許証", "マイナンバーカード", "パスポート", "健康保険証", "住民基本台帳カード"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">証明書番号</Label>
              <Input className="text-sm" placeholder="例: 123456789012" value={form.idNumber} onChange={(e) => update("idNumber", e.target.value)} />
            </div>
          </div>
        </div>

        {/* 品目セクション */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">品目 <span style={{ color: "var(--danger)" }}>*</span></Label>
            <Input className="text-sm" value={form.itemDescription} onChange={(e) => update("itemDescription", e.target.value)}
              placeholder="例: ルイヴィトン モノグラムバッグ ネヴァーフル MM" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">品目の特徴・型番・傷等の詳細</Label>
            <Textarea className="text-sm resize-none" rows={3} value={form.itemFeatures} onChange={(e) => update("itemFeatures", e.target.value)}
              placeholder="例: モノグラム柄、ブラウン系、内側に使用感あり、保存袋付き、製造番号 SP1234" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">数量</Label>
            <Input className="text-sm" type="number" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">金額（円） <span style={{ color: "var(--danger)" }}>*</span></Label>
            <Input className="text-sm" type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full"
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
          {saving ? "登録中..." : "台帳に登録する"}
        </Button>
      </div>
    </div>
  );
}
