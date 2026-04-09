import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <header className="border-b" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-lg" style={{ fontFamily: "var(--font-display)" }}>AI古物</span>
          <Link href="/login">
            <Button size="sm" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>ログイン</Button>
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#1b3a5b" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center space-y-6">
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--ink-tertiary)" }}>01 — Module B</p>
          <h1 className="text-4xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--ink-primary)" }}>
            中古買取業の<br />「商品の流れ」を<br />AIで一気通貫に。
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--ink-secondary)" }}>
            査定から登録、販売チャネル展開まで。1点あたり20分の作業を3分に。
          </p>
          <Link href="/login">
            <Button style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>デモを試す</Button>
          </Link>
        </div>
      </section>

      {/* 課題 */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div>
            <p className="text-xs tracking-widest" style={{ color: "var(--ink-tertiary)" }}>02 — 現場の課題</p>
            <h2 className="text-2xl mt-3" style={{ fontFamily: "var(--font-display)" }}>
              1点20分の登録作業を、<br />まだ手作業でやっていませんか？
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { num: "20 min", label: "従来の1点あたり登録時間" },
              { num: "3 min", label: "AI古物導入後の目標時間" },
              { num: "× 6", label: "作業効率の改善倍率" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-4xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>{num}</p>
                <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4モジュール */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div>
            <p className="text-xs tracking-widest" style={{ color: "var(--ink-tertiary)" }}>03 — サービス構成</p>
            <h2 className="text-2xl mt-3" style={{ fontFamily: "var(--font-display)" }}>AI古物の4つのモジュール</h2>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: "A", title: "AI古物 来客", desc: "来客フィードバック自動生成。スタッフのスキルを形式知化。", highlight: false },
              { id: "B", title: "AI古物 商品", desc: "写真1枚から属性抽出・説明文・販売チャネル展開まで自動化。", highlight: true },
              { id: "C", title: "AI古物 経営", desc: "月次レポート自動生成。ナレッジBotで新人教育コストを削減。", highlight: false },
              { id: "D", title: "AI古物 市場", desc: "古物市場でスマホ撮影→即座に自社在庫へ流入。", highlight: false },
            ].map(({ id, title, desc, highlight }) => (
              <div key={id} className="rounded-lg border p-5 space-y-2"
                style={{ borderColor: highlight ? "var(--accent)" : "var(--border)", background: highlight ? "rgba(27,58,91,0.06)" : "var(--bg-primary)" }}>
                <p className="text-xs font-medium" style={{ color: highlight ? "var(--accent)" : "var(--ink-tertiary)" }}>Module {id}</p>
                <p className="text-sm font-medium" style={{ color: "var(--ink-primary)", fontFamily: "var(--font-display)" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>まずデモを触ってみてください</h2>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>登録不要。すぐに全機能を体験できます。</p>
          <Link href="/login">
            <Button size="lg" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>デモを開始する →</Button>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t py-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: "var(--ink-tertiary)" }}>
          <span>AI古物</span><span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
