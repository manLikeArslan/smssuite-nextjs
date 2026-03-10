import { NextResponse } from "next/server";
import { getLiveHeartbeat } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const rawStats = getLiveHeartbeat.all() as { second: string; count: number }[];

        // Generate last 60 seconds to ensure no gaps
        const stats = [];
        const now = new Date();

        for (let i = 59; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 1000);

            // Format to match strftime('%Y-%m-%d %H:%M:%S', ...) but in UTC
            const year = d.getUTCFullYear();
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            const hours = String(d.getUTCHours()).padStart(2, '0');
            const minutes = String(d.getUTCMinutes()).padStart(2, '0');
            const seconds = String(d.getUTCSeconds()).padStart(2, '0');

            const secondStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            const existing = rawStats.find(s => s.second === secondStr);
            stats.push({
                second: secondStr,
                count: existing ? existing.count : 0
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error("LIVE HEARTBEAT FETCH ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch live heartbeat" }, { status: 500 });
    }
}
