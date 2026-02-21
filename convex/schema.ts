import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    visitors: defineTable({
        expires_at: v.optional(v.number()),
    }),
    leads: defineTable({
        visitor_id: v.string(),
        name: v.string(),
        phone: v.string(),
        privacy_agreed: v.boolean(),
        privacy_version: v.string(),
        utm_source: v.optional(v.union(v.string(), v.null())),
        utm_medium: v.optional(v.union(v.string(), v.null())),
        utm_campaign: v.optional(v.union(v.string(), v.null())),
        utm_content: v.optional(v.union(v.string(), v.null())),
        utm_term: v.optional(v.union(v.string(), v.null())),
        expires_at: v.optional(v.number()),
    }).index("by_visitor_id", ["visitor_id"]),
    bookings: defineTable({
        visitor_id: v.string(),
        service: v.string(),
        status: v.string(),
        expires_at: v.optional(v.number()),
    }).index("by_visitor_id", ["visitor_id"]),
});
