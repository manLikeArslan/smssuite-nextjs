"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Send,
    ListOrdered,
    ShieldCheck,
    Wifi,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", icon: BarChart3 },
    { name: "Send", href: "/send", icon: Send },
    { name: "Lists", href: "/lists", icon: ListOrdered },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-creamy border-b">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-accent rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm leading-tight text-navy">SMS Manager</h1>
                        <p className="text-[10px] text-navy/60">V 1.0.0</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Main Sidebar */}
            <aside className={cn(
                "fixed md:sticky top-0 left-0 h-screen w-64 bg-creamy border-r p-6 flex flex-col z-50 transition-transform duration-300",
                !isOpen && "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Section */}
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-2.5 bg-accent/30 rounded-xl border border-navy/5">
                        <ShieldCheck className="w-6 h-6 text-navy" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-navy">SMS Manager</h1>
                        <p className="text-xs text-navy/40">V 1.0.0</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                                    isActive
                                        ? "bg-accent text-navy font-medium shadow-sm"
                                        : "text-navy/60 hover:bg-navy/5 hover:text-navy"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-navy" : "text-navy/60")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Section */}
                <div className="mt-auto p-4 bg-accent/20 rounded-2xl border border-navy/5">
                    <p className="text-[10px] uppercase tracking-wider text-navy/40 font-bold mb-2">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full blur-[2px]" />
                        </div>
                        <span className="text-xs font-semibold text-navy/80">System Online</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
