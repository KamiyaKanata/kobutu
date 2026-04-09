import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stores").first();
    if (existing) return existing._id;
    return await ctx.db.insert("stores", {
      name: "サンプル質店",
      ownerId: "mock-owner",
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").first();
  },
});
