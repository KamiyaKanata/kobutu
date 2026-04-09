"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

export default function LedgerPage() {
  const store = useQuery(api.stores.get);
  const entries = useQuery(
    api.kobutsuLedger.list,
    store ? { storeId: store._id } : "skip"
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          古物台帳
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
            <Download size={14} className="mr-1" />
            CSV出力（準備中）
          </Button>
          <Link href="/ledger/new">
            <Button style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={14} className="mr-1" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-primary)" }}>
            <tr>
              {["取引日", "種別", "相手方氏名", "品目", "数量", "金額", "本人確認"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "var(--bg-card)" }}>
            {(entries ?? []).map((entry) => (
              <tr key={entry._id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 text-xs">{new Date(entry.transactionDate).toLocaleDateString("ja-JP")}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: entry.transactionType === "purchase" ? "#dbeafe" : "#dcfce7",
                      color: entry.transactionType === "purchase" ? "#1e40af" : "#166534",
                    }}
                  >
                    {entry.transactionType === "purchase" ? "買取" : "売却"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{entry.partyName}</td>
                <td className="px-4 py-3 text-xs max-w-[180px] truncate">{entry.itemDescription}</td>
                <td className="px-4 py-3 text-xs">{entry.quantity}</td>
                <td className="px-4 py-3 text-xs font-medium">{entry.amount.toLocaleString()}円</td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--ink-tertiary)" }}>{entry.idVerificationMethod}</td>
              </tr>
            ))}
            {entries?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
                  台帳データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
