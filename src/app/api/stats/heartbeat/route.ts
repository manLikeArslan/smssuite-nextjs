import { NextResponse } from "next/server";
import { getHeartbeatStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const rawStats = getHeartbeatStats.all() as { hour: string; count: number }[];

        // Generate last 24 hours to ensure no gaps
        const stats = [];
        const now = new Date();
        now.setMinutes(0, 0, 0);

        for (let i = 23; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hourStr = d.toISOString().replace('T', ' ').substring(0, 14) + '00:00';

            const existing = rawStats.find(s => s.hour === hourStr);
            stats.push({
                hour: hourStr,
                count: existing ? existing.count : 0
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("HEARTBEAT FETCH ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch heartbeat stats" }, { status: 500 });
    }
}
