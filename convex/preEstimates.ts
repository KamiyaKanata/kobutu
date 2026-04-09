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
