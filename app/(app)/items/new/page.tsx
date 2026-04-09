"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { StepUpload } from "@/components/item-registration/step-upload";
import { StepAnalyzing } from "@/components/item-registration/step-analyzing";
import { StepReview } from "@/components/item-registration/step-review";

type Step = "upload" | "analyzing" | "review";

interface AnalysisResult {
  category: string;
  brand: string;
  productName: string;
  color: string;
  material: string;
  conditionRank: string;
  conditionNote: string;
  accessories: string[];
  descriptionEc: string;
  descriptionShort: string;
  confidence: number;
}

export default function NewItemPage() {
  const router = useRouter();
  const store = useQuery(api.stores.get);
  const createItem = useMutation(api.items.create);
  const attachPhoto = useMutation(api.itemPhotos.attachUrl);
  const analyzeItem = useAction(api.ai.analyzeItemFromPhotos);
  const updateItem = useMutation(api.items.update);

  const [step, setStep] = useState<Step>("upload");
  const [itemId, setItemId] = useState<Id<"items"> | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleUpload(files: File[]) {
    if (!store) return;
    setStep("analyzing");

    if (files[0]) {
      setPreviewUrl(URL.createObjectURL(files[0]));
    }

    const id = await createItem({
      storeId: store._id,
      category: "bag",
      conditionRank: "A",
      accessories: [],
    });
    setItemId(id);

    await attachPhoto({
      itemId: id,
      photoUrl: "https://picsum.photos/seed/new/400/400",
      order: 0,
    });

    const result = await analyzeItem({ itemId: id });
    setAnalysisResult(result as AnalysisResult);
    setStep("review");
  }

  async function handleSave(data: AnalysisResult) {
    if (!itemId) return;
    setSaving(true);
    await updateItem({
      itemId,
      brand: data.brand,
      productName: data.productName,
      color: data.color,
      material: data.material,
      conditionRank: data.conditionRank as "S" | "A" | "B" | "C",
      conditionNote: data.conditionNote,
      accessories: data.accessories,
      descriptionEc: data.descriptionEc,
      descriptionShort: data.descriptionShort,
      status: "ready",
    });
    router.push(`/items/${itemId}`);
  }

  const stepLabels = ["写真アップロード", "AI解析中", "内容確認・登録"];
  const stepIndex = { upload: 0, analyzing: 1, review: 2 }[step];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          商品を登録する
        </h2>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{
                background: i <= stepIndex ? "rgba(27,58,91,0.1)" : "var(--border)",
                color: i <= stepIndex ? "var(--accent)" : "var(--ink-tertiary)",
                border: i <= stepIndex ? "1px solid var(--accent)" : "1px solid transparent",
              }}
            >
              {i + 1}
            </div>
            <span
              className="text-xs"
              style={{ color: i === stepIndex ? "var(--ink-primary)" : "var(--ink-tertiary)" }}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <div className="w-8 h-px" style={{ background: "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-lg border p-8"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {step === "upload" && <StepUpload onNext={handleUpload} />}
        {step === "analyzing" && <StepAnalyzing />}
        {step === "review" && analysisResult && (
          <StepReview
            result={analysisResult}
            photoUrl={previewUrl}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
