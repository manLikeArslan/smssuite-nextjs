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
import { useToast } from "@/components/Toast";
import { Sparkline } from "@/components/Sparkline";
import { GradientMesh } from "@/components/GradientMesh";

export default function Home() {
  const [stats, setStats] = useState({
    total_managed: 0,
    cold: 0,
    followups: 0,
    health: 100
  });
  const [heartbeatData, setHeartbeatData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, heartbeatRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/stats/heartbeat")
      ]);

      const statsData = await statsRes.json();
      const heartbeatData = await heartbeatRes.json();

      setStats(statsData);
      setHeartbeatData(heartbeatData.map((s: any) => s.count));
    } catch (e) {
      console.error(e);
      error("Failed to refresh dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 relative min-h-full">
      <GradientMesh />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter text-navy uppercase leading-none">Command Center</h1>
          <p className="text-navy/40 mt-2 font-medium italic uppercase tracking-[0.2em] text-[10px]">Active Protocol | System Online</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-navy/[0.05] hover:bg-white transition-all disabled:opacity-50 shadow-sm active:scale-95"
        >
          <RotateCw className={loading ? "animate-spin text-navy/40" : "text-navy"} size={24} />
        </button>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white/40 backdrop-blur-md border border-navy/[0.08] rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl shadow-navy/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <p className="text-xs font-bold text-navy/30 uppercase tracking-[0.3em]">Managed Contacts</p>
            <div className="flex items-baseline gap-4">
              <span className="text-[12rem] font-bold text-navy tracking-tighter leading-none">
                {stats.total_managed}
              </span>
              <span className="text-3xl text-navy/20 font-bold uppercase tracking-widest pb-6 italic">Active</span>
            </div>
          </div>

          <div className="pb-8 space-y-4 md:w-1/3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-navy/40 px-1">
              <span>Heartbeat (24h)</span>
              <span>{Math.max(...heartbeatData, 0)} Peak</span>
            </div>
            <div className="h-24 w-full flex items-end">
              <Sparkline data={heartbeatData} width={400} height={80} color="#0A0B1A" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-accent/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/40 backdrop-blur-md border border-navy/[0.08] rounded-[2.5rem] p-10 space-y-6 group hover:bg-white transition-all duration-500 shadow-xl shadow-navy/[0.02]">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-accent/20 rounded-2xl">
              <SendIcon className="w-6 h-6 text-navy" />
            </div>
            <ArrowRight className="w-5 h-5 text-navy/10 group-hover:text-navy/40 transition-colors" />
          </div>
          <div>
            <p className="text-7xl font-bold text-navy tracking-tighter">{stats.cold}</p>
            <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mt-2">New Targets</p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-navy/[0.08] rounded-[2.5rem] p-10 space-y-6 group hover:bg-white transition-all duration-500 shadow-xl shadow-navy/[0.02]">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-accent/20 rounded-2xl">
              <Clock className="w-6 h-6 text-navy" />
            </div>
            <ArrowRight className="w-5 h-5 text-navy/10 group-hover:text-navy/40 transition-colors" />
          </div>
          <div>
            <p className="text-7xl font-bold text-navy tracking-tighter">{stats.followups}</p>
            <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mt-2">Scheduled Re-runs</p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-navy/[0.08] rounded-[2.5rem] p-10 space-y-6 animate-in fade-in slide-in-from-right duration-700 shadow-xl shadow-navy/[0.02]">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/10 rounded-2xl relative">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Stable</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-5xl font-bold text-navy tracking-tighter">{stats.health}%</p>
              <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mt-2">Core Integrity</p>
            </div>
            <div className="w-full bg-navy/[0.03] h-2.5 rounded-full overflow-hidden border border-navy/[0.02]">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                style={{ width: `${stats.health}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 relative z-10">
        <Link
          href="/send"
          className="inline-flex items-center gap-6 bg-navy text-creamy px-16 py-8 rounded-[2.5rem] hover:bg-navy-light transition-all duration-500 group shadow-[0_20px_40px_-15px_rgba(10,11,26,0.2)] active:scale-95"
        >
          <span className="text-2xl font-bold uppercase tracking-tight">Initiate Protocol</span>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
}
