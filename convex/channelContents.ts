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
