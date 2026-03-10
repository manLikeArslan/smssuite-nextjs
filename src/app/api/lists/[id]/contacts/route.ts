import { NextResponse } from "next/server";
import { getContactsByList, getListById, getContactsByStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        // Check if list exists
        const list = getListById.get(id);
        if (!list) {
            return NextResponse.json({ error: "List not found" }, { status: 404 });
        }

        // Fetch contacts
        let contacts: any[];
        if (status) {
            contacts = getContactsByStatus.all(id, status) as any[];
        } else {
            contacts = getContactsByList.all(id) as any[];
        }

        const numbers = contacts.map(c => c.phone);

        return NextResponse.json({
            id,
            numbers
        });
    } catch (error) {
        console.error("FETCH CONTACTS ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
