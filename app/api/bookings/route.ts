import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getVisitorId } from "@/lib/visitor";

/**
 * POST /api/bookings - Create a booking
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { service = 'implant', visitorId: bodyVisitorId } = body;

        // Get visitor ID from body or cookie
        const visitorId = bodyVisitorId || await getVisitorId();

        if (!visitorId) {
            return NextResponse.json(
                { success: false, error: 'Visitor ID required' },
                { status: 400 }
            );
        }

        // Check if visitor is registered
        const { data: lead } = await supabase
            .from('leads')
            .select('id, name, phone')
            .eq('visitor_id', visitorId)
            .single();

        if (!lead) {
            return NextResponse.json(
                { success: false, error: 'Registration required before booking', needsRegistration: true },
                { status: 400 }
            );
        }

        // Create booking
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                visitor_id: visitorId,
                service,
                status: 'requested'
            })
            .select()
            .single();

        if (error) {
            console.error("Booking insert error:", error);
            return NextResponse.json(
                { success: false, error: 'Failed to create booking' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            id: data.id,
            message: '상담 예약이 완료되었습니다. 곧 연락드리겠습니다.',
            booking: data,
            lead
        });
    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/bookings - Get bookings for visitor or all (admin)
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('visitorId');

        if (visitorId) {
            // Get bookings for specific visitor
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('visitor_id', visitorId)
                .order('created_at', { ascending: false });

            if (error) {
                return NextResponse.json(
                    { success: false, error: 'Database error' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                bookings: data
            });
        }

        // Get all bookings (admin) with lead info
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                leads!bookings_visitor_id_fkey (name, phone)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            // Fallback: get bookings without join if foreign key doesn't exist
            const { data: bookingsOnly } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            return NextResponse.json(bookingsOnly || []);
        }

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
