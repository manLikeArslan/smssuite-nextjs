"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Info,
    Send as SendIcon,
    Play,
    Settings2,
    ShieldAlert,
    History,
    RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

type Mode = "new" | "followup";

export default function SendPage() {
    const [mode, setMode] = useState<Mode>("new");
    const [isTestMode, setIsTestMode] = useState(true);
    const [lists, setLists] = useState<any[]>([]);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [sendLimit, setSendLimit] = useState<number>(0);
    const [countdown, setCountdown] = useState<number>(0);
    const [totalDelay, setTotalDelay] = useState<number>(0);
    const [isSending, setIsSending] = useState(false);
    const [logs, setLogs] = useState<Array<{ time: string, msg: string, type: 'error' | 'success' | 'info' }>>([]);
    const [progress, setProgress] = useState(0);
    const { success, error, info } = useToast();

    // Persistence: Load Preferences on mount
    useEffect(() => {
        const savedListId = localStorage.getItem("sms_session_list_id");
        if (savedListId) setSelectedListId(savedListId);

        const savedMode = localStorage.getItem("sms_session_mode");
        if (savedMode) setMode(savedMode as Mode);

        const savedTestMode = localStorage.getItem("sms_session_test_mode");
        if (savedTestMode !== null) setIsTestMode(savedTestMode === "true");

        fetch("/api/lists").then(res => res.json()).then(data => setLists(data));
    }, []);

    // Polling Logic: Synchronize with Server Session
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch("/api/send/status");
                const data = await res.json();

                if (data.status === 'active') {
                    setIsSending(true);
                    if (data.logs) setLogs(data.logs);
                    setProgress(data.progress || 0);
                    if (data.totalCount) setSendLimit(data.totalCount);
                    if (data.listId) setSelectedListId(data.listId);
                    if (data.mode) setMode(data.mode);
                    setIsTestMode(data.isTestMode);
                } else if (data.status === 'completed') {
                    setIsSending(false);
                    if (data.logs) setLogs(data.logs);
                    setProgress(data.progress || data.totalCount);
                } else {
                    setIsSending(false);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        poll(); // Initial check
        const interval = setInterval(poll, 4000); // Poll every 4s
        return () => clearInterval(interval);
    }, []);

    // Persistence: Save Preferences only
    useEffect(() => {
        localStorage.setItem("sms_session_list_id", selectedListId);
    }, [selectedListId]);

    useEffect(() => {
        localStorage.setItem("sms_session_mode", mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem("sms_session_test_mode", String(isTestMode));
    }, [isTestMode]);

    const selectedList = useMemo(() => lists.find(l => l.id === selectedListId), [lists, selectedListId]);

    // Update sendLimit when selectedList changes
    useEffect(() => {
        if (selectedList) {
            setSendLimit(selectedList.count);
        } else {
            setSendLimit(0);
        }
    }, [selectedList]);

    const startSession = async () => {
        if (!selectedListId) {
            error("No active list selected");
            return;
        }

        setIsSending(true);
        info("Initializing background protocol...");

        try {
            const res = await fetch("/api/send/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listId: selectedListId,
                    mode,
                    isTestMode,
                    totalCount: sendLimit
                })
            });

            const data = await res.json();
            if (res.ok) {
                success("Server worker engaged.");
            } else {
                error(data.error || "Execution failed");
                setIsSending(false);
            }
        } catch (e) {
            error("Connection failed");
            setIsSending(false);
        }
    };

    const stopSession = async () => {
        if (!confirm("Terminate the active background protocol?")) return;

        try {
            const res = await fetch("/api/send/status", { method: "DELETE" });
            if (res.ok) {
                success("Signal sent to stop worker.");
            }
        } catch (e) {
            error("Failed to reach worker.");
        }
    };

    const clearSession = () => {
        if (confirm("Clear local monitor history? This will not affect the database.")) {
            // Note: In server-side mode, this just clears the UI until the next poll.
            // If the user wants to clear server logs, we'd need another endpoint.
            setLogs([]);
            success("Local view cleared.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-navy uppercase leading-none">Protocol Send</h1>
                <p className="text-navy/60 mt-2 font-medium italic text-xs uppercase tracking-widest">Stateful Messaging Interface</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Control Panel */}
                <div className="lg:col-span-12 xl:col-span-5 bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2.5rem] p-8 md:p-10 space-y-8">

                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] px-2">Active List</p>
                        <select
                            value={selectedListId}
                            onChange={(e) => setSelectedListId(e.target.value)}
                            disabled={isSending}
                            className="w-full bg-accent/20 border border-navy/[0.05] rounded-2xl p-4 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5 appearance-none cursor-pointer"
                        >
                            <option value="">Select a list...</option>
                            {lists.map(l => (
                                <option key={l.id} value={l.id}>{l.name} ({l.count} total)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-accent/30 p-1.5 rounded-2xl flex col-span-2">
                            <button
                                disabled={isSending}
                                onClick={() => setMode("new")}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-widest",
                                    mode === "new" ? "bg-white text-navy shadow-lg" : "text-navy/40 hover:text-navy"
                                )}
                            >
                                New
                            </button>
                            <button
                                disabled={isSending}
                                onClick={() => setMode("followup")}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-widest",
                                    mode === "followup" ? "bg-white text-navy shadow-lg" : "text-navy/40 hover:text-navy"
                                )}
                            >
                                Follow-up
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-accent/20 rounded-[1.5rem] border border-navy/[0.05] col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl border border-navy/[0.05] shadow-sm">
                                    <ShieldAlert className="w-4 h-4 text-navy/40" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-navy uppercase tracking-tight">Test Mode</p>
                                    <p className="text-[9px] text-navy/40 font-bold uppercase tracking-widest">No real texts</p>
                                </div>
                            </div>
                            <button
                                disabled={isSending}
                                onClick={() => setIsTestMode(!isTestMode)}
                                className={cn(
                                    "w-12 h-6 px-1 rounded-full flex items-center transition-colors duration-200 relative",
                                    isTestMode ? "bg-navy" : "bg-navy/20"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm",
                                    isTestMode ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">{mode} Queue</p>
                            <p className="text-[10px] font-bold text-navy/40 uppercase">Initial: {selectedList?.count || 0}</p>
                        </div>
                        <div className="bg-accent/20 rounded-[2.5rem] p-10 border border-navy/[0.05] relative group overflow-hidden flex items-center justify-center">
                            <div className="relative z-10 flex items-center gap-2">
                                <input
                                    type="number"
                                    value={sendLimit}
                                    onChange={(e) => setSendLimit(parseInt(e.target.value) || 0)}
                                    disabled={isSending || !selectedListId}
                                    className="bg-transparent text-8xl font-bold text-navy tracking-tighter w-[3ch] text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-5 scale-150 rotate-12">
                                <SendIcon className="w-24 h-24 text-navy" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={isSending ? undefined : startSession}
                            disabled={isSending || !selectedListId || sendLimit <= 0}
                            className={cn(
                                "w-full py-7 rounded-[2rem] font-bold text-xl flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 uppercase tracking-tighter relative overflow-hidden",
                                isSending ? "bg-navy/10 text-navy cursor-default" : "bg-navy text-white hover:bg-navy-light shadow-navy/20"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {isSending ? <RotateCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                                <span>{isSending ? "Active Stream" : "Start Protocol"}</span>
                            </div>
                            {isSending && progress > 0 && (
                                <p className="text-[10px] font-bold opacity-40">Progress: {Math.round((progress / sendLimit) * 100)}% ({progress}/{sendLimit})</p>
                            )}
                            {isSending && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-navy/20 transition-all duration-500"
                                    style={{ width: `${(progress / sendLimit) * 100}%` }}
                                />
                            )}
                        </button>

                        {isSending && (
                            <button
                                onClick={stopSession}
                                className="w-full py-4 rounded-3xl border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/5 transition-colors"
                            >
                                Stop Protocol
                            </button>
                        )}
                    </div>
                </div>

                {/* Logs Panel */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2.5rem] p-8 md:p-10 flex flex-col h-[720px] relative overflow-hidden shadow-2xl shadow-navy/5">
                    {/* Progress Bar (Server Side) */}
                    {isSending && (
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-navy/5 overflow-hidden z-20">
                            <div
                                className="h-full bg-navy transition-all duration-1000 ease-out rounded-r-full"
                                style={{ width: `${(progress / sendLimit) * 100}%` }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between pb-8 border-b border-navy/[0.1] mb-8">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-navy/40" />
                            <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.3em]">Execution Monitor</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isSending && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-navy/5 rounded-full animate-pulse">
                                    <RotateCw className="w-3 h-3 text-navy animate-spin" />
                                    <span className="text-[10px] font-bold text-navy uppercase tracking-widest">Server-side Loop</span>
                                </div>
                            )}
                            <button
                                onClick={clearSession}
                                className="text-[10px] font-bold text-navy/30 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Clear View
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                        {logs.map((log, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-5 rounded-3xl flex items-start gap-4 transition-all duration-300 animate-in slide-in-from-bottom-2",
                                    log.type === 'error' ? "bg-red-500/5 text-red-700 border border-red-500/10" :
                                        log.type === 'success' ? "bg-emerald-500/5 text-emerald-700 border border-emerald-500/10" :
                                            "bg-navy/5 text-navy/60 border border-navy/5"
                                )}
                            >
                                <span className="text-[10px] font-bold mt-1 opacity-40 font-mono">{log.time}</span>
                                <p className="text-sm font-bold tracking-tight leading-relaxed">{log.msg}</p>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-navy/10">
                                <div className="p-6 bg-navy/5 rounded-full mb-4">
                                    <SendIcon size={40} className=" opacity-20" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">Idle</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
