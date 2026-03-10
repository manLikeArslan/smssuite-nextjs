import { NextResponse } from "next/server";
import { getActiveSession, getSessionLogs, updateSessionStatus } from "@/lib/db";
import { worker } from "@/lib/worker";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = getActiveSession.get();

        if (!session) {
            return NextResponse.json({ status: 'idle' });
        }

        const logs = getSessionLogs.all(session.id);

        return NextResponse.json({
            status: session.status,
            sessionId: session.id,
            listId: session.list_id,
            mode: session.mode,
            progress: session.progress,
            totalCount: session.total_count,
            isTestMode: session.is_test_mode === 1,
            logs
        });
    } catch (error) {
        console.error("SESSION STATUS ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch session status" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = getActiveSession.get();
        if (session) {
            updateSessionStatus.run('paused', session.id);
            return NextResponse.json({ message: "Session paused/stopped" });
        }
        return NextResponse.json({ message: "No active session" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to stop session" }, { status: 500 });
    }
}
