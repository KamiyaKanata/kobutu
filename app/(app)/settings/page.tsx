"use client";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export default function SettingsPage() {
  const store = useQuery(api.stores.get);
  const settings = useQuery(
    api.storeSettings.get,
    store ? { storeId: store._id } : "skip"
  );
  const upsert = useMutation(api.storeSettings.upsert);

  const [form, setForm] = useState({
    specialtyCategories: "",
    conditionRankCriteria: "",
    descriptionTone: "",
    ngWords: "",
    brandScope: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        specialtyCategories: settings.specialtyCategories ?? "",
        conditionRankCriteria: settings.conditionRankCriteria ?? "",
        descriptionTone: settings.descriptionTone ?? "",
        ngWords: settings.ngWords ?? "",
        brandScope: settings.brandScope ?? "",
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
      specialtyCategories: form.specialtyCategories || undefined,
      conditionRankCriteria: form.conditionRankCriteria || undefined,
      descriptionTone: form.descriptionTone || undefined,
      ngWords: form.ngWords || undefined,
      brandScope: form.brandScope || undefined,
    });
    setSaving(false);
    setSaved(true);
  }

  const fields = [
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
      placeholder: "例: Sランク=未使用品。Aランク=目立つ傷・汚れなし、細かいスレ可。Bランク=使用感あり、目立つ傷あり。Cランク=大きな傷・汚れ・修理跡あり。",
      description: "自店のランク基準をAIに伝えます。標準基準と異なる場合は詳しく記載してください。",
      type: "textarea",
    },
    {
      key: "descriptionTone",
      label: "説明文のトーン・スタイル",
      placeholder: "例: 丁寧で信頼感のある文体。過剰な装飾語は使わない。事実ベースで簡潔に。SNS投稿はカジュアルでOK。",
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
      placeholder: "例: ルイヴィトン、シャネル、エルメス、グッチ等の高級ブランドを中心に扱う。ノーブランドは対象外。",
      description: "取り扱いブランドの範囲をAIに伝えます。ブランド判定の精度向上に使用します。",
      type: "textarea",
    },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          AI設定
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          AIが商品解析・説明文生成を行う際に参照するプロンプト条件を設定します。
        </p>
      </div>

      <div className="space-y-6">
        {fields.map(({ key, label, placeholder, description, type }) => (
          <div key={key} className="rounded-lg border p-5 space-y-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div>
              <Label className="text-sm font-medium">{label}</Label>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>{description}</p>
            </div>
            {type === "textarea" ? (
              <Textarea
                className="text-sm resize-none"
                rows={3}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)}
              />
            ) : (
              <Input
                className="text-sm"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !store}
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
        >
          {saving ? "保存中..." : "設定を保存"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: "var(--success)" }}>
            <Check size={14} />
            保存しました
          </span>
        )}
      </div>

      <div className="rounded-lg border p-5 space-y-2" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
        <p className="text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>プロトタイプについて</p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--ink-tertiary)" }}>
          現在はモックAIのため、この設定はDBに保存されますが実際のAI解析には反映されません。
          本番Claude API接続後、これらの設定がシステムプロンプトに組み込まれます。
        </p>
      </div>
    </div>
  );
}
