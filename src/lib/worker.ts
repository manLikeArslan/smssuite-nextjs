import {
    getActiveSession,
    getSessionById,
    updateSessionProgress,
    updateSessionStatus,
    addSessionLog,
    getContactsByStatus,
    updateContactStatus,
    updateStats,
    getStats,
    logSentEvent
} from "./db";
import { isValidPhone } from "./utils";

class SessionWorker {
    private activeSessionId: string | null = null;
    private isProcessing = false;

    async start() {
        if (this.isProcessing) return;

        const session = getActiveSession.get();
        if (!session) return;

        this.activeSessionId = session.id;
        this.process();
    }

    private async process() {
        this.isProcessing = true;
        console.log(`[WORKER] Starting session: ${this.activeSessionId}`);

        while (this.activeSessionId) {
            const session = getSessionById.get(this.activeSessionId);
            if (!session || session.status !== 'active') break;

            // Fetch pending contacts for this session's list and mode
            const statusToFetch = session.mode === 'new' ? 'new' : 'followup';
            const contacts = getContactsByStatus.all(session.list_id, statusToFetch) as any[];

            if (contacts.length === 0) {
                updateSessionStatus.run('completed', session.id);
                addSessionLog.run(session.id, "Session completed. All targets processed.", "success");
                break;
            }

            const contact = contacts[0];
            const phone = contact.phone;

            // Handle sending (Similar to API route logic but on server)
            try {
                await this.sendMessage(phone, session);
                updateSessionProgress.run(session.progress + 1, session.id);
            } catch (e: any) {
                addSessionLog.run(session.id, `Critical error for ${phone}: ${e.message}`, "error");
            }

            // Check if we should continue
            if (session.progress + 1 >= session.total_count) {
                updateSessionStatus.run('completed', session.id);
                addSessionLog.run(session.id, "Protocol complete. Limit reached.", "success");
                break;
            }

            // Variable delay
            const delay = Math.floor(Math.random() * (25 - 15 + 1) + 15) * 1000;
            await new Promise(r => setTimeout(r, delay));
        }

        this.isProcessing = false;
        this.activeSessionId = null;
        console.log("[WORKER] Worker idle.");
    }

    private async sendMessage(phone: string, session: any) {
        const PUSHCUT_URL = process.env.PUSHCUT_URL;

        if (session.is_test_mode) {
            logSentEvent.run('success');
            updateContactStatus.run('followup', session.list_id, phone);
            addSessionLog.run(session.id, `Success: ${phone} (Dry Run)`, "success");
            return;
        }

        if (!PUSHCUT_URL) throw new Error("Pushcut URL not configured");

        const response = await fetch(PUSHCUT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: { number: phone } }),
        });

        if (response.ok) {
            const stats = getStats.get();
            updateStats.run(stats.total_managed + 1, stats.cold, stats.followups, stats.health);
            logSentEvent.run('success');
            updateContactStatus.run('followup', session.list_id, phone);
            addSessionLog.run(session.id, `Success: ${phone}`, "success");
        } else {
            logSentEvent.run('error');
            addSessionLog.run(session.id, `Failed: ${phone} - Status ${response.status}`, "error");
        }
    }
}

// Singleton Worker
export const worker = new SessionWorker();
