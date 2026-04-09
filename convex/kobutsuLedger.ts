import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("kobutsuLedger")
      .withIndex("by_store_and_date", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    transactionDate: v.number(),
    transactionType: v.union(v.literal("purchase"), v.literal("sale")),
    partyName: v.string(),
    partyAddress: v.string(),
    partyBirthDate: v.optional(v.string()),
    idVerificationMethod: v.string(),
    itemDescription: v.string(),
    quantity: v.number(),
    amount: v.number(),
    relatedItemId: v.optional(v.id("items")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("kobutsuLedger", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
