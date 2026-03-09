import { NextResponse } from "next/server";
import { getStats, updateStats, getTotalContactCount, getStatusCount } from "@/lib/db";

export async function GET() {
    try {
        const stats = getStats.get() as any;
        const total = getTotalContactCount.get() as any;
        const cold = getStatusCount.get('new') as any;
        const followups = getStatusCount.get('followup') as any;

        return NextResponse.json({
            ...stats,
            total_managed: total.count || 0,
            cold: cold.count || 0,
            followups: followups.count || 0
        });
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
