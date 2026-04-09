import { mutation } from "./_generated/server";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const existingStore = await ctx.db.query("stores").first();
    if (existingStore) return { message: "Seed data already exists" };

    const storeId = await ctx.db.insert("stores", {
      name: "サンプル質店",
      ownerId: "mock-owner",
      createdAt: Date.now(),
    });

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
        descriptionEc: "【Louis Vuitton】モノグラム ネヴァーフル MM。定番人気のトートバッグです。",
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
        descriptionEc: "【ROLEX】サブマリーナ デイト ブラック文字盤。未使用品が入荷いたしました。",
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
        accessories: [] as string[],
        descriptionEc: "【CHANEL】マトラッセ 二つ折り長財布 ブラック キャビアスキン。",
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
        descriptionEc: "【Nikon】Z6 II フルサイズミラーレス一眼カメラ ボディ。使用感が少なく良好な状態です。",
        descriptionShort: "ニコン Z6 II ボディ。使用少なく良好。",
        status: "ready" as const,
        photoUrl: "https://picsum.photos/seed/camera1/400/400",
      },
      {
        category: "jewelry" as const,
        brand: undefined as string | undefined,
        productName: "K18 ダイヤモンドリング 0.3ct",
        color: "ゴールド",
        material: "K18イエローゴールド",
        conditionRank: "C" as const,
        conditionNote: "目立つ傷あり。石は健在。サイズ直し跡あり。",
        accessories: [] as string[],
        descriptionEc: "K18イエローゴールド製ダイヤモンドリング 0.3ct。石は健在でございます。",
        descriptionShort: "K18 ダイヤリング 0.3ct。使用感あり。",
        status: "draft" as const,
        photoUrl: "https://picsum.photos/seed/jewelry1/400/400",
      },
    ];

    const insertedIds = [];
    for (const item of itemsData) {
      const { photoUrl, ...itemData } = item;
      const itemId = await ctx.db.insert("items", {
        storeId,
        ...itemData,
        aiConfidence: 0.88,
        createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: Date.now(),
      });
      insertedIds.push(itemId);

      await ctx.db.insert("itemPhotos", {
        itemId,
        photoUrl,
        order: 0,
        uploadedAt: Date.now(),
      });

      const channelTexts = [
        { channel: "ec" as const, content: `${item.brand ?? ""} ${item.productName} のEC用投稿テキストです。状態${item.conditionRank}ランク。${item.descriptionEc}` },
        { channel: "instagram" as const, content: `✨ ${item.brand ?? ""} ${item.productName} 入荷しました ✨\n\n${item.conditionRank}ランクのきれいな状態です💛\n詳細はプロフィールのリンクから🛍️`, hashtags: ["ブランドバッグ", "中古ブランド", "古物"] },
        { channel: "x" as const, content: `【入荷】${item.brand ?? ""} ${item.productName} ${item.conditionRank}ランクが入荷しました。#ブランド #中古` },
        { channel: "rakuten" as const, content: `${item.brand ?? ""} ${item.productName}\n状態ランク：${item.conditionRank}\n${item.descriptionEc}` },
      ];

      for (const ch of channelTexts) {
        await ctx.db.insert("channelContents", {
          itemId,
          channel: ch.channel,
          content: ch.content,
          hashtags: (ch as any).hashtags,
          generatedAt: Date.now(),
        });
      }
    }

    // 古物台帳 3件
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
        relatedItemId: insertedIds[0],
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
        relatedItemId: insertedIds[1],
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
        relatedItemId: insertedIds[2],
      },
    ];

    for (const entry of ledgerData) {
      await ctx.db.insert("kobutsuLedger", {
        storeId,
        ...entry,
        createdAt: Date.now(),
      });
    }

    return { message: "Seed data inserted successfully", storeId };
  },
});
