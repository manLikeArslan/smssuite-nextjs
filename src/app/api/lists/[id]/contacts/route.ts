import { NextResponse } from "next/server";
import { getContactsByList, getListById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if list exists
        const list = getListById.get(id);
        if (!list) {
            return NextResponse.json({ error: "List not found" }, { status: 404 });
        }

        // Fetch contacts
        const contacts = getContactsByList.all(id) as any[];
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
