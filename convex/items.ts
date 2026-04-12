import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .order("desc")
      .collect();

    // Attach first photo to each item
    const itemsWithPhotos = await Promise.all(
      items.map(async (item) => {
        const photo = await ctx.db
          .query("itemPhotos")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .first();
        return { ...item, photoUrl: photo?.photoUrl };
      })
    );
    return itemsWithPhotos;
  },
});

export const get = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) return null;
    const photos = await ctx.db
      .query("itemPhotos")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .collect();
    const channels = await ctx.db
      .query("channelContents")
      .withIndex("by_item_and_channel", (q) => q.eq("itemId", itemId))
      .collect();
    return { ...item, photos, channels };
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    category: v.union(
      v.literal("bag"), v.literal("watch"), v.literal("jewelry"),
      v.literal("wallet"), v.literal("accessory"), v.literal("camera"),
      v.literal("instrument"), v.literal("other"),
    ),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C")),
    conditionNote: v.optional(v.string()),
    accessories: v.array(v.string()),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    itemId: v.id("items"),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.optional(v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C"))),
    conditionNote: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("ready"), v.literal("published"))),
  },
  handler: async (ctx, { itemId, ...patch }) => {
    await ctx.db.patch(itemId, { ...patch, updatedAt: Date.now() });
  },
});

export const dashboardStats = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_store", (q) => q.eq("storeId", storeId))
      .collect();

    const withChannels = await Promise.all(
      items.map(async (item) => {
        const channels = await ctx.db
          .query("channelContents")
          .withIndex("by_item_and_channel", (q) => q.eq("itemId", item._id))
          .collect();
        return { ...item, channelCount: channels.length };
      })
    );

    const noBrand = withChannels.filter((i) => !i.brand).length;
    const noChannel = withChannels.filter((i) => i.channelCount === 0 && i.status !== "draft").length;
    const draft = withChannels.filter((i) => i.status === "draft").length;
    const ready = withChannels.filter((i) => i.status === "ready").length;
    const published = withChannels.filter((i) => i.status === "published").length;
    const total = withChannels.length;
    const deployRate = total > 0 ? Math.round((published / total) * 100) : 0;

    return { total, draft, ready, published, deployRate, noBrand, noChannel };
  },
});

export const remove = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const photos = await ctx.db
      .query("itemPhotos")
      .withIndex("by_item", (q) => q.eq("itemId", itemId))
      .collect();
    for (const photo of photos) await ctx.db.delete(photo._id);
    await ctx.db.delete(itemId);
  },
});
