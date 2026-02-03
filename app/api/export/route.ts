import { NextResponse } from "next/server";
import db from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
        const leads = stmt.all();

        const worksheet = XLSX.utils.json_to_sheet(leads);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="haru_leads_${new Date().toISOString().split('T')[0]}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
    }
}
