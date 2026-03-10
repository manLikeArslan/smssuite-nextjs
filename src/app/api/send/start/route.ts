import { NextResponse } from "next/server";
import { createSession, getActiveSession, addSessionLog } from "@/lib/db";
import { worker } from "@/lib/worker";

export async function POST(req: Request) {
    try {
        const { listId, mode, isTestMode, totalCount } = await req.json();

        if (!listId || !mode) {
            return NextResponse.json({ error: "List ID and Mode are required" }, { status: 400 });
        }

        // Check for existing active session
        const existing = getActiveSession.get();
        if (existing) {
            return NextResponse.json({ error: "A session is already active" }, { status: 409 });
        }

        const sessionId = `sess-${Date.now()}`;

        // Save to DB
        createSession.run(sessionId, listId, mode, isTestMode ? 1 : 0, totalCount);
        addSessionLog.run(sessionId, "Protocol initiated on server. Background process starting...", "info");

        // Start worker (floating promise)
        worker.start();

        return NextResponse.json({ sessionId, status: 'active' });
    } catch (error) {
        console.error("SESSION START ERROR:", error);
        return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }
}
