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
