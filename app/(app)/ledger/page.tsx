"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Plus, Printer, Search, X } from "lucide-react";
import { useState } from "react";

export default function LedgerPage() {
  const store = useQuery(api.stores.get);
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [txType, setTxType] = useState("all");

  const entries = useQuery(
    api.kobutsuLedger.search,
    store ? {
      storeId: store._id,
      keyword: keyword || undefined,
      dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
      dateTo: dateTo ? new Date(dateTo + "T23:59:59").getTime() : undefined,
      transactionType: txType as "all" | "purchase" | "sale",
    } : "skip"
  );

  function handleReset() {
    setKeyword(""); setDateFrom(""); setDateTo(""); setTxType("all");
  }

  const hasFilter = keyword || dateFrom || dateTo || txType !== "all";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ledger-print-area, #ledger-print-area * { visibility: visible; }
          #ledger-print-area { position: fixed; top: 0; left: 0; width: 100%; }
          #ledger-no-print { display: none; }
        }
      `}</style>

      <div className="space-y-5 max-w-5xl">
        <div id="ledger-no-print" className="flex items-center justify-between">
          <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>古物台帳</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()} style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
              <Printer size={14} className="mr-1" />印刷・PDF出力
            </Button>
            <Link href="/ledger/new">
              <Button style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
                <Plus size={14} className="mr-1" />新規登録
              </Button>
            </Link>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div id="ledger-no-print" className="rounded-lg border p-4 space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-tertiary)" }} />
              <Input
                className="text-sm pl-8"
                placeholder="氏名・品目・住所で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Select value={txType} onValueChange={(v) => { if (v) setTxType(v); }}>
              <SelectTrigger className="text-sm w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全種別</SelectItem>
                <SelectItem value="purchase">買取のみ</SelectItem>
                <SelectItem value="sale">売却のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--ink-tertiary)" }}>取引日:</span>
            <Input type="date" className="text-sm w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-xs" style={{ color: "var(--ink-tertiary)" }}>〜</span>
            <Input type="date" className="text-sm w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {hasFilter && (
              <button onClick={handleReset} className="flex items-center gap-1 text-xs ml-2" style={{ color: "var(--ink-tertiary)" }}>
                <X size={12} />絞り込みを解除
              </button>
            )}
            <span className="text-xs ml-auto" style={{ color: "var(--ink-tertiary)" }}>
              {entries ? `${entries.length}件` : ""}
            </span>
          </div>
        </div>

        <div id="ledger-print-area">
          <div className="hidden print:block mb-6">
            <h1 className="text-xl font-bold text-center">古物台帳</h1>
            <p className="text-sm text-center">{store?.name} — 出力日: {new Date().toLocaleDateString("ja-JP")}</p>
          </div>

          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "var(--bg-primary)" }}>
                <tr>
                  {["取引日", "種別", "相手方氏名", "住所", "品目", "特徴・型番", "数量", "金額", "本人確認書類", "証明書番号"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--ink-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "var(--bg-card)" }}>
                {(entries ?? []).map((entry) => (
                  <tr key={entry._id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{new Date(entry.transactionDate).toLocaleDateString("ja-JP")}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-0.5 rounded whitespace-nowrap"
                        style={{
                          background: entry.transactionType === "purchase" ? "#dbeafe" : "#dcfce7",
                          color: entry.transactionType === "purchase" ? "#1e40af" : "#166534",
                        }}>
                        {entry.transactionType === "purchase" ? "買取" : "売却"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{entry.partyName}</td>
                    <td className="px-3 py-2 text-xs max-w-[120px] truncate">{entry.partyAddress}</td>
                    <td className="px-3 py-2 text-xs max-w-[140px] truncate">{entry.itemDescription}</td>
                    <td className="px-3 py-2 text-xs max-w-[120px] truncate" style={{ color: "var(--ink-secondary)" }}>
                      {(entry as any).itemFeatures ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">{entry.quantity}</td>
                    <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">{entry.amount.toLocaleString()}円</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: "var(--ink-tertiary)" }}>{entry.idVerificationMethod}</td>
                    <td className="px-3 py-2 text-xs" style={{ color: "var(--ink-tertiary)" }}>
                      {(entry as any).idNumber ?? "—"}
                    </td>
                  </tr>
                ))}
                {entries?.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
                      {hasFilter ? "検索条件に一致する台帳データがありません" : "台帳データがありません"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="hidden print:block mt-4 text-xs text-right" style={{ color: "#666" }}>
            古物営業法第16条に基づく記録書類
          </div>
        </div>
      </div>
    </>
  );
}
