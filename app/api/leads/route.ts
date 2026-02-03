import { NextResponse } from "next/server";
import db from "@/lib/db";
// import { LeadData } from "@/lib/chatbot/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, treatmentType, time, source = 'chatbot', visionResult } = body;

        const stmt = db.prepare(`
            INSERT INTO leads (name, phone, email, treatment_type, preferred_time, source, vision_result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(name, phone, email, treatmentType, time, source, visionResult);

        return NextResponse.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
        console.error("DB Error:", error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
        const leads = stmt.all();
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}
