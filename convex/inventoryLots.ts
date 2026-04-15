import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("inventoryLots")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    totalQuantity: v.number(),
    purchaseDate: v.number(),
    unitCost: v.optional(v.number()),
    unitPrice: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventoryLots", {
      ...args,
      soldQuantity: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateSold = mutation({
  args: { id: v.id("inventoryLots"), soldQuantity: v.number() },
  handler: async (ctx, { id, soldQuantity }) => {
    await ctx.db.patch(id, { soldQuantity });
  },
});
