import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("storeSettings")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    storeId: v.id("stores"),
    specialtyCategories: v.optional(v.string()),
    conditionRankCriteria: v.optional(v.string()),
    descriptionTone: v.optional(v.string()),
    ngWords: v.optional(v.string()),
    brandScope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("storeSettings")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    } else {
      return await ctx.db.insert("storeSettings", { ...args, updatedAt: Date.now() });
    }
  },
});
