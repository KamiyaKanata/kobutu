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
            <Button size="sm" style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>デモを試す</Button>
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
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--ink-tertiary)" }}>ファッション・雑貨系リユース特化</p>
          <h1 className="text-4xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--ink-primary)" }}>
            仕入れロットから売り場まで。<br />在庫の流れを、AIが見える化する。
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--ink-secondary)" }}>
            ロット仕入れ × 回転率管理 × 商品化自動化。<br />
            ファッション・雑貨系リユースショップのための一気通貫ツール。
          </p>
          <Link href="/login">
            <Button style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>デモを試す（登録不要）</Button>
          </Link>
        </div>
      </section>

      {/* Before / After */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div>
            <p className="text-xs tracking-widest" style={{ color: "var(--ink-tertiary)" }}>02 — Before / After</p>
            <h2 className="text-2xl mt-3" style={{ fontFamily: "var(--font-display)" }}>
              現場の負担を、数字で変える。
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            {/* Before */}
            <div className="rounded-lg border p-6 space-y-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--ink-tertiary)" }}>❌ 導入前</p>
              {[
                { label: "ロット別の在庫・売上を把握する手段", value: "Excelで手集計（週次）" },
                { label: "商品1点あたりの登録作業", value: "約20分（撮影・採寸・説明文・出品）" },
                { label: "回転率の低い商品の発見", value: "気づかないまま滞留（月単位）" },
                { label: "仕入れ判断の根拠", value: "担当者の経験と勘" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--ink-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
            {/* After */}
            <div className="rounded-lg border p-6 space-y-5" style={{ background: "rgba(27,58,91,0.05)", borderColor: "var(--accent)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>✅ 導入後</p>
              {[
                { label: "ロット別の在庫・売上を把握する手段", value: "リアルタイムで回転率・粗利率を自動表示" },
                { label: "商品1点あたりの登録作業", value: "約3分（AI属性抽出・説明文・チャネル展開）" },
                { label: "回転率の低い商品の発見", value: "30%以下で「滞留」アラートを自動検出" },
                { label: "仕入れ判断の根拠", value: "ロット別粗利率・交差比率をデータで比較" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--ink-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 数字ハイライト */}
          <div className="grid grid-cols-4 gap-6 pt-4">
            {[
              { num: "20 min → 3 min", label: "商品1点あたり登録時間" },
              { num: "週次 → リアルタイム", label: "在庫・回転率の把握" },
              { num: "月単位 → 即日", label: "滞留ロットの検出" },
              { num: "×6.7", label: "登録作業の効率改善" },
            ].map(({ num, label }) => (
              <div key={label} className="space-y-1">
                <p className="text-xl font-medium leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>{num}</p>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 仕入れ〜販売フロー */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div>
            <p className="text-xs tracking-widest" style={{ color: "var(--ink-tertiary)" }}>03 — 機能フロー</p>
            <h2 className="text-2xl mt-3" style={{ fontFamily: "var(--font-display)" }}>
              仕入れから販売まで、ぜんぶつながる。
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "ロット登録",
                desc: "仕入れロットを大分類・中分類・ブランドで登録。仕入単価・販売単価から粗利率を自動計算。",
                active: true,
              },
              {
                step: "02",
                title: "在庫追跡",
                desc: "ロット別に販売済み数を随時更新。回転率30%未満で「滞留」警告。リアルタイムで残数把握。",
                active: false,
              },
              {
                step: "03",
                title: "商品化（AI）",
                desc: "写真1枚でブランド・状態・説明文をAIが自動生成。EC・Instagram・楽天用に最適化。",
                active: false,
              },
              {
                step: "04",
                title: "古物台帳・査定",
                desc: "法令対応の古物台帳に自動入力。事前査定AIで来店前の顧客対応も効率化。",
                active: false,
              },
            ].map(({ step, title, desc, active }) => (
              <div key={step} className="rounded-lg border p-5 space-y-2"
                style={{ borderColor: active ? "var(--accent)" : "var(--border)", background: active ? "rgba(27,58,91,0.06)" : "var(--bg-primary)" }}>
                <p className="text-xs font-medium" style={{ color: active ? "var(--accent)" : "var(--ink-tertiary)" }}>{step}</p>
                <p className="text-sm font-medium" style={{ color: "var(--ink-primary)", fontFamily: "var(--font-display)" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ターゲット */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div>
            <p className="text-xs tracking-widest" style={{ color: "var(--ink-tertiary)" }}>04 — こんな店舗に</p>
            <h2 className="text-2xl mt-3" style={{ fontFamily: "var(--font-display)" }}>
              ファッション・雑貨系リユースショップに最適。
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { title: "古着・レディースファッション", desc: "季節ごとのロット仕入れが多く、在庫管理が複雑。回転率の低いアイテムを素早く検出。" },
              { title: "ホビー・カード・雑貨", desc: "大量仕入れ×少額単価のビジネスモデル。ロット別粗利率で仕入れの善し悪しを判断。" },
              { title: "着物・帯・ブランド品", desc: "高単価少量。仕入れ単価と販売単価の管理を徹底し、交差比率を最大化。" },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-lg border p-5 space-y-2" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--ink-primary)", fontFamily: "var(--font-display)" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>まず触ってみてください</h2>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
            登録不要。デモデータ入りですぐに全機能を体験できます。
          </p>
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
