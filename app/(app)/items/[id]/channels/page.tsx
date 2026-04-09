"use client";
import { use, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";

const channelLabels: Record<string, string> = {
  ec: "自社EC", instagram: "Instagram", x: "X (Twitter)", rakuten: "楽天市場",
};

export default function ChannelsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = useQuery(api.items.get, { itemId: id as Id<"items"> });
  const generateChannels = useAction(api.ai.generateChannelContents);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    if (!item) return;
    setGenerating(true);
    await generateChannels({ itemId: item._id });
    setGenerating(false);
  }

  function handleCopy(channel: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopied(channel);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!item) return null;

  const channels = item.channels ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/items/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            商品詳細に戻る
          </Button>
        </Link>
        <Button onClick={handleGenerate} disabled={generating} style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
          <RefreshCw size={14} className={`mr-1 ${generating ? "animate-spin" : ""}`} />
          {generating ? "生成中..." : "テキストを生成"}
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          販売チャネル展開
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          {item.brand} {item.productName}
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--ink-tertiary)" }}>
          <p className="text-sm mb-4">まだテキストが生成されていません</p>
          <Button onClick={handleGenerate} disabled={generating} style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
            テキストを生成する
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {channels.map((ch) => (
            <Card key={ch._id} style={{ borderColor: "var(--border)" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{channelLabels[ch.channel] ?? ch.channel}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(ch.channel, ch.content)}
                    className="h-7 px-2"
                  >
                    <Copy size={12} className="mr-1" />
                    {copied === ch.channel ? "コピー済み" : "コピー"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink-secondary)" }}>
                  {ch.content}
                </p>
                {ch.hashtags && ch.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ch.hashtags.map((tag) => (
                      <span key={tag} className="text-xs" style={{ color: "var(--accent)" }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
