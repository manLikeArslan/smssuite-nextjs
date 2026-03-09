"use client";

import { useState, useEffect, useRef } from "react";
import {
    Database,
    Upload,
    Plus,
    FileText,
    Trash2,
    MoreVertical,
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
                // Assume CSV has phone numbers in first column or rows are just phone numbers
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
        <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-navy uppercase">Numbers</h1>
                    <p className="text-navy/60 mt-1 font-medium italic">Manage your campaign lists</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-4 bg-navy text-creamy rounded-2xl hover:bg-navy-light transition-all shadow-xl shadow-navy/20 active:scale-95 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                </button>
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
                            Upload a CSV file to start managing your numbers and launch automated campaigns.
                        </p>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-10 px-10 py-5 bg-white border border-navy/[0.08] text-navy rounded-[1.5rem] font-bold shadow-sm hover:shadow-xl transition-all active:scale-[0.98] uppercase text-sm tracking-widest"
                    >
                        Upload New List
                    </button>
                </div>
            )}
        </div>
    );
}
