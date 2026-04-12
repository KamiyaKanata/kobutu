import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("conversationFeedbacks")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("conversationFeedbacks") },
  handler: async (ctx, { id }) => {
    const fb = await ctx.db.get(id);
    if (!fb) return;
    await ctx.db.patch(id, { isFavorite: !fb.isFavorite });
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    fileName: v.string(),
    fileType: v.union(v.literal("audio"), v.literal("video")),
    staffName: v.optional(v.string()),
    storeName: v.optional(v.string()),
    recordedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversationFeedbacks", {
      ...args,
      isFavorite: false,
      status: "analyzing",
      createdAt: Date.now(),
    });
  },
});

export const updateResult = mutation({
  args: {
    id: v.id("conversationFeedbacks"),
    transcript: v.string(),
    overallScore: v.number(),
    goodPoints: v.array(v.string()),
    improvementPoints: v.array(v.string()),
    keyMoments: v.array(v.object({
      time: v.string(),
      label: v.union(v.literal("good"), v.literal("improve")),
      note: v.string(),
    })),
  },
  handler: async (ctx, { id, ...result }) => {
    await ctx.db.patch(id, { ...result, status: "done" });
  },
});
