import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOrCreateVisitorId, setVisitorCookie } from "@/lib/visitor";

/**
 * POST /api/visitors - Create or get visitor
 */
export async function POST() {
    try {
        const visitorId = await getOrCreateVisitorId();

        const response = NextResponse.json({
            success: true,
            visitorId
        });

        // Set cookie in response
        response.cookies.set(setVisitorCookie(visitorId));

        return response;
    } catch (error) {
        console.error("Visitor API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Failed to create visitor' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/visitors - Get visitor info and registration status
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('id');

        if (!visitorId) {
            return NextResponse.json(
                { success: false, error: 'Visitor ID required' },
                { status: 400 }
            );
        }

        // Get visitor
        const { data: visitor, error: visitorError } = await supabase
            .from('visitors')
            .select('*')
            .eq('id', visitorId)
            .single();

        if (visitorError || !visitor) {
            return NextResponse.json(
                { success: false, error: 'Visitor not found' },
                { status: 404 }
            );
        }

        // Check if registered (has lead)
        const { data: lead } = await supabase
            .from('leads')
            .select('id, name, phone')
            .eq('visitor_id', visitorId)
            .single();

        return NextResponse.json({
            success: true,
            visitor,
            isRegistered: !!lead,
            lead: lead || null
        });
    } catch (error) {
        console.error("Visitor API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
