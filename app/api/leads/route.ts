import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getVisitorId } from "@/lib/visitor";

const PRIVACY_VERSION = '2026-02-04-v1';

/**
 * POST /api/leads - Create or update lead (registration)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, privacyAgreed, visitorId: bodyVisitorId } = body;

        // Get visitor ID from body or cookie
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

        // Upsert lead (insert or update if visitor_id exists)
        // Note: In a real scenario, we might want to fetch confirmed UTMs from the visitor record
        // but for simplicity and speed, we trust the client's cookie data or
        // we could do a join update. Here we accept UTMs if passed in body.
        const { utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;

        const { data, error } = await supabase
            .from('leads')
            .upsert({
                visitor_id: visitorId,
                name,
                phone,
                privacy_agreed: privacyAgreed,
                privacy_version: PRIVACY_VERSION,
                utm_source,
                utm_medium,
                utm_campaign,
                utm_content,
                utm_term
            }, {
                onConflict: 'visitor_id'
            })
            .select()
            .single();

        if (error) {
            console.error("Lead upsert error:", error);
            return NextResponse.json(
                { success: false, error: 'Failed to save lead' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            id: data.id,
            message: '회원 등록이 완료되었습니다.'
        });
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
            // Get specific lead for visitor
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('visitor_id', visitorId)
                .single();

            if (error) {
                return NextResponse.json({
                    success: true,
                    isRegistered: false,
                    lead: null
                });
            }

            return NextResponse.json({
                success: true,
                isRegistered: true,
                lead: data
            });
        }

        // Get all leads (admin)
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Database error' },
                { status: 500 }
            );
        }

        return NextResponse.json(leads);
    } catch (error) {
        console.error("Lead API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
