import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const analyzeItemFromPhotos = action({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
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
        content: "【Louis Vuitton ルイヴィトン】モノグラム ネヴァーフル MM トートバッグ\n\nブランド定番の人気モデルが入荷いたしました。\n\n■状態\nAランク：全体的に良好な状態です。\n\n■付属品\n保存袋\n\n当店は全品真贋確認済みです。安心してお買い求めください。",
        hashtags: undefined,
      },
      {
        channel: "instagram" as const,
        content: "✨ LOUIS VUITTON ネヴァーフル MM 入荷しました ✨\n\n定番の人気モデル、Aランクのきれいな状態です💛\n\n詳細・ご購入はプロフィールのリンクから🛍️",
        hashtags: ["ルイヴィトン", "ネヴァーフル", "ブランドバッグ", "ヴィトン", "中古ブランド", "ブランド買取", "トートバッグ", "LV"],
      },
      {
        channel: "x" as const,
        content: "【入荷情報】Louis Vuitton モノグラム ネヴァーフル MM Aランク 保存袋付きが入荷しました。状態良好で使い勝手抜群の定番トートです。 #ルイヴィトン #ブランドバッグ #中古ブランド",
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
      inquiry: "この度はお問い合わせいただき、誠にありがとうございます。\n\nご質問の件につきまして、担当者より改めてご連絡させていただきます。今しばらくお待ちいただけますようお願い申し上げます。\n\n引き続きどうぞよろしくお願いいたします。",
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
