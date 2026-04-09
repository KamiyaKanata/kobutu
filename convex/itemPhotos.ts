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
