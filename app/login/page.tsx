"use client";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin() {
    login();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
            AI古物
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
            中古買取業務をAIで一気通貫に自動化
          </p>
        </div>
        <Button
          onClick={handleLogin}
          className="w-full"
          style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
        >
          ログイン（デモ）
        </Button>
        <p className="text-xs text-center" style={{ color: "var(--ink-tertiary)" }}>
          プロトタイプのため認証は不要です
        </p>
      </div>
    </div>
  );
}
