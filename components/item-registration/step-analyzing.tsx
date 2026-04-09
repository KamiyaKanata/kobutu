"use client";
import { useEffect, useState } from "react";

const steps = [
  "写真を確認しています…",
  "ブランドとカテゴリを判定しています…",
  "状態を評価しています…",
  "説明文を作成しています…",
];

export function StepAnalyzing() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              background: "var(--accent)",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--ink-secondary)" }}>
        {steps[stepIndex]}
      </p>
    </div>
  );
}
