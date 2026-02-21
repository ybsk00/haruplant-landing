import { NextResponse } from "next/server";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { getVisitorId } from "@/lib/visitor";

/**
 * POST /api/bookings - Create a booking
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { service = 'implant', visitorId: bodyVisitorId } = body;

        const visitorId = bodyVisitorId || await getVisitorId();

        if (!visitorId) {
            return NextResponse.json(
                { success: false, error: 'Visitor ID required' },
                { status: 400 }
            );
        }

        const lead = await convex.query(api.leads.getByVisitor, { visitorId });

        if (!lead) {
            return NextResponse.json(
                { success: false, error: 'Registration required before booking', needsRegistration: true },
                { status: 400 }
            );
        }

        try {
            const bookingId = await convex.mutation(api.bookings.create, {
                visitorId,
                service,
                status: 'requested',
            });

            return NextResponse.json({
                success: true,
                id: bookingId,
                message: '상담 예약이 완료되었습니다. 곧 연락드리겠습니다.',
                booking: { id: bookingId, visitor_id: visitorId, service, status: 'requested' },
                lead
            });
        } catch (error) {
            console.error("Booking insert error:", error);
            return NextResponse.json(
                { success: false, error: 'Failed to create booking' },
                { status: 500 }
            );
        }

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
            const bookings = await convex.query(api.bookings.getByVisitor, { visitorId });

            return NextResponse.json({
                success: true,
                bookings: bookings
            });
        }

        const bookingsWithLeads = await convex.query(api.bookings.listWithLeads);
        return NextResponse.json(bookingsWithLeads);

    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
