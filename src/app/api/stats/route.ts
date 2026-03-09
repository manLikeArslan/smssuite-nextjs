import { NextResponse } from "next/server";
import { getStats, updateStats } from "@/lib/db";

export async function GET() {
    try {
        const stats = getStats.get();
        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const currentData = getStats.get() as any;

        const newData = {
            ...currentData,
            ...body,
        };

        updateStats.run(
            newData.total_managed,
            newData.cold,
            newData.followups,
            newData.health
        );

        return NextResponse.json(newData);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
    }
}
