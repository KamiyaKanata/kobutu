# AI古物 プロトタイプ 設計ドキュメント

**日付**: 2026-04-09  
**ステータス**: 承認済み  
**スコープ**: 全UIが閲覧可能なプロトタイプ（Convex + シードデータ + AIモック）

---

## 1. プロトタイプのゴール

- 全11画面が閲覧・操作できる状態
- シードデータで画面が埋まっている（空っぽじゃない）
- AIは固定のモックレスポンスを返す（Claude APIキー不要）
- Vercel + Convexでデプロイ済み
- GitHubリポジトリ新規作成（`kobutu`）

---

## 2. 技術スタック

| 項目 | 選定 |
|---|---|
| フレームワーク | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| バックエンド | Convex (DB + functions + file storage) |
| 認証 | モックログイン（1クリックでアプリに入れる） |
| AI | モックレスポンス（固定JSON/テキスト） |
| フォント | Noto Serif JP / Noto Sans JP (Google Fonts) |
| デプロイ | Vercel (frontend) + Convex Cloud (backend) |
| リポジトリ | GitHub 新規作成 `kobutu` |

---

## 3. 画面一覧

| ルート | 内容 | 認証 |
|---|---|---|
| `/` | ランディングページ（マーケティング） | 不要 |
| `/login` | モックログイン（1クリック） | 不要 |
| `/dashboard` | 業務ダッシュボード | 必要 |
| `/items` | 商品一覧 | 必要 |
| `/items/new` | 商品登録AI（3ステップ） | 必要 |
| `/items/[id]` | 商品詳細・編集 | 必要 |
| `/items/[id]/channels` | 販売チャネルプレビュー | 必要 |
| `/ledger` | 古物台帳一覧 | 必要 |
| `/ledger/new` | 台帳新規登録（OCRモック） | 必要 |
| `/pre-estimate` | 事前査定フォーム（公開） | 不要 |
| `/customer-reply` | 顧客対応文章生成 | 必要 |

---

## 4. Convexスキーマ

`03_SYSTEM_SPEC.md` に定義されたスキーマを完全実装する。

### テーブル
- `stores` — 店舗
- `items` — 商品（中核テーブル）
- `itemPhotos` — 商品写真（Convex File Storage参照）
- `channelContents` — 販売チャネル別コンテンツ
- `kobutsuLedger` — 古物台帳
- `preEstimates` — 事前査定リクエスト
- `customerReplies` — 顧客対応文章履歴

### インデックス設計
スキーマ定義通り。`storeId` を全テーブルに持たせ、マルチテナント対応の基盤とする。

---

## 5. シードデータ

### 店舗
```
サンプル質店（storeId: seed用固定値）
```

### 商品（5件）
| ブランド | カテゴリ | 状態 |
|---|---|---|
| ルイ・ヴィトン モノグラムバッグ | bag | A |
| ロレックス サブマリーナ | watch | S |
| シャネル 財布 | wallet | B |
| ニコン デジタルカメラ | camera | A |
| K18 ダイヤリング | jewelry | C |

※写真はUnsplashのプレースホルダー画像URL

### 古物台帳（3件）
- 買取 × 2件
- 売却 × 1件

### チャネルコンテンツ
上記5商品 × 4チャネル（EC / Instagram / X / 楽天）= 20件のサンプルテキスト

---

## 6. AIモック戦略

### `convex/mocks/itemAnalysis.ts`
`analyzeItemFromPhotos` のモック。200msの疑似遅延後に固定JSONを返す。

```typescript
// 戻り値の型
{
  category: string,
  brand: string | null,
  productName: string | null,
  color: string,
  material: string,
  conditionRank: "S" | "A" | "B" | "C",
  conditionNote: string,
  accessories: string[],
  descriptionEc: string,        // 150-250字
  descriptionShort: string,     // 50字程度
  confidence: number            // 0.0-1.0
}
```

### `convex/mocks/channelContent.ts`
4チャネルのサンプルテキストを返す。

### `convex/mocks/idExtraction.ts`
`extractIdInfo` のモック。サンプル個人情報（氏名・住所・生年月日）を返す。

---

## 7. UIデザイン

### カラーパレット
```css
--bg-primary:    #f7f6f1  /* 背景: 温かみのあるオフホワイト */
--bg-card:       #ffffff  /* カード背景 */
--ink-primary:   #0f1419  /* 本文: 墨黒 */
--ink-secondary: #5a5d62  /* 補助文字 */
--ink-tertiary:  #9a9ca0  /* 第3補助 */
--accent:        #1b3a5b  /* アクセント: 深いネイビー */
--accent-hover:  #2a5280
--border:        #e5e3dc  /* 罫線 */
--success:       #2d5e3e
--warning:       #8a5a1a
--danger:        #8b2520
```

### タイポグラフィ
- 見出し: Noto Serif JP（明朝体）
- 本文: Noto Sans JP（ゴシック）

### レイアウト原則
- コンテナ幅: 最大 1100px
- セクション間余白: py-24（96px）
- カード: border 1px + rounded-md、シャドウなし
- アイコン: 線画（細線）のみ、装飾的イラストなし
- UIテキストは全て日本語

### 商品登録フロー `/items/new`（最重要画面）
3ステップで構成:
1. **写真アップロード** — ドラッグ&ドロップエリア（複数枚対応）
2. **AI解析中** — ステップメッセージのアニメーション（実際は1回のモックコール）
   - "写真を確認しています…"
   - "ブランドとカテゴリを判定しています…"
   - "状態を評価しています…"
   - "説明文を作成しています…"
3. **解析結果レビュー** — 左: 写真プレビュー / 右: 全属性の編集フォーム

---

## 8. 認証（モック）

実際の認証なし。`/login` に「ログイン」ボタンを1つ置き、クリックで `/dashboard` にリダイレクト。セッション管理は `localStorage` のフラグで代替。ログアウトでフラグを削除し `/login` にリダイレクト。

---

## 9. 実装フェーズ

| Phase | 内容 |
|---|---|
| 0 | Next.js 15 + Convex + shadcn/ui セットアップ、CSS変数定義、フォント設定 |
| 1 | Convexスキーマ定義 + シードデータ投入スクリプト |
| 2 | 商品登録AIフロー `/items/new`（3ステップ、最重要） |
| 3 | 商品一覧 `/items`、詳細 `/items/[id]`、チャネル `/items/[id]/channels` |
| 4 | 古物台帳 `/ledger`、新規登録 `/ledger/new` |
| 5 | 事前査定 `/pre-estimate`、顧客対応 `/customer-reply` |
| 6 | ランディングページ `/`（SVGメッシュ背景、4モジュール紹介） |
| 7 | GitHub新規リポジトリ作成 → Vercelデプロイ接続 |

---

## 10. ディレクトリ構成（想定）

```
kobutu/
├── app/
│   ├── (marketing)/         # ランディングページ
│   │   └── page.tsx
│   ├── (app)/               # ログイン後の業務画面
│   │   ├── layout.tsx       # サイドバー付きレイアウト
│   │   ├── dashboard/
│   │   ├── items/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── ledger/
│   │   ├── customer-reply/
│   │   └── pre-estimate/
│   ├── login/
│   └── globals.css          # CSS変数定義
├── components/
│   ├── ui/                  # shadcn/ui
│   └── marketing/           # LP用コンポーネント
├── convex/
│   ├── schema.ts
│   ├── items.ts
│   ├── stores.ts
│   ├── itemPhotos.ts
│   ├── channelContents.ts
│   ├── kobutsuLedger.ts
│   ├── preEstimates.ts
│   ├── customerReplies.ts
│   ├── ai.ts                # モックAI action
│   └── seed.ts              # シードデータ
├── lib/
│   └── utils.ts
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-09-ai-kobutu-prototype-design.md
```

---

## 11. デプロイ

- **Frontend**: Vercel（GitHub連携で自動デプロイ）
- **Backend**: Convex Cloud（`pnpm dlx convex deploy`）
- **環境変数**: `NEXT_PUBLIC_CONVEX_URL` をVercel dashboardに設定
- **ドメイン**: プロトタイプ段階は `*.vercel.app` で運用

---

## 12. スコープ外（このプロトタイプでは実装しない）

- 本物のClaude API呼び出し
- 実際のファイルアップロード（Convex File Storage）
- 本番品質の認証
- 決済機能
- マルチ店舗対応
- CSVエクスポート（ボタンのみ表示）
