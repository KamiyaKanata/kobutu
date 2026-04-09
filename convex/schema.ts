import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stores: defineTable({
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  items: defineTable({
    storeId: v.id("stores"),
    category: v.union(
      v.literal("bag"),
      v.literal("watch"),
      v.literal("jewelry"),
      v.literal("wallet"),
      v.literal("accessory"),
      v.literal("camera"),
      v.literal("instrument"),
      v.literal("other"),
    ),
    brand: v.optional(v.string()),
    productName: v.optional(v.string()),
    color: v.optional(v.string()),
    material: v.optional(v.string()),
    conditionRank: v.union(
      v.literal("S"),
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
    ),
    conditionNote: v.optional(v.string()),
    accessories: v.array(v.string()),
    descriptionEc: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("ready"),
      v.literal("published"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_and_status", ["storeId", "status"]),

  itemPhotos: defineTable({
    itemId: v.id("items"),
    storageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    order: v.number(),
    uploadedAt: v.number(),
  }).index("by_item", ["itemId"]),

  channelContents: defineTable({
    itemId: v.id("items"),
    channel: v.union(
      v.literal("ec"),
      v.literal("instagram"),
      v.literal("x"),
      v.literal("rakuten"),
    ),
    content: v.string(),
    hashtags: v.optional(v.array(v.string())),
    generatedAt: v.number(),
  }).index("by_item_and_channel", ["itemId", "channel"]),

  kobutsuLedger: defineTable({
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
    createdAt: v.number(),
  }).index("by_store_and_date", ["storeId", "transactionDate"]),

  preEstimates: defineTable({
    storeId: v.id("stores"),
    customerName: v.optional(v.string()),
    customerContact: v.optional(v.string()),
    itemCategory: v.string(),
    selfReportedCondition: v.string(),
    estimatedPriceMin: v.optional(v.number()),
    estimatedPriceMax: v.optional(v.number()),
    aiNote: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("estimated"),
      v.literal("contacted"),
      v.literal("converted"),
    ),
    createdAt: v.number(),
  }).index("by_store", ["storeId"]),

  customerReplies: defineTable({
    storeId: v.id("stores"),
    itemId: v.optional(v.id("items")),
    originalMessage: v.string(),
    generatedReply: v.string(),
    messageType: v.union(
      v.literal("inquiry"),
      v.literal("return"),
      v.literal("complaint"),
      v.literal("review_response"),
    ),
    createdAt: v.number(),
  }).index("by_store", ["storeId"]),
});
