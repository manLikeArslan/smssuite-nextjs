import { NextResponse } from "next/server";
import { deleteList } from "@/lib/db";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        deleteList.run(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE LIST ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
