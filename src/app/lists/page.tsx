"use client";

import { useState, useEffect, useRef } from "react";
import {
    Database,
    Plus,
    FileText,
    Trash2,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

interface SMSList {
    id: string;
    name: string;
    count: number;
    createdAt: string;
}

export default function ListsPage() {
    const [lists, setLists] = useState<SMSList[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualListName, setManualListName] = useState("");
    const [manualNumbersRaw, setManualNumbersRaw] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLists = async () => {
        try {
            const res = await fetch("/api/lists");
            const data = await res.json();
            setLists(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        Papa.parse(file, {
            complete: async (results) => {
                const numbers = results.data
                    .map((row: any) => (Array.isArray(row) ? row[0] : row.phone || row.number || row[0]))
                    .filter((n: any) => n && typeof n === 'string' && n.trim().length > 5)
                    .map((n: string) => n.trim());

                if (numbers.length > 0) {
                    try {
                        await fetch("/api/lists", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: file.name.replace(".csv", ""),
                                numbers
                            })
                        });
                        await fetchLists();
                    } catch (e) {
                        console.error(e);
                    }
                }
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            header: false,
            skipEmptyLines: true
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numbers = manualNumbersRaw
            .split("\n")
            .map(n => n.trim())
            .filter(n => n.length > 5);

        if (!manualListName.trim() || numbers.length === 0) {
            alert("Please provide a name and at least one valid number.");
            return;
        }

        setUploading(true);
        try {
            const res = await fetch("/api/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: manualListName.trim(),
                    numbers
                })
            });
            const data = await res.json();
            if (data.error) {
                alert(data.error);
            } else {
                await fetchLists();
                setIsManualModalOpen(false);
                setManualListName("");
                setManualNumbersRaw("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteList = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this list? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/lists/${id}`, { method: "DELETE" });
            if (res.ok) fetchLists();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-navy uppercase">Numbers</h1>
                    <p className="text-navy/60 mt-1 font-medium italic">Manage your campaign lists</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="p-4 bg-white border border-navy/[0.08] text-navy rounded-2xl hover:bg-white/80 transition-all shadow-sm active:scale-95"
                        title="Manual Entry"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-4 bg-navy text-creamy rounded-2xl hover:bg-navy-light transition-all shadow-xl shadow-navy/20 active:scale-95 disabled:opacity-50"
                        title="Upload CSV"
                    >
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv"
                    className="hidden"
                />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-navy/20 animate-spin" />
                </div>
            ) : lists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            className="bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2rem] p-8 space-y-6 group hover:bg-white/60 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-accent/30 rounded-2xl">
                                    <FileText className="w-6 h-6 text-navy" />
                                </div>
                                <button
                                    onClick={(e) => handleDeleteList(list.id, e)}
                                    className="p-2 text-navy/20 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-navy truncate">{list.name}</h3>
                                <p className="text-sm font-bold text-navy/40 uppercase tracking-widest mt-1">
                                    {new Date(list.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-4xl font-bold text-navy tracking-tighter">{list.count}</p>
                                    <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">Numbers</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Ready</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 min-h-[500px] border-2 border-dashed border-navy/[0.08] rounded-[3rem] bg-white/[0.15] flex flex-col items-center justify-center p-12 group transition-colors hover:bg-white/[0.2] hover:border-navy/[0.12]">
                    <div className="relative mb-10">
                        <div className="p-8 bg-creamy-darker rounded-[2.5rem] border border-navy/[0.05] relative z-10">
                            <Database className="w-16 h-16 text-navy/20" />
                        </div>
                        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    </div>

                    <div className="text-center space-y-3 max-w-sm mx-auto">
                        <h3 className="text-2xl font-bold text-navy uppercase tracking-tight">No Lists Yet</h3>
                        <p className="text-sm font-medium text-navy/40 leading-relaxed italic">
                            Upload a CSV file or add numbers manually to start managing your campaigns.
                        </p>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            onClick={() => setIsManualModalOpen(true)}
                            className="px-10 py-5 bg-white border border-navy/[0.08] text-navy rounded-[1.5rem] font-bold shadow-sm hover:shadow-xl transition-all active:scale-[0.98] uppercase text-sm tracking-widest"
                        >
                            Manual Entry
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-10 py-5 bg-navy text-creamy rounded-[1.5rem] font-bold shadow-xl shadow-navy/20 hover:bg-navy-light transition-all active:scale-[0.98] uppercase text-sm tracking-widest"
                        >
                            Upload CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Manual Entry Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-navy/20 backdrop-blur-md"
                        onClick={() => setIsManualModalOpen(false)}
                    />
                    <div className="relative bg-creamy w-full max-w-xl rounded-[3rem] shadow-2xl border border-white p-10 space-y-8 animate-in fade-in zoom-in duration-300">
                        <div>
                            <h2 className="text-3xl font-bold text-navy uppercase tracking-tight">Manual Entry</h2>
                            <p className="text-navy/60 font-medium italic">Create a new list manually</p>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] ml-2">List Name</label>
                                <input
                                    type="text"
                                    required
                                    value={manualListName}
                                    onChange={(e) => setManualListName(e.target.value)}
                                    placeholder="e.g. Special Outreach"
                                    className="w-full p-6 bg-white border border-navy/[0.08] rounded-3xl outline-none focus:ring-2 focus:ring-navy/10 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] ml-2">Numbers (one per line)</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={manualNumbersRaw}
                                    onChange={(e) => setManualNumbersRaw(e.target.value)}
                                    placeholder="+1234567890&#10;+0987654321"
                                    className="w-full p-6 bg-white border border-navy/[0.08] rounded-[2rem] outline-none focus:ring-2 focus:ring-navy/10 transition-all font-mono text-sm resize-none"
                                />
                                <p className="text-[10px] font-bold text-navy/30 italic text-right mr-2 uppercase tracking-wide">
                                    Total: {manualNumbersRaw.split("\n").filter(n => n.trim().length > 5).length} valid numbers
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="flex-1 p-5 border border-navy/[0.08] text-navy rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-navy/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] p-5 bg-navy text-creamy rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-navy-light transition-all shadow-xl shadow-navy/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>Create List</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
