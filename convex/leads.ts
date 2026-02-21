import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByVisitor = query({
    args: { visitorId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("leads")
            .withIndex("by_visitor_id", (q) => q.eq("visitor_id", args.visitorId))
            .first();
    },
});

export const upsert = mutation({
    args: {
        visitorId: v.string(),
        name: v.string(),
        phone: v.string(),
        privacyAgreed: v.boolean(),
        privacyVersion: v.string(),
        utm_source: v.optional(v.union(v.string(), v.null())),
        utm_medium: v.optional(v.union(v.string(), v.null())),
        utm_campaign: v.optional(v.union(v.string(), v.null())),
        utm_content: v.optional(v.union(v.string(), v.null())),
        utm_term: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const expiresAt = Date.now() + thirtyDaysMs;

        const existing = await ctx.db
            .query("leads")
            .withIndex("by_visitor_id", (q) => q.eq("visitor_id", args.visitorId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                phone: args.phone,
                privacy_agreed: args.privacyAgreed,
                utm_source: args.utm_source !== undefined ? args.utm_source : existing.utm_source,
                utm_medium: args.utm_medium !== undefined ? args.utm_medium : existing.utm_medium,
                utm_campaign: args.utm_campaign !== undefined ? args.utm_campaign : existing.utm_campaign,
                utm_content: args.utm_content !== undefined ? args.utm_content : existing.utm_content,
                utm_term: args.utm_term !== undefined ? args.utm_term : existing.utm_term,
                expires_at: expiresAt,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("leads", {
                visitor_id: args.visitorId,
                name: args.name,
                phone: args.phone,
                privacy_agreed: args.privacyAgreed,
                privacy_version: args.privacyVersion,
                utm_source: args.utm_source,
                utm_medium: args.utm_medium,
                utm_campaign: args.utm_campaign,
                utm_content: args.utm_content,
                utm_term: args.utm_term,
                expires_at: expiresAt,
            });
        }
    },
});

export const updateUtm = mutation({
    args: {
        visitorId: v.string(),
        utm_source: v.optional(v.union(v.string(), v.null())),
        utm_medium: v.optional(v.union(v.string(), v.null())),
        utm_campaign: v.optional(v.union(v.string(), v.null())),
        utm_content: v.optional(v.union(v.string(), v.null())),
        utm_term: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db
            .query("leads")
            .withIndex("by_visitor_id", (q) => q.eq("visitor_id", args.visitorId))
            .first();

        if (lead) {
            await ctx.db.patch(lead._id, {
                utm_source: args.utm_source,
                utm_medium: args.utm_medium,
                utm_campaign: args.utm_campaign,
                utm_content: args.utm_content,
                utm_term: args.utm_term,
            });
            return true;
        }
        return false;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("leads").order("desc").collect();
    },
});
