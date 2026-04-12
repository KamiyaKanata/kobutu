"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

const replyTypes = [
  { key: "replyTemplateInquiry",  label: "お問い合わせ",  placeholder: "例: この度はお問い合わせいただき誠にありがとうございます。〇〇につきまして…" },
  { key: "replyTemplateReturn",   label: "返品・返金",    placeholder: "例: ご不便をおかけし大変申し訳ございません。返品ご希望の場合は着払いにて…" },
  { key: "replyTemplateComplaint", label: "クレーム対応", placeholder: "例: この度はご迷惑をおかけし深くお詫び申し上げます。状況を確認の上…" },
  { key: "replyTemplateReview",   label: "レビュー返信",  placeholder: "例: 温かいご評価をいただき誠にありがとうございます。またのご利用を…" },
] as const;

type FormKey = "specialtyCategories" | "conditionRankCriteria" | "descriptionTone" | "ngWords" | "brandScope"
  | "replyTemplateInquiry" | "replyTemplateReturn" | "replyTemplateComplaint" | "replyTemplateReview";

export default function SettingsPage() {
  const store = useQuery(api.stores.get);
  const settings = useQuery(api.storeSettings.get, store ? { storeId: store._id } : "skip");
  const upsert = useMutation(api.storeSettings.upsert);

  const [form, setForm] = useState<Record<FormKey, string>>({
    specialtyCategories: "",
    conditionRankCriteria: "",
    descriptionTone: "",
    ngWords: "",
    brandScope: "",
    replyTemplateInquiry: "",
    replyTemplateReturn: "",
    replyTemplateComplaint: "",
    replyTemplateReview: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        specialtyCategories:    settings.specialtyCategories    ?? "",
        conditionRankCriteria:  settings.conditionRankCriteria  ?? "",
        descriptionTone:        settings.descriptionTone        ?? "",
        ngWords:                settings.ngWords                ?? "",
        brandScope:             settings.brandScope             ?? "",
        replyTemplateInquiry:   settings.replyTemplateInquiry   ?? "",
        replyTemplateReturn:    settings.replyTemplateReturn     ?? "",
        replyTemplateComplaint: settings.replyTemplateComplaint ?? "",
        replyTemplateReview:    settings.replyTemplateReview    ?? "",
      });
    }
  }, [settings]);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!store) return;
    setSaving(true);
    await upsert({
      storeId: store._id,
      specialtyCategories:    form.specialtyCategories    || undefined,
      conditionRankCriteria:  form.conditionRankCriteria  || undefined,
      descriptionTone:        form.descriptionTone        || undefined,
      ngWords:                form.ngWords                || undefined,
      brandScope:             form.brandScope             || undefined,
      replyTemplateInquiry:   form.replyTemplateInquiry   || undefined,
      replyTemplateReturn:    form.replyTemplateReturn     || undefined,
      replyTemplateComplaint: form.replyTemplateComplaint || undefined,
      replyTemplateReview:    form.replyTemplateReview    || undefined,
    });
    setSaving(false);
    setSaved(true);
  }

  const aiFields = [
    {
      key: "specialtyCategories",
      label: "専門カテゴリ・得意ジャンル",
      placeholder: "例: バッグ・時計・ジュエリーを専門に取り扱っています。カメラや楽器も対応可能。",
      description: "AIが品目を判定する際に優先するカテゴリを指定します。",
      type: "textarea",
    },
    {
      key: "conditionRankCriteria",
      label: "状態ランク基準",
      placeholder: "例: Sランク=未使用品。Aランク=目立つ傷・汚れなし。Bランク=使用感あり。Cランク=大きな傷・修理跡あり。",
      description: "自店のランク基準をAIに伝えます。",
      type: "textarea",
    },
    {
      key: "descriptionTone",
      label: "説明文のトーン・スタイル",
      placeholder: "例: 丁寧で信頼感のある文体。過剰な装飾語は使わない。SNS投稿はカジュアルでOK。",
      description: "AI生成の説明文・チャネルテキストの口調を指定します。",
      type: "textarea",
    },
    {
      key: "ngWords",
      label: "使用禁止ワード",
      placeholder: "例: 激安, 超美品, 掘り出し物, 格安, 爆安",
      description: "カンマ区切りで入力。AIが説明文に使わない表現を指定します。",
      type: "input",
    },
    {
      key: "brandScope",
      label: "対応ブランド・範囲",
      placeholder: "例: ルイヴィトン、シャネル、エルメス、グッチ等の高級ブランドを中心に扱う。",
      description: "取り扱いブランドの範囲をAIに伝えます。",
      type: "textarea",
    },
  ];

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>AI設定</h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          商品解析・説明文・顧客返信のAI動作をカスタマイズします。
        </p>
      </div>

      {/* 商品AI設定 */}
      <section className="space-y-4">
        <div className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium">商品解析・説明文 設定</p>
        </div>
        {aiFields.map(({ key, label, placeholder, description, type }) => (
          <div key={key} className="rounded-lg border p-5 space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div>
              <Label className="text-sm font-medium">{label}</Label>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>{description}</p>
            </div>
            {type === "textarea" ? (
              <Textarea className="text-sm resize-none" rows={3} placeholder={placeholder}
                value={form[key as FormKey]} onChange={(e) => update(key, e.target.value)} />
            ) : (
              <Input className="text-sm" placeholder={placeholder}
                value={form[key as FormKey]} onChange={(e) => update(key, e.target.value)} />
            )}
          </div>
        ))}
      </section>

      {/* 返信テンプレート設定 */}
      <section className="space-y-4">
        <div className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium">顧客返信テンプレート</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>
            種別ごとに自社の定型文・口調・必ず含める文言を設定します。AIが返信文生成時に参照します。
          </p>
        </div>
        {replyTypes.map(({ key, label, placeholder }) => (
          <div key={key} className="rounded-lg border p-5 space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: "rgba(27,58,91,0.08)", color: "var(--accent)" }}>
                {label}
              </span>
              <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>定型文・必須フレーズ・NG表現など</p>
            </div>
            <Textarea className="text-sm resize-none" rows={4} placeholder={placeholder}
              value={form[key]} onChange={(e) => update(key, e.target.value)} />
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !store}
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
          {saving ? "保存中..." : "設定を保存"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
            <Check size={14} />保存しました
          </span>
        )}
      </div>

      <div className="rounded-lg border p-5 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
        <p className="text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>プロトタイプについて</p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
          現在はモックAIのため設定はDBに保存されますが実際のAI解析には反映されません。
          本番Claude API接続後、これらの設定がシステムプロンプトに組み込まれます。
        </p>
      </div>
    </div>
  );
}
