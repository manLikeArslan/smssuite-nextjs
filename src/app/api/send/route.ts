import { NextResponse } from "next/server";
import { getStats, updateStats } from "@/lib/db";
import { isValidPhone } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { phone, isDryRun } = await req.json();
        const PUSHCUT_URL = process.env.PUSHCUT_URL;

        if (!isValidPhone(phone)) {
            return NextResponse.json({ success: false, error: "Invalid phone number format" }, { status: 400 });
        }

        if (isDryRun) {
            return NextResponse.json({ success: true, msg: `[DRY RUN] Would text ${phone}` });
        }

        if (!PUSHCUT_URL) {
            return NextResponse.json({ success: false, error: "Pushcut URL not configured" }, { status: 500 });
        }

        // Verification Logging
        console.log(`[SMS AUTHENTICATED] Sending to: ${PUSHCUT_URL}`);
        console.log(`[PAYLOAD]:`, JSON.stringify({ input: { number: phone } }));

        // Proxy to Pushcut
        const response = await fetch(PUSHCUT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: { number: phone } }),
        });

        const success = response.ok;

        // Update Stats in SQLite
        const currentStats = getStats.get() as any;
        if (success) {
            updateStats.run(
                currentStats.total_managed + 1,
                currentStats.cold,
                currentStats.followups,
                currentStats.health
            );
        }

        return NextResponse.json({ success, status: response.status });
    } catch (error) {
        console.error("SMS SEND ERROR:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
