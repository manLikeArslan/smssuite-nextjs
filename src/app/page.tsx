"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RotateCw,
  Send as SendIcon,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    total_managed: 0,
    cold: 0,
    followups: 0,
    health: 100
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy uppercase">Dashboard</h1>
          <p className="text-navy/60 mt-1">System is online</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2.5 rounded-xl hover:bg-navy/5 transition-colors disabled:opacity-50"
        >
          <RotateCw className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-4">Total Managed</p>
          <div className="flex items-baseline gap-4">
            <span className="text-9xl font-bold text-navy tracking-tighter">
              {stats.total_managed}
            </span>
            <span className="text-2xl text-navy/40 font-bold uppercase tracking-wide">Numbers</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <SendIcon className="w-5 h-5 text-navy/40" />
            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">New</p>
          </div>
          <p className="text-7xl font-bold text-navy">{stats.cold}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-navy/40" />
            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">Follow-ups</p>
          </div>
          <p className="text-7xl font-bold text-navy">{stats.followups}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-sm border border-navy/[0.1] rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Health</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-navy">All systems optimal</p>
            <div className="w-full bg-emerald-500/10 h-2 rounded-full overflow-hidden mt-2">
              <div className="w-full bg-emerald-500 h-full" />
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/send"
        className="inline-flex items-center gap-4 bg-navy text-creamy px-12 py-6 rounded-[2rem] hover:bg-navy-light transition-all duration-300 group shadow-xl shadow-navy/20 active:scale-95"
      >
        <span className="text-xl font-bold uppercase tracking-tight">Start Sending</span>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
