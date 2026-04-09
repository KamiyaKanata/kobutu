import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
export const metadata: Metadata = {
  title: "AI古物",
  description: "中古買取業務をAIで一気通貫に自動化",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body><ConvexClientProvider>{children}</ConvexClientProvider></body>
    </html>
  );
}
