'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Phone,
    Users,
    Settings,
    Activity,
    HelpCircle
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Priorities', icon: Activity, href: '/priorities', disabled: true },
    { label: 'Patient List', icon: Users, href: '/patients', disabled: true },
    { label: 'Call Logs', icon: Phone, href: '/logs', disabled: true },
    { label: 'Settings', icon: Settings, href: '/settings', disabled: true },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-950 border-r border-white/10 flex flex-col h-screen fixed left-0 top-0">
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-lg">K</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        K-Voice
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                    Main Menu
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.disabled ? '#' : item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5",
                                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                        >
                            <item.icon size={18} className={clsx(
                                "transition-colors",
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-white"
                            )} />
                            {item.label}
                            {item.disabled && (
                                <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    SOON
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <HelpCircle size={18} />
                    Support & Docs
                </button>
            </div>
        </aside>
    );
}
