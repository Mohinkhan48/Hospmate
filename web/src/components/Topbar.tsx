'use client';

import { Bell, HelpCircle, ChevronDown, User, Search } from 'lucide-react';

export function Topbar() {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 ml-64">
            {/* Breadcrumb / Search */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900 shadow-md">
                        DA
                    </div>
                    <div className="flex flex-col items-start mr-2">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Dr. Arjun</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cardiology</span>
                    </div>
                    <ChevronDown size={14} className="text-slate-500 mr-2" />
                </button>
            </div>
        </header>
    );
}
