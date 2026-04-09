# AI古物 プロトタイプ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI古物のプロトタイプを構築する。全11画面がConvex + シードデータで動作し、AIはモックレスポンスを返す。Vercelにデプロイ済みの状態を目指す。

**Architecture:** Next.js 15 App Router + Convex バックエンド。モックログイン（localStorage）で認証を代替。AIアクションは固定JSONを返すモック関数。シードデータで全画面が埋まった状態にする。

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Convex, Noto Serif JP / Noto Sans JP, pnpm, Vercel

---

## ファイル構成

```
kobutu/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    # ランディングページ
│   ├── (app)/
│   │   ├── layout.tsx                  # サイドバー付きレイアウト
│   │   ├── dashboard/page.tsx
│   │   ├── items/
│   │   │   ├── page.tsx                # 商品一覧
│   │   │   ├── new/page.tsx            # 商品登録（3ステップ）
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # 商品詳細・編集
│   │   │       └── channels/page.tsx  # 販売チャネル
│   │   ├── ledger/
│   │   │   ├── page.tsx               # 古物台帳一覧
│   │   │   └── new/page.tsx           # 台帳新規登録
│   │   ├── customer-reply/page.tsx
│   │   └── pre-estimate/page.tsx      # 公開ページだが認証後にも表示
│   ├── login/page.tsx
│   ├── layout.tsx                     # ルートレイアウト（ConvexProvider）
│   └── globals.css                    # CSS変数 + Tailwind
├── components/
│   ├── ui/                            # shadcn/ui（自動生成）
│   ├── app-sidebar.tsx                # サイドバーナビ
│   ├── item-card.tsx                  # 商品カード
│   └── item-registration/
│       ├── step-upload.tsx
│       ├── step-analyzing.tsx
│       └── step-review.tsx
├── convex/
│   ├── schema.ts
│   ├── stores.ts
│   ├── items.ts
│   ├── itemPhotos.ts
│   ├── channelContents.ts
│   ├── kobutsuLedger.ts
│   ├── preEstimates.ts
│   ├── customerReplies.ts
│   ├── ai.ts                          # モックAI actions
│   └── seed.ts                        # シードデータ mutation
├── lib/
│   ├── utils.ts                       # cn() ユーティリティ
│   └── auth.ts                        # モック認証ヘルパー
└── middleware.ts                       # /app/* ルートのガード
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Next.js 15 プロジェクト作成**

```bash
cd /Users/kamiyakanoudai/git/kobutu
pnpm create next-app@latest . --typescript --tailwind --app --src-dir no --import-alias "@/*" --use-pnpm
```
プロンプトが出たら全てデフォルト（Enter）で進む。

- [ ] **Step 2: shadcn/ui 初期化**

```bash
pnpm dlx shadcn@latest init
```
プロンプト:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`

- [ ] **Step 3: 必要なshadcnコンポーネント追加**

```bash
pnpm dlx shadcn@latest add button card badge input label textarea select dialog toast sonner separator skeleton
```

- [ ] **Step 4: Convex セットアップ**

```bash
pnpm add convex
pnpm dlx convex@latest dev
```
Convex dashboardでログインし、新しいプロジェクト `kobutu` を作成する。`.env.local` に `NEXT_PUBLIC_CONVEX_URL` が自動設定される。

- [ ] **Step 5: lucide-react 追加**

```bash
pnpm add lucide-react
```

- [ ] **Step 6: `app/globals.css` をCSS変数で上書き**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&family=Noto+Sans+JP:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #f7f6f1;
  --bg-card: #ffffff;
  --ink-primary: #0f1419;
  --ink-secondary: #5a5d62;
  --ink-tertiary: #9a9ca0;
  --accent: #1b3a5b;
  --accent-hover: #2a5280;
  --border: #e5e3dc;
  --success: #2d5e3e;
  --warning: #8a5a1a;
  --danger: #8b2520;

  --font-display: 'Noto Serif JP', 'Yu Mincho', serif;
  --font-sans: 'Noto Sans JP', 'Yu Gothic', sans-serif;
}

body {
  background-color: var(--bg-primary);
  color: var(--ink-primary);
  font-family: var(--font-sans);
}

h1, h2, h3 {
  font-family: var(--font-display);
}
```

- [ ] **Step 7: ルートレイアウト更新**

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";

export const metadata: Metadata = {
  title: "AI古物",
  description: "中古買取業務をAIで一気通貫に自動化",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: ConvexClientProvider コンポーネント作成**

`components/convex-client-provider.tsx`:
```tsx
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 + Convex + shadcn/ui project"
```

---

## Task 2: Convexスキーマ定義

**Files:**
- Create: `convex/schema.ts`

- [ ] **Step 1: `convex/schema.ts` を作成**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stores: defineTable({
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  items: defineTable({
    storeId: v.id("stores"),
    category: v.union(
      v.literal("bag"),
      v.literal("watch"),
      v.literal("jewelry"),
      v.literal("wallet"),
      v.literal("accessory"),
      v.literal("camera"),
      v.literal("instrument"),
      v.literal("other"),
    ),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.union(
      v.literal("S"),
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
    ),
    conditionNote: v.optional(v.string()),
    accessories: v.array(v.string()),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("ready"),
      v.literal("published"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_and_status", ["storeId", "status"]),

  itemPhotos: defineTable({
    itemId: v.id("items"),
    storageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    order: v.number(),
    uploadedAt: v.number(),
  }).index("by_item", ["itemId"]),

  channelContents: defineTable({
    itemId: v.id("items"),
    channel: v.union(
      v.literal("ec"),
      v.literal("instagram"),
      v.literal("x"),
      v.literal("rakuten"),
    ),
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),
    generatedAt: v.number(),
  }).index("by_item_and_channel", ["itemId", "channel"]),

  kobutsuLedger: defineTable({
    storeId: v.id("stores"),
    transactionDate: v.number(),
    transactionType: v.union(v.literal("purchase"), v.literal("sale")),
    partyName: v.string(),
    partyAddress: v.string(),
    partyBirthDate: v.optional(v.string()),
    idVerificationMethod: v.string(),
    itemDescription: v.string(),
    quantity: v.number(),
    amount: v.number(),
    relatedItemId: v.optional(v.id("items")),
    createdAt: v.number(),
  }).index("by_store_and_date", ["storeId", "transactionDate"]),

  preEstimates: defineTable({
    storeId: v.id("stores"),
    customerName: v.optional(v.string()),
    customerContact: v.optional(v.string()),
    itemCategory: v.string(),
    selfReportedCondition: v.string(),
    estimatedPriceMin: v.optional(v.number()),
    estimatedPriceMax: v.optional(v.number()),
    aiNote: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("estimated"),
      v.literal("contacted"),
      v.literal("converted"),
    ),
    createdAt: v.number(),
  }).index("by_store", ["storeId"]),

  customerReplies: defineTable({
    storeId: v.id("stores"),
    itemId: v.optional(v.id("items")),
    originalMessage: v.string(),
    generatedReply: v.string(),
    messageType: v.union(
      v.literal("inquiry"),
      v.literal("return"),
      v.literal("complaint"),
      v.literal("review_response"),
    ),
    createdAt: v.number(),
  }).index("by_store", ["storeId"]),
});
```

- [ ] **Step 2: コミット**

```bash
git add convex/schema.ts
git commit -m "feat: add Convex schema for all tables"
```

---

## Task 3: Convex CRUD関数

**Files:**
- Create: `convex/stores.ts`, `convex/items.ts`, `convex/itemPhotos.ts`, `convex/channelContents.ts`, `convex/kobutsuLedger.ts`, `convex/preEstimates.ts`, `convex/customerReplies.ts`

- [ ] **Step 1: `convex/stores.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stores").first();
    if (existing) return existing._id;
    return await ctx.db.insert("stores", {
      name: "サンプル質店",
      ownerId: "mock-owner",
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").first();
  },
});
```

- [ ] **Step 2: `convex/items.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("items")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) return null;
    const photos = await ctx.db
      .query("itemPhotos")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .collect();
    const channels = await ctx.db
      .query("channelContents")
      .withIndex("by_item_and_channel", (q) => q.eq("itemId", itemId))
      .collect();
    return { ...item, photos, channels };
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    category: v.union(
      v.literal("bag"), v.literal("watch"), v.literal("jewelry"),
      v.literal("wallet"), v.literal("accessory"), v.literal("camera"),
      v.literal("instrument"), v.literal("other"),
    ),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C")),
    conditionNote: v.optional(v.string()),
    accessories: v.array(v.string()),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    itemId: v.id("items"),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.optional(v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C"))),
    conditionNote: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("ready"), v.literal("published"))),
  },
  handler: async (ctx, { itemId, ...patch }) => {
    await ctx.db.patch(itemId, { ...patch, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const photos = await ctx.db
      .query("itemPhotos")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .collect();
    for (const photo of photos) await ctx.db.delete(photo._id);
    await ctx.db.delete(itemId);
  },
});
```

- [ ] **Step 3: `convex/itemPhotos.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return await ctx.db
      .query("itemPhotos")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .order("asc")
      .collect();
  },
});

export const attachUrl = mutation({
  args: {
    itemId: v.id("items"),
    photoUrl: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("itemPhotos", {
      itemId: args.itemId,
      photoUrl: args.photoUrl,
      order: args.order,
      uploadedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 4: `convex/channelContents.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    return await ctx.db
      .query("channelContents")
      .withIndex("by_item_and_channel", (q) => q.eq("itemId", itemId))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    itemId: v.id("items"),
    channel: v.union(v.literal("ec"), v.literal("instagram"), v.literal("x"), v.literal("rakuten")),
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channelContents")
      .withIndex("by_item_and_channel", (q) =>
        q.eq("itemId", args.itemId).eq("channel", args.channel)
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        hashtags: args.hashtags,
        generatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("channelContents", {
        ...args,
        generatedAt: Date.now(),
      });
    }
  },
});
```

- [ ] **Step 5: `convex/kobutsuLedger.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("kobutsuLedger")
      .withIndex("by_store_and_date", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    transactionDate: v.number(),
    transactionType: v.union(v.literal("purchase"), v.literal("sale")),
    partyName: v.string(),
    partyAddress: v.string(),
    partyBirthDate: v.optional(v.string()),
    idVerificationMethod: v.string(),
    itemDescription: v.string(),
    quantity: v.number(),
    amount: v.number(),
    relatedItemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("kobutsuLedger", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

- [ ] **Step 6: `convex/preEstimates.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("preEstimates")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const submit = mutation({
  args: {
    storeId: v.id("stores"),
    customerName: v.optional(v.string()),
    customerContact: v.optional(v.string()),
    itemCategory: v.string(),
    selfReportedCondition: v.string(),
    estimatedPriceMin: v.optional(v.number()),
    estimatedPriceMax: v.optional(v.number()),
    aiNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("preEstimates", {
      ...args,
      status: "estimated",
      createdAt: Date.now(),
    });
  },
});
```

- [ ] **Step 7: `convex/customerReplies.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("customerReplies")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    itemId: v.optional(v.id("items")),
    originalMessage: v.string(),
    generatedReply: v.string(),
    messageType: v.union(
      v.literal("inquiry"), v.literal("return"),
      v.literal("complaint"), v.literal("review_response"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customerReplies", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

- [ ] **Step 8: コミット**

```bash
git add convex/
git commit -m "feat: add Convex CRUD functions for all tables"
```

---

## Task 4: モックAI + シードデータ

**Files:**
- Create: `convex/ai.ts`, `convex/seed.ts`

- [ ] **Step 1: `convex/ai.ts` (モックAIアクション)**

```typescript
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// モック: 200ms待ってからサンプルデータを返す
export const analyzeItemFromPhotos = action({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }): Promise<{
    category: string; brand: string; productName: string; color: string;
    material: string; conditionRank: string; conditionNote: string;
    accessories: string[]; descriptionEc: string; descriptionShort: string;
    confidence: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = {
      category: "bag" as const,
      brand: "Louis Vuitton",
      productName: "モノグラム ネヴァーフル MM",
      color: "ブラウン",
      material: "モノグラムキャンバス",
      conditionRank: "A" as const,
      conditionNote: "全体的に良好な状態です。内側に軽微な使用感がありますが、外観は美しく保たれています。",
      accessories: ["保存袋"],
      descriptionEc: "【Louis Vuitton】モノグラム ネヴァーフル MM。定番人気のトートバッグです。モノグラムキャンバス素材を使用し、耐久性と高級感を兼ね備えています。内側に収納ポケットあり。日常使いからビジネスシーンまで幅広くお使いいただけます。",
      descriptionShort: "LV モノグラム ネヴァーフル MM。使用感少なく良好な状態。",
      confidence: 0.91,
    };

    await ctx.runMutation(api.items.update, {
      itemId,
      brand: result.brand,
      productName: result.productName,
      color: result.color,
      material: result.material,
      conditionRank: result.conditionRank,
      conditionNote: result.conditionNote,
      accessories: result.accessories,
      descriptionEc: result.descriptionEc,
      descriptionShort: result.descriptionShort,
      status: "ready",
    });

    return result;
  },
});

export const generateChannelContents = action({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const channels = [
      {
        channel: "ec" as const,
        content: "【Louis Vuitton ルイヴィトン】モノグラム ネヴァーフル MM トートバッグ\n\nブランド定番の人気モデルが入荷いたしました。\n\n■状態\nAランク：全体的に良好な状態です。内側に軽微な使用感がありますが、外観は美しく保たれています。\n\n■付属品\n保存袋\n\n■サイズ（目安）\nW31 × H28.5 × D17cm\n\n当店は全品真贋確認済みです。安心してお買い求めください。",
        hashtags: undefined,
      },
      {
        channel: "instagram" as const,
        content: "✨ LOUIS VUITTON ネヴァーフル MM 入荷しました ✨\n\n定番の人気モデル、Aランクのきれいな状態です💛\n\n詳細・ご購入はプロフィールのリンクから🛍️",
        hashtags: ["ルイヴィトン", "ネヴァーフル", "ブランドバッグ", "ヴィトン", "中古ブランド", "ブランド買取", "トートバッグ", "LV", "louisvuitton", "古物"],
      },
      {
        channel: "x" as const,
        content: "【入荷情報】Louis Vuitton モノグラム ネヴァーフル MM Aランク 保存袋付きが入荷しました。状態良好で使い勝手抜群の定番トートです。詳細はプロフィールのリンクから。 #ルイヴィトン #ブランドバッグ #中古ブランド",
        hashtags: undefined,
      },
      {
        channel: "rakuten" as const,
        content: "ルイヴィトン モノグラム ネヴァーフル MM Aランク\n\nブランド：Louis Vuitton（ルイヴィトン）\nシリーズ：モノグラム\nモデル：ネヴァーフル MM\nカラー：ブラウン\n素材：モノグラムキャンバス\n状態ランク：A（全体的に良好）\n付属品：保存袋\n\n※当店取扱い商品は全て真贋確認済みです",
        hashtags: undefined,
      },
    ];

    for (const ch of channels) {
      await ctx.runMutation(api.channelContents.upsert, {
        itemId,
        channel: ch.channel,
        content: ch.content,
        hashtags: ch.hashtags,
      });
    }
  },
});

export const generateCustomerReply = action({
  args: {
    storeId: v.id("stores"),
    originalMessage: v.string(),
    messageType: v.union(
      v.literal("inquiry"), v.literal("return"),
      v.literal("complaint"), v.literal("review_response"),
    ),
    itemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const replies: Record<string, string> = {
      inquiry: "この度はお問い合わせいただき、誠にありがとうございます。\n\nご質問の件につきまして、担当者より改めてご連絡させていただきます。\n今しばらくお待ちいただけますようお願い申し上げます。\n\n引き続きどうぞよろしくお願いいたします。",
      return: "この度はご連絡いただき、誠にありがとうございます。\n\nご返品の件、承りました。お手数をおかけいたしますが、送料着払いにてご返送ください。商品到着後、速やかに対応させていただきます。\n\nご不便をおかけし、大変申し訳ございません。",
      complaint: "この度はご不便をおかけし、誠に申し訳ございません。\n\nいただいたご指摘を真摯に受け止め、早急に対応させていただきます。詳細につきまして、担当者より改めてご連絡いたします。\n\n今後ともよろしくお願いいたします。",
      review_response: "温かいご評価をいただき、誠にありがとうございます。\n\nお客様にご満足いただけたこと、スタッフ一同大変嬉しく思っております。またのご利用を心よりお待ちしております。",
    };

    const generatedReply = replies[args.messageType];

    await ctx.runMutation(api.customerReplies.create, {
      storeId: args.storeId,
      originalMessage: args.originalMessage,
      generatedReply,
      messageType: args.messageType,
      itemId: args.itemId,
    });

    return generatedReply;
  },
});

export const estimatePrice = action({
  args: {
    storeId: v.id("stores"),
    itemCategory: v.string(),
    selfReportedCondition: v.string(),
    customerName: v.optional(v.string()),
    customerContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const min = 15000;
    const max = 25000;
    const note = "写真や詳細情報を拝見したうえで、正確な査定額をご提示いたします。お気軽にご来店ください。";

    await ctx.runMutation(api.preEstimates.submit, {
      storeId: args.storeId,
      customerName: args.customerName,
      customerContact: args.customerContact,
      itemCategory: args.itemCategory,
      selfReportedCondition: args.selfReportedCondition,
      estimatedPriceMin: min,
      estimatedPriceMax: max,
      aiNote: note,
    });

    return { min, max, note };
  },
});
```

- [ ] **Step 2: `convex/seed.ts` (シードデータ)**

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // 既存データをチェック
    const existingStore = await ctx.db.query("stores").first();
    if (existingStore) return { message: "Seed data already exists" };

    // 店舗作成
    const storeId = await ctx.db.insert("stores", {
      name: "サンプル質店",
      ownerId: "mock-owner",
      createdAt: Date.now(),
    });

    // 商品5件
    const itemsData = [
      {
        category: "bag" as const,
        brand: "Louis Vuitton",
        productName: "モノグラム ネヴァーフル MM",
        color: "ブラウン",
        material: "モノグラムキャンバス",
        conditionRank: "A" as const,
        conditionNote: "全体的に良好。内側に軽微な使用感あり。",
        accessories: ["保存袋"],
        descriptionEc: "【Louis Vuitton】モノグラム ネヴァーフル MM。定番人気のトートバッグです。モノグラムキャンバス素材を使用し、耐久性と高級感を兼ね備えています。",
        descriptionShort: "LV モノグラム ネヴァーフル MM。使用感少なく良好。",
        status: "ready" as const,
        photoUrl: "https://picsum.photos/seed/bag1/400/400",
      },
      {
        category: "watch" as const,
        brand: "ROLEX",
        productName: "サブマリーナ デイト Ref.116610LN",
        color: "ブラック",
        material: "ステンレス",
        conditionRank: "S" as const,
        conditionNote: "未使用品。傷・汚れなし。完全な付属品付き。",
        accessories: ["箱", "保証書", "タグ"],
        descriptionEc: "【ROLEX】サブマリーナ デイト ブラック文字盤。未使用品が入荷いたしました。完全な付属品が揃った希少な1本です。",
        descriptionShort: "ロレックス サブマリーナ デイト 未使用品。",
        status: "published" as const,
        photoUrl: "https://picsum.photos/seed/watch1/400/400",
      },
      {
        category: "wallet" as const,
        brand: "CHANEL",
        productName: "マトラッセ 二つ折り長財布",
        color: "ブラック",
        material: "キャビアスキン",
        conditionRank: "B" as const,
        conditionNote: "使用感があります。金具に小傷あり。使用上問題なし。",
        accessories: [],
        descriptionEc: "【CHANEL】マトラッセ 二つ折り長財布 ブラック キャビアスキン。使用感はございますが、機能的には問題ない状態です。",
        descriptionShort: "シャネル マトラッセ 長財布。使用感あり。",
        status: "ready" as const,
        photoUrl: "https://picsum.photos/seed/wallet1/400/400",
      },
      {
        category: "camera" as const,
        brand: "Nikon",
        productName: "Z6 II ボディ",
        color: "ブラック",
        material: "マグネシウム合金",
        conditionRank: "A" as const,
        conditionNote: "使用感少なく良好。シャッター数少なめ。",
        accessories: ["箱", "充電器", "バッテリー"],
        descriptionEc: "【Nikon】Z6 II フルサイズミラーレス一眼カメラ ボディ。使用感が少なく良好な状態です。付属品も揃っています。",
        descriptionShort: "ニコン Z6 II ボディ。使用少なく良好。",
        status: "ready" as const,
        photoUrl: "https://picsum.photos/seed/camera1/400/400",
      },
      {
        category: "jewelry" as const,
        brand: undefined,
        productName: "K18 ダイヤモンドリング 0.3ct",
        color: "ゴールド",
        material: "K18イエローゴールド",
        conditionRank: "C" as const,
        conditionNote: "目立つ傷あり。石は健在。サイズ直し跡あり。",
        accessories: [],
        descriptionEc: "K18イエローゴールド製ダイヤモンドリング 0.3ct。石は健在でございます。状態を考慮したお値打ち価格でご提供します。",
        descriptionShort: "K18 ダイヤリング 0.3ct。使用感あり。",
        status: "draft" as const,
        photoUrl: "https://picsum.photos/seed/jewelry1/400/400",
      },
    ];

    for (const item of itemsData) {
      const { photoUrl, ...itemData } = item;
      const itemId = await ctx.db.insert("items", {
        storeId,
        ...itemData,
        aiConfidence: 0.88,
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });

      await ctx.db.insert("itemPhotos", {
        itemId,
        photoUrl,
        order: 0,
        uploadedAt: Date.now(),
      });

      // チャネルコンテンツ
      const channels = ["ec", "instagram", "x", "rakuten"] as const;
      for (const channel of channels) {
        await ctx.db.insert("channelContents", {
          itemId,
          channel,
          content: `${item.brand ?? ""} ${item.productName} の${channel}用投稿テキストです。`,
          generatedAt: Date.now(),
        });
      }
    }

    // 古物台帳 3件
    const ledgerItems = await ctx.db.query("items").collect();
    const ledgerData = [
      {
        transactionDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
        transactionType: "purchase" as const,
        partyName: "山田 太郎",
        partyAddress: "東京都渋谷区渋谷1-1-1",
        partyBirthDate: "1985-04-15",
        idVerificationMethod: "運転免許証",
        itemDescription: "ルイヴィトン モノグラムバッグ",
        quantity: 1,
        amount: 45000,
        relatedItemId: ledgerItems[0]?._id,
      },
      {
        transactionDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
        transactionType: "purchase" as const,
        partyName: "鈴木 花子",
        partyAddress: "神奈川県横浜市中区山下町1-1",
        partyBirthDate: "1990-08-22",
        idVerificationMethod: "マイナンバーカード",
        itemDescription: "ロレックス サブマリーナ",
        quantity: 1,
        amount: 980000,
        relatedItemId: ledgerItems[1]?._id,
      },
      {
        transactionDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        transactionType: "sale" as const,
        partyName: "佐藤 次郎",
        partyAddress: "東京都新宿区西新宿2-2-2",
        partyBirthDate: undefined,
        idVerificationMethod: "運転免許証",
        itemDescription: "シャネル マトラッセ 財布",
        quantity: 1,
        amount: 38000,
        relatedItemId: ledgerItems[2]?._id,
      },
    ];

    for (const entry of ledgerData) {
      await ctx.db.insert("kobutsuLedger", {
        storeId,
        ...entry,
        createdAt: Date.now(),
      });
    }

    return { message: "Seed data inserted successfully" };
  },
});
```

- [ ] **Step 3: コミット**

```bash
git add convex/ai.ts convex/seed.ts
git commit -m "feat: add mock AI actions and seed data"
```

---

## Task 5: モック認証 + グローバルレイアウト

**Files:**
- Create: `lib/auth.ts`, `middleware.ts`, `app/login/page.tsx`, `components/app-sidebar.tsx`, `app/(app)/layout.tsx`

- [ ] **Step 1: `lib/auth.ts`**

```typescript
export const AUTH_KEY = "ai-kobutu-authed";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(): void {
  localStorage.setItem(AUTH_KEY, "true");
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
```

- [ ] **Step 2: `middleware.ts`**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// App routes that require auth (checked client-side, middleware blocks server)
export function middleware(request: NextRequest) {
  // Convex handles real auth in production; for prototype, client handles it
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 3: `app/login/page.tsx`**

```tsx
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
          style={{ background: "var(--accent)", color: "#fff" }}
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
```

- [ ] **Step 4: `components/app-sidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, BookOpen, Home, MessageSquare, Calculator, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/items", label: "商品管理", icon: Package },
  { href: "/ledger", label: "古物台帳", icon: BookOpen },
  { href: "/customer-reply", label: "顧客対応", icon: MessageSquare },
  { href: "/pre-estimate", label: "事前査定", icon: Calculator },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
          AI古物
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>
          サンプル質店
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                isActive
                  ? "font-medium"
                  : "hover:bg-gray-50"
              )}
              style={
                isActive
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--ink-secondary)" }
              }
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded text-sm w-full hover:bg-gray-50 transition-colors"
          style={{ color: "var(--ink-secondary)" }}
        >
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: `app/(app)/layout.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-8" style={{ background: "var(--bg-primary)" }}>
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 6: コミット**

```bash
git add lib/ middleware.ts app/login/ components/app-sidebar.tsx app/\(app\)/layout.tsx
git commit -m "feat: add mock auth and app layout with sidebar"
```

---

## Task 6: ダッシュボード + シード実行ページ

**Files:**
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: `app/(app)/dashboard/page.tsx`**

```tsx
"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const store = useQuery(api.stores.get);
  const seed = useMutation(api.seed.run);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    await seed({});
    setSeeding(false);
    setSeeded(true);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          ダッシュボード
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          {store?.name ?? "読み込み中..."}
        </p>
      </div>

      {!seeded && (
        <Card style={{ borderColor: "var(--border)" }}>
          <CardHeader>
            <CardTitle className="text-base">デモデータを投入する</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
              商品5件・古物台帳3件のサンプルデータを投入します。
            </p>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {seeding ? "投入中..." : "シードデータを投入"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>商品管理</p>
                <Link href="/items" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  一覧を見る →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>古物台帳</p>
                <Link href="/ledger" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  一覧を見る →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderColor: "var(--border)" }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--ink-secondary)" }}>新規登録</p>
                <Link href="/items/new" className="text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
                  商品を登録 →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add app/\(app\)/dashboard/
git commit -m "feat: add dashboard page with seed trigger"
```

---

## Task 7: 商品登録フロー `/items/new`

**Files:**
- Create: `app/(app)/items/new/page.tsx`, `components/item-registration/step-upload.tsx`, `components/item-registration/step-analyzing.tsx`, `components/item-registration/step-review.tsx`

- [ ] **Step 1: `components/item-registration/step-upload.tsx`**

```tsx
"use client";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props {
  onNext: (files: File[]) => void;
}

export function StepUpload({ onNext }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 10);
    setFiles(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
          商品写真をアップロード
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          JPEG / PNG / WebP（最大10枚、1枚あたり10MB以内）
        </p>
      </div>

      <label
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 cursor-pointer transition-colors hover:bg-gray-50"
        style={{ borderColor: "var(--border)" }}
      >
        <Upload size={32} style={{ color: "var(--ink-tertiary)" }} />
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--ink-secondary)" }}>
          ここに写真をドロップ、またはクリックして選択
        </p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-20 h-20 object-cover rounded border"
              style={{ borderColor: "var(--border)" }}
            />
          ))}
        </div>
      )}

      <Button
        onClick={() => onNext(files)}
        disabled={files.length === 0}
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        次へ: AIで解析する
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: `components/item-registration/step-analyzing.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";

const steps = [
  "写真を確認しています…",
  "ブランドとカテゴリを判定しています…",
  "状態を評価しています…",
  "説明文を作成しています…",
];

interface Props {
  onComplete: () => void;
}

export function StepAnalyzing({ onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, 600);

    // onComplete is called by parent after action resolves
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center py-24 space-y-8"
      style={{ background: "var(--bg-primary)" }}
    >
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
```

- [ ] **Step 3: `components/item-registration/step-review.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalysisResult {
  category: string; brand: string; productName: string; color: string;
  material: string; conditionRank: string; conditionNote: string;
  accessories: string[]; descriptionEc: string; descriptionShort: string;
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
          <img src={photoUrl} alt="" className="w-full aspect-square object-cover rounded-lg border" style={{ borderColor: "var(--border)" }} />
        ) : (
          <div className="w-full aspect-square rounded-lg border flex items-center justify-center" style={{ borderColor: "var(--border)", color: "var(--ink-tertiary)" }}>
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
            <Select value={data.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[["bag","バッグ"],["watch","時計"],["jewelry","ジュエリー"],["wallet","財布"],["accessory","アクセサリー"],["camera","カメラ"],["instrument","楽器"],["other","その他"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">状態ランク</Label>
            <Select value={data.conditionRank} onValueChange={(v) => update("conditionRank", v)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["S","A","B","C"].map((r) => (
                  <SelectItem key={r} value={r}>{r}ランク</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ブランド</Label>
          <Input className="text-sm" value={data.brand} onChange={(e) => update("brand", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">商品名</Label>
          <Input className="text-sm" value={data.productName} onChange={(e) => update("productName", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">色</Label>
            <Input className="text-sm" value={data.color} onChange={(e) => update("color", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">素材</Label>
            <Input className="text-sm" value={data.material} onChange={(e) => update("material", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">状態説明</Label>
          <Textarea className="text-sm" rows={2} value={data.conditionNote} onChange={(e) => update("conditionNote", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">販売説明文（EC用）</Label>
          <Textarea className="text-sm" rows={4} value={data.descriptionEc} onChange={(e) => update("descriptionEc", e.target.value)} />
        </div>

        <Button
          onClick={() => onSave(data)}
          disabled={saving}
          className="w-full"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {saving ? "登録中..." : "登録する"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `app/(app)/items/new/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StepUpload } from "@/components/item-registration/step-upload";
import { StepAnalyzing } from "@/components/item-registration/step-analyzing";
import { StepReview } from "@/components/item-registration/step-review";

type Step = "upload" | "analyzing" | "review";

export default function NewItemPage() {
  const router = useRouter();
  const store = useQuery(api.stores.get);
  const createItem = useMutation(api.items.create);
  const attachPhoto = useMutation(api.itemPhotos.attachUrl);
  const analyzeItem = useAction(api.ai.analyzeItemFromPhotos);
  const updateItem = useMutation(api.items.update);

  const [step, setStep] = useState<Step>("upload");
  const [itemId, setItemId] = useState<Id<"items"> | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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
    setAnalysisResult(result);
    setStep("review");
  }

  async function handleSave(data: any) {
    if (!itemId) return;
    setSaving(true);
    await updateItem({
      itemId,
      ...data,
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
                background: i <= stepIndex ? "var(--accent)" : "var(--border)",
                color: i <= stepIndex ? "#fff" : "var(--ink-tertiary)",
              }}
            >
              {i + 1}
            </div>
            <span className="text-xs" style={{ color: i === stepIndex ? "var(--ink-primary)" : "var(--ink-tertiary)" }}>
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
        {step === "analyzing" && <StepAnalyzing onComplete={() => {}} />}
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
```

- [ ] **Step 5: コミット**

```bash
git add components/item-registration/ app/\(app\)/items/new/
git commit -m "feat: add 3-step item registration flow with mock AI"
```

---

## Task 8: 商品一覧・詳細・チャネル

**Files:**
- Create: `app/(app)/items/page.tsx`, `app/(app)/items/[id]/page.tsx`, `app/(app)/items/[id]/channels/page.tsx`, `components/item-card.tsx`

- [ ] **Step 1: `components/item-card.tsx`**

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

const rankColors: Record<string, string> = {
  S: "#2d5e3e", A: "#1b3a5b", B: "#8a5a1a", C: "#8b2520",
};
const categoryLabels: Record<string, string> = {
  bag: "バッグ", watch: "時計", jewelry: "ジュエリー", wallet: "財布",
  accessory: "アクセサリー", camera: "カメラ", instrument: "楽器", other: "その他",
};
const statusLabels: Record<string, string> = {
  draft: "下書き", ready: "準備完了", published: "公開中",
};

interface Props {
  item: {
    _id: Id<"items">;
    brand?: string;
    productName?: string;
    category: string;
    conditionRank: string;
    status: string;
    photoUrl?: string;
  };
}

export function ItemCard({ item }: Props) {
  return (
    <Link href={`/items/${item._id}`}>
      <div
        className="rounded-lg border overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
              No image
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>
              {categoryLabels[item.category] ?? item.category}
            </span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{ background: rankColors[item.conditionRank] ?? "#ccc", color: "#fff" }}
            >
              {item.conditionRank}
            </span>
          </div>
          <p className="text-xs font-medium truncate" style={{ color: "var(--ink-tertiary)" }}>
            {item.brand}
          </p>
          <p className="text-sm font-medium truncate">{item.productName ?? "（未設定）"}</p>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}
          >
            {statusLabels[item.status]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: `app/(app)/items/page.tsx`**

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ItemsPage() {
  const store = useQuery(api.stores.get);
  const items = useQuery(
    api.items.list,
    store ? { storeId: store._id } : "skip"
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          商品一覧
        </h2>
        <Link href="/items/new">
          <Button style={{ background: "var(--accent)", color: "#fff" }}>
            <Plus size={16} className="mr-1" />
            商品を登録
          </Button>
        </Link>
      </div>

      {items === undefined ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border aspect-square animate-pulse" style={{ background: "var(--border)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--ink-tertiary)" }}>
          <p className="text-sm">商品がありません</p>
          <Link href="/items/new">
            <Button className="mt-4" style={{ background: "var(--accent)", color: "#fff" }}>
              最初の商品を登録する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item as any} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `app/(app)/items/[id]/page.tsx`**

```tsx
"use client";
import { use, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const rankColors: Record<string, string> = {
  S: "#2d5e3e", A: "#1b3a5b", B: "#8a5a1a", C: "#8b2520",
};
const statusLabels: Record<string, string> = {
  draft: "下書き", ready: "準備完了", published: "公開中",
};

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = useQuery(api.items.get, { itemId: id as Id<"items"> });
  const generateChannels = useAction(api.ai.generateChannelContents);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!item) return;
    setGenerating(true);
    await generateChannels({ itemId: item._id });
    setGenerating(false);
  }

  if (!item) {
    return <div className="animate-pulse h-96 rounded-lg" style={{ background: "var(--border)" }} />;
  }

  const photo = item.photos?.[0];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/items">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-2 space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {photo?.photoUrl ? (
              <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
                No image
              </div>
            )}
          </div>
          <Link href={`/items/${id}/channels`}>
            <Button className="w-full" variant="outline" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              <ExternalLink size={14} className="mr-1" />
              販売チャネル展開
            </Button>
          </Link>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{ background: rankColors[item.conditionRank] ?? "#ccc", color: "#fff" }}
            >
              {item.conditionRank}ランク
            </span>
            <Badge variant="outline" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
              {statusLabels[item.status]}
            </Badge>
          </div>

          <div>
            <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>{item.brand}</p>
            <h2 className="text-xl font-medium mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
              {item.productName ?? "（商品名未設定）"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["色", item.color], ["素材", item.material], ["カテゴリ", item.category]].map(([label, value]) => value && (
              <div key={label as string}>
                <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>

          {item.conditionNote && (
            <div className="p-3 rounded border text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
              {item.conditionNote}
            </div>
          )}

          {item.descriptionEc && (
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--ink-tertiary)" }}>販売説明文</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                {item.descriptionEc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `app/(app)/items/[id]/channels/page.tsx`**

```tsx
"use client";
import { use, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
        <Button
          onClick={handleGenerate}
          disabled={generating}
          style={{ background: "var(--accent)", color: "#fff" }}
        >
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
          <Button onClick={handleGenerate} disabled={generating} style={{ background: "var(--accent)", color: "#fff" }}>
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
                      <span key={tag} className="text-xs" style={{ color: "var(--accent)" }}>
                        #{tag}
                      </span>
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
```

- [ ] **Step 5: コミット**

```bash
git add components/item-card.tsx app/\(app\)/items/
git commit -m "feat: add item list, detail, and channel pages"
```

---

## Task 9: 古物台帳

**Files:**
- Create: `app/(app)/ledger/page.tsx`, `app/(app)/ledger/new/page.tsx`

- [ ] **Step 1: `app/(app)/ledger/page.tsx`**

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

export default function LedgerPage() {
  const store = useQuery(api.stores.get);
  const entries = useQuery(
    api.kobutsuLedger.list,
    store ? { storeId: store._id } : "skip"
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          古物台帳
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" style={{ borderColor: "var(--border)", color: "var(--ink-secondary)" }}>
            <Download size={14} className="mr-1" />
            CSV出力（準備中）
          </Button>
          <Link href="/ledger/new">
            <Button style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={14} className="mr-1" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-primary)" }}>
            <tr>
              {["取引日","種別","相手方氏名","品目","数量","金額","本人確認"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "var(--ink-secondary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: "var(--bg-card)" }}>
            {(entries ?? []).map((entry) => (
              <tr key={entry._id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 text-xs">{new Date(entry.transactionDate).toLocaleDateString("ja-JP")}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: entry.transactionType === "purchase" ? "#dbeafe" : "#dcfce7",
                      color: entry.transactionType === "purchase" ? "#1e40af" : "#166534",
                    }}
                  >
                    {entry.transactionType === "purchase" ? "買取" : "売却"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{entry.partyName}</td>
                <td className="px-4 py-3 text-xs max-w-[180px] truncate">{entry.itemDescription}</td>
                <td className="px-4 py-3 text-xs">{entry.quantity}</td>
                <td className="px-4 py-3 text-xs font-medium">{entry.amount.toLocaleString()}円</td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--ink-tertiary)" }}>{entry.idVerificationMethod}</td>
              </tr>
            ))}
            {entries?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs" style={{ color: "var(--ink-tertiary)" }}>
                  台帳データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `app/(app)/ledger/new/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ScanLine } from "lucide-react";
import Link from "next/link";

export default function LedgerNewPage() {
  const router = useRouter();
  const store = useQuery(api.stores.get);
  const create = useMutation(api.kobutsuLedger.create);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    transactionType: "purchase" as "purchase" | "sale",
    partyName: "",
    partyAddress: "",
    partyBirthDate: "",
    idVerificationMethod: "運転免許証",
    itemDescription: "",
    quantity: "1",
    amount: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleScanMock() {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 1500));
    setForm((prev) => ({
      ...prev,
      partyName: "山田 太郎",
      partyAddress: "東京都渋谷区渋谷1-1-1",
      partyBirthDate: "1985-04-15",
      idVerificationMethod: "運転免許証",
    }));
    setScanning(false);
  }

  async function handleSave() {
    if (!store) return;
    setSaving(true);
    await create({
      storeId: store._id,
      transactionDate: Date.now(),
      transactionType: form.transactionType,
      partyName: form.partyName,
      partyAddress: form.partyAddress,
      partyBirthDate: form.partyBirthDate || undefined,
      idVerificationMethod: form.idVerificationMethod,
      itemDescription: form.itemDescription,
      quantity: parseInt(form.quantity),
      amount: parseInt(form.amount),
    });
    router.push("/ledger");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ledger">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            台帳一覧に戻る
          </Button>
        </Link>
      </div>

      <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
        古物台帳 新規登録
      </h2>

      <div className="rounded-lg border p-6 space-y-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="space-y-1">
          <Label className="text-xs">取引種別</Label>
          <Select value={form.transactionType} onValueChange={(v) => update("transactionType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">買取</SelectItem>
              <SelectItem value="sale">売却</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 rounded border space-y-3" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">本人確認書類</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScanMock}
              disabled={scanning}
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              <ScanLine size={14} className="mr-1" />
              {scanning ? "読取中..." : "OCRで読取（デモ）"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">氏名</Label>
              <Input className="text-sm" value={form.partyName} onChange={(e) => update("partyName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">生年月日</Label>
              <Input className="text-sm" value={form.partyBirthDate} onChange={(e) => update("partyBirthDate", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">住所</Label>
            <Input className="text-sm" value={form.partyAddress} onChange={(e) => update("partyAddress", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">確認方法</Label>
            <Select value={form.idVerificationMethod} onValueChange={(v) => update("idVerificationMethod", v)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["運転免許証","マイナンバーカード","パスポート","健康保険証"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">品目</Label>
          <Input className="text-sm" value={form.itemDescription} onChange={(e) => update("itemDescription", e.target.value)} placeholder="例: ルイヴィトン モノグラムバッグ" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">数量</Label>
            <Input className="text-sm" type="number" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">金額（円）</Label>
            <Input className="text-sm" type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full" style={{ background: "var(--accent)", color: "#fff" }}>
          {saving ? "登録中..." : "台帳に登録する"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add app/\(app\)/ledger/
git commit -m "feat: add ledger list and new entry pages"
```

---

## Task 10: 事前査定・顧客対応

**Files:**
- Create: `app/(app)/pre-estimate/page.tsx`, `app/(app)/customer-reply/page.tsx`

- [ ] **Step 1: `app/(app)/pre-estimate/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PreEstimatePage() {
  const store = useQuery(api.stores.get);
  const estimate = useAction(api.ai.estimatePrice);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ min: number; max: number; note: string } | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    itemCategory: "",
    selfReportedCondition: "",
  });

  async function handleSubmit() {
    if (!store || !form.itemCategory || !form.selfReportedCondition) return;
    setLoading(true);
    const res = await estimate({
      storeId: store._id,
      ...form,
    });
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          事前査定フォーム
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          写真とお品の状態をお知らせください。AIが概算査定額をご提示します。
        </p>
      </div>

      {!result ? (
        <div className="rounded-lg border p-6 space-y-5" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">お名前（任意）</Label>
              <Input className="text-sm" value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">連絡先（任意）</Label>
              <Input className="text-sm" value={form.customerContact} onChange={(e) => setForm((p) => ({ ...p, customerContact: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">品目カテゴリ</Label>
            <Select onValueChange={(v) => setForm((p) => ({ ...p, itemCategory: v }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="選択してください" /></SelectTrigger>
              <SelectContent>
                {[["bag","バッグ"],["watch","時計"],["jewelry","ジュエリー"],["wallet","財布"],["camera","カメラ"],["other","その他"]].map(([v,l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">状態・特徴（自己申告）</Label>
            <Textarea
              className="text-sm"
              rows={3}
              placeholder="例: ほぼ未使用。箱・保証書あり。傷なし。"
              value={form.selfReportedCondition}
              onChange={(e) => setForm((p) => ({ ...p, selfReportedCondition: e.target.value }))}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.itemCategory || !form.selfReportedCondition}
            className="w-full"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "査定中..." : "AIに査定してもらう"}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center space-y-4" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>概算買取価格</p>
          <p className="text-4xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
            {result.min.toLocaleString()}円 〜 {result.max.toLocaleString()}円
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-secondary)" }}>{result.note}</p>
          <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
            ※ 表示された金額はAIによる概算です。実際の買取価格と異なる場合があります。正確な査定は店頭にてお承りいたします。
          </p>
          <Button onClick={() => setResult(null)} variant="outline" style={{ borderColor: "var(--border)" }}>
            もう一度査定する
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `app/(app)/customer-reply/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";

const messageTypes = [
  { value: "inquiry", label: "お問い合わせ" },
  { value: "return", label: "返品・返金" },
  { value: "complaint", label: "クレーム" },
  { value: "review_response", label: "レビュー返信" },
] as const;

export default function CustomerReplyPage() {
  const store = useQuery(api.stores.get);
  const generateReply = useAction(api.ai.generateCustomerReply);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  const [messageType, setMessageType] = useState<string>("inquiry");

  async function handleGenerate() {
    if (!store || !originalMessage) return;
    setLoading(true);
    const result = await generateReply({
      storeId: store._id,
      originalMessage,
      messageType: messageType as any,
    });
    setReply(result);
    setLoading(false);
  }

  function handleCopy() {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          顧客対応文章生成
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
          受信メッセージを貼り付けると、AIが返信の下書きを生成します。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">メッセージ種別</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {messageTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">受信メッセージ</Label>
            <Textarea
              className="text-sm"
              rows={10}
              placeholder="お客様からのメッセージをここに貼り付けてください"
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !originalMessage}
            className="w-full"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "生成中..." : "返信文を生成"}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">生成された返信文</Label>
            {reply && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2">
                <Copy size={12} className="mr-1" />
                {copied ? "コピー済み" : "コピー"}
              </Button>
            )}
          </div>
          <div
            className="min-h-[280px] rounded border p-4 text-sm whitespace-pre-wrap"
            style={{
              borderColor: "var(--border)",
              color: reply ? "var(--ink-primary)" : "var(--ink-tertiary)",
              background: "var(--bg-card)",
            }}
          >
            {reply ?? "ここに返信文が表示されます"}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add app/\(app\)/pre-estimate/ app/\(app\)/customer-reply/
git commit -m "feat: add pre-estimate and customer reply pages"
```

---

## Task 11: ランディングページ

**Files:**
- Create: `app/(marketing)/page.tsx`, `app/page.tsx`

- [ ] **Step 1: `app/page.tsx` (ルートリダイレクト)**

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/");
}
```

※ `app/(marketing)/page.tsx` がルート `/` を担当するため、`app/page.tsx` は削除してOK。

実際には `app/page.tsx` を削除し、`app/(marketing)/page.tsx` に記述する。

- [ ] **Step 2: `app/page.tsx` を削除して `app/(marketing)/page.tsx` を作成**

```bash
rm app/page.tsx
mkdir -p app/\(marketing\)
```

`app/(marketing)/page.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ヘッダー */}
      <header
        className="border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium text-lg" style={{ fontFamily: "var(--font-display)" }}>
            AI古物
          </span>
          <Link href="/login">
            <Button size="sm" style={{ background: "var(--accent)", color: "#fff" }}>
              ログイン
            </Button>
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        {/* SVGメッシュ背景 */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--accent)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>

        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center space-y-6">
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--ink-tertiary)" }}>
            01 — Module B
          </p>
          <h1
            className="text-4xl leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink-primary)" }}
          >
            中古買取業の
            <br />
            「商品の流れ」を
            <br />
            AIで一気通貫に。
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--ink-secondary)" }}>
            査定から登録、販売チャネル展開まで。1点あたり20分の作業を3分に。
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button style={{ background: "var(--accent)", color: "#fff" }}>
                デモを試す
              </Button>
            </Link>
          </div>
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
                <p className="text-4xl font-medium" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                  {num}
                </p>
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
              { id: "A", title: "AIå¤ç© æ¥å®¢", desc: "来客フィードバック自動生成。スタッフのスキルを形式知化。" },
              { id: "B", title: "AI古物 商品", desc: "写真1枚から属性抽出・説明文・販売チャネル展開まで自動化。", highlight: true },
              { id: "C", title: "AI古物 経営", desc: "月次レポート自動生成。ナレッジBotで新人教育コストを削減。" },
              { id: "D", title: "AI古物 市場", desc: "古物市場でスマホ撮影→即座に自社在庫へ流入。" },
            ].map(({ id, title, desc, highlight }) => (
              <div
                key={id}
                className="rounded-lg border p-5 space-y-2"
                style={{
                  borderColor: highlight ? "var(--accent)" : "var(--border)",
                  background: highlight ? "var(--accent)" : "var(--bg-primary)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: highlight ? "rgba(255,255,255,0.7)" : "var(--ink-tertiary)" }}>
                  Module {id}
                </p>
                <p className="text-sm font-medium" style={{ color: highlight ? "#fff" : "var(--ink-primary)", fontFamily: "var(--font-display)" }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: highlight ? "rgba(255,255,255,0.8)" : "var(--ink-secondary)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            まずデモを触ってみてください
          </h2>
          <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
            登録不要。すぐに全機能を体験できます。
          </p>
          <Link href="/login">
            <Button size="lg" style={{ background: "var(--accent)", color: "#fff" }}>
              デモを開始する →
            </Button>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t py-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: "var(--ink-tertiary)" }}>
          <span>AI古物</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add app/
git commit -m "feat: add landing page with hero, modules, and CTA"
```

---

## Task 12: GitHub + Vercel デプロイ

**Files:** なし（設定のみ）

- [ ] **Step 1: GitHubリポジトリ作成**

```bash
gh repo create kobutu --public --source=. --remote=origin --push
```

`gh` コマンドがない場合:
1. GitHub.com で新規リポジトリ `kobutu` を作成（Initialize なし）
2. 表示されるコマンドを実行:
```bash
git remote add origin https://github.com/KamiyaKanata/kobutu.git
git push -u origin main
```

- [ ] **Step 2: Convex デプロイ**

```bash
pnpm dlx convex deploy
```

Convex dashboardからDeploy Keyを取得し、`.env.local` に `CONVEX_DEPLOY_KEY` を設定。

- [ ] **Step 3: Vercel デプロイ**

```bash
pnpm dlx vercel --yes
```

または Vercel dashboard で:
1. "Add New Project" → GitHubリポジトリ `kobutu` を選択
2. Environment Variables に `NEXT_PUBLIC_CONVEX_URL` を追加（`.env.local` の値をコピー）
3. Deploy

- [ ] **Step 4: 動作確認**

デプロイされたURLで以下を確認:
- [ ] ランディングページが表示される
- [ ] 「デモを開始する」→ ログイン → ダッシュボードに遷移する
- [ ] シードデータを投入できる
- [ ] 商品一覧が表示される
- [ ] 商品登録の3ステップが動作する

- [ ] **Step 5: 最終コミット**

```bash
git add -A
git commit -m "chore: production deployment complete"
git push
```

---

## 実行順序サマリー

| Task | 内容 | 所要目安 |
|---|---|---|
| 1 | プロジェクト初期化 | 10分 |
| 2 | Convexスキーマ | 5分 |
| 3 | Convex CRUD関数 | 10分 |
| 4 | モックAI + シードデータ | 10分 |
| 5 | モック認証 + レイアウト | 10分 |
| 6 | ダッシュボード | 5分 |
| 7 | 商品登録フロー | 15分 |
| 8 | 商品一覧・詳細・チャネル | 10分 |
| 9 | 古物台帳 | 10分 |
| 10 | 事前査定・顧客対応 | 10分 |
| 11 | ランディングページ | 10分 |
| 12 | GitHub + Vercel | 10分 |
