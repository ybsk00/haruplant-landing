import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByVisitor = query({
    args: { visitorId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("bookings")
            .withIndex("by_visitor_id", (q) => q.eq("visitor_id", args.visitorId))
            .order("desc")
            .collect();
    },
});

export const listWithLeads = query({
    args: {},
    handler: async (ctx) => {
        const bookings = await ctx.db.query("bookings").order("desc").collect();

        const bookingsWithLeads = await Promise.all(
            bookings.map(async (booking) => {
                const lead = await ctx.db
                    .query("leads")
                    .withIndex("by_visitor_id", (q) => q.eq("visitor_id", booking.visitor_id))
                    .first();

                return {
                    ...booking,
                    leads: lead ? { name: lead.name, phone: lead.phone } : null
                };
            })
        );

        return bookingsWithLeads;
    },
});

export const create = mutation({
    args: {
        visitorId: v.string(),
        service: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        return await ctx.db.insert("bookings", {
            visitor_id: args.visitorId,
            service: args.service,
            status: args.status,
            expires_at: Date.now() + thirtyDaysMs,
        });
    },
});
