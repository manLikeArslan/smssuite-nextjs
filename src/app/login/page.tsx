"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { success, error: toastError } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                success("Authentication established.");
                router.push("/");
                router.refresh();
            } else {
                toastError("Invalid secure protocol key");
            }
        } catch (err) {
            toastError("System connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-creamy flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-[440px] space-y-12">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/40 backdrop-blur-md rounded-[2rem] border border-navy/[0.08] flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="w-8 h-8 text-navy/40" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-navy uppercase">SMS Suite</h1>
                        <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.3em]">Secure Access Required</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Secure Key"
                                autoFocus
                                className={cn(
                                    "w-full bg-white/40 backdrop-blur-sm border border-navy/[0.05] focus:border-navy/10 focus:ring-4 focus:ring-navy/5 rounded-[1.5rem] py-5 px-6 text-sm font-bold text-navy outline-none transition-all placeholder:text-navy/20"
                                )}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-navy/20">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full py-5 bg-navy text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-navy/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize"}
                    </button>
                </form>

                <p className="text-center text-[9px] font-bold text-navy/20 uppercase tracking-[0.4em] pt-12">
                    &copy; 2024 SMSSUITE Systems
                </p>
            </div>
        </div>
    );
}
