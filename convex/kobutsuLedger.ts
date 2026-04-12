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

export const search = query({
  args: {
    storeId: v.id("stores"),
    keyword: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
    transactionType: v.optional(v.union(v.literal("purchase"), v.literal("sale"), v.literal("all"))),
  },
  handler: async (ctx, { storeId, keyword, dateFrom, dateTo, transactionType }) => {
    let entries = await ctx.db
      .query("kobutsuLedger")
      .withIndex("by_store_and_date", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();

    if (dateFrom) entries = entries.filter((e) => e.transactionDate >= dateFrom);
    if (dateTo) entries = entries.filter((e) => e.transactionDate <= dateTo);
    if (transactionType && transactionType !== "all") {
      entries = entries.filter((e) => e.transactionType === transactionType);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      entries = entries.filter((e) =>
        e.partyName.toLowerCase().includes(kw) ||
        e.itemDescription.toLowerCase().includes(kw) ||
        (e.partyAddress ?? "").toLowerCase().includes(kw) ||
        (e.itemFeatures ?? "").toLowerCase().includes(kw)
      );
    }
    return entries;
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
    partyOccupation: v.optional(v.string()),
    idVerificationMethod: v.string(),
    idNumber: v.optional(v.string()),
    itemDescription: v.string(),
    itemFeatures: v.optional(v.string()),
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
