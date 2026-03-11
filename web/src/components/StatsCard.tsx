'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color: 'indigo' | 'violet' | 'emerald' | 'rose';
    delay?: number;
}

const COLOR_MAP = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export function StatsCard({ label, value, trend, trendUp, icon: Icon, color, delay = 0 }: StatsCardProps) {
    return (
        <div
            className="glass p-6 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={clsx("p-3 rounded-xl border backdrop-blur-md", COLOR_MAP[color])}>
                    <Icon size={20} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className={clsx(
                        "font-semibold px-1.5 py-0.5 rounded",
                        trendUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                        {trend}
                    </span>
                    <span className="text-slate-500">vs last month</span>
                </div>
            )}
        </div>
    );
}
