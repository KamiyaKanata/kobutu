"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Props {
  result: AnalysisResult;
  photoUrl?: string;
  onSave: (data: AnalysisResult) => void;
  saving: boolean;
}

export function StepReview({ result, photoUrl, onSave, saving }: Props) {
  const [data, setData] = useState(result);

  function update<K extends keyof AnalysisResult>(key: K, value: AnalysisResult[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid grid-cols-5 gap-8">
      <div className="col-span-2 space-y-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="w-full aspect-square object-cover rounded-lg border"
            style={{ borderColor: "var(--border)" }}
          />
        ) : (
          <div
            className="w-full aspect-square rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--border)", color: "var(--ink-tertiary)" }}
          >
            写真なし
          </div>
        )}
        <p className="text-xs text-center" style={{ color: "var(--ink-tertiary)" }}>
          AIの確信度: {Math.round(data.confidence * 100)}%
        </p>
      </div>

      <div className="col-span-3 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">カテゴリ</Label>
            <Select value={data.category} onValueChange={(v) => v && update("category", v)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ["bag", "バッグ"],
                  ["watch", "時計"],
                  ["jewelry", "ジュエリー"],
                  ["wallet", "財布"],
                  ["accessory", "アクセサリー"],
                  ["camera", "カメラ"],
                  ["instrument", "楽器"],
                  ["other", "その他"],
                ].map(([v, l]) => (
                  <SelectItem key={v} value={v!}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">状態ランク</Label>
            <Select value={data.conditionRank} onValueChange={(v) => v && update("conditionRank", v)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["S", "A", "B", "C"].map((r) => (
                  <SelectItem key={r} value={r}>{r}ランク</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ブランド</Label>
          <Input
            className="text-sm"
            value={data.brand}
            onChange={(e) => update("brand", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">商品名</Label>
          <Input
            className="text-sm"
            value={data.productName}
            onChange={(e) => update("productName", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">色</Label>
            <Input
              className="text-sm"
              value={data.color}
              onChange={(e) => update("color", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">素材</Label>
            <Input
              className="text-sm"
              value={data.material}
              onChange={(e) => update("material", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">状態説明</Label>
          <Textarea
            className="text-sm"
            rows={2}
            value={data.conditionNote}
            onChange={(e) => update("conditionNote", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">販売説明文（EC用）</Label>
          <Textarea
            className="text-sm"
            rows={4}
            value={data.descriptionEc}
            onChange={(e) => update("descriptionEc", e.target.value)}
          />
        </div>

        <Button
          onClick={() => onSave(data)}
          disabled={saving}
          className="w-full"
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
        >
          {saving ? "登録中..." : "登録する"}
        </Button>
      </div>
    </div>
  );
}
