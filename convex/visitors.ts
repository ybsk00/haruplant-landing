import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreate = mutation({
    args: { visitorId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const expiresAt = Date.now() + thirtyDaysMs;

        if (args.visitorId) {
            try {
                const existingId = ctx.db.normalizeId("visitors", args.visitorId);
                if (existingId) {
                    const existing = await ctx.db.get(existingId);
                    if (existing) {
                        return existing._id;
                    }
                }
            } catch (e) {
                // Invalid ID, carry on to create
            }
        }

        const id = await ctx.db.insert("visitors", { expires_at: expiresAt });
        return id;
    },
});

export const get = query({
    args: { visitorId: v.string() },
    handler: async (ctx, args) => {
        try {
            const id = ctx.db.normalizeId("visitors", args.visitorId);
            if (id) {
                return await ctx.db.get(id);
            }
        } catch (e) {
            return null;
        }
        return null;
    }
});
