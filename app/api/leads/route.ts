import { NextResponse } from "next/server";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";

const PRIVACY_VERSION = '2026-02-04-v1';

/**
 * POST /api/leads - Create or update lead (registration)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, privacyAgreed, visitorId: bodyVisitorId } = body;

        const visitorId = bodyVisitorId || await getVisitorId();

        if (!visitorId) {
            return NextResponse.json(
                { success: false, error: 'Visitor ID required' },
                { status: 400 }
            );
        }

        if (!name || !phone) {
            return NextResponse.json(
                { success: false, error: 'Name and phone required' },
                { status: 400 }
            );
        }

        if (!privacyAgreed) {
            return NextResponse.json(
                { success: false, error: 'Privacy agreement required' },
                { status: 400 }
            );
        }

        const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;

        try {
            const leadId = await convex.mutation(api.leads.upsert, {
                visitorId,
                name,
                phone,
                privacyAgreed,
                privacyVersion: PRIVACY_VERSION,
                utm_source: utm_source || null,
                utm_medium: utm_medium || null,
                utm_campaign: utm_campaign || null,
                utm_content: utm_content || null,
                utm_term: utm_term || null,
            });

            return NextResponse.json({
                success: true,
                id: leadId,
                message: '회원 등록이 완료되었습니다.'
            });
        } catch (error) {
            console.error("Lead upsert error:", error);
            return NextResponse.json(
                { success: false, error: 'Failed to save lead' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Lead API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/leads - Get leads (for admin) or check registration status
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('visitorId');

        if (visitorId) {
            const lead = await convex.query(api.leads.getByVisitor, { visitorId });

            if (!lead) {
                return NextResponse.json({
                    success: true,
                    isRegistered: false,
                    lead: null
                });
            }

            return NextResponse.json({
                success: true,
                isRegistered: true,
                lead: lead
            });
        }

        const leads = await convex.query(api.leads.list);
        return NextResponse.json(leads);

    } catch (error) {
        console.error("Lead API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
