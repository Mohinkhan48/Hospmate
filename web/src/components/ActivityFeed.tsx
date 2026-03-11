'use client';

import { Phone, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface ActivityFeedProps {
    status: string | null;
    assets: any;
}

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
    'CALL_INITIATED': { label: 'Initiated Call', color: 'text-blue-400', icon: Phone },
    'CALL_IN_PROGRESS': { label: 'Call in Progress', color: 'text-indigo-400', icon: Phone },
    'COMPLETED_AGREED': { label: 'Patient Agreed', color: 'text-emerald-400', icon: CheckCircle },
    'COMPLETED_DISAGREED': { label: 'Patient Declined', color: 'text-rose-400', icon: XCircle },
    'COMPLETED_NO_ANSWER': { label: 'No Answer', color: 'text-orange-400', icon: AlertTriangle },
    'CALL_FAILED': { label: 'Call Failed', color: 'text-rose-500', icon: XCircle },
    'CALL_TIMEOUT': { label: 'Timeout', color: 'text-orange-500', icon: Clock },
};

export function ActivityFeed({ status, assets }: ActivityFeedProps) {
    if (!status) return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <ActivityIcon size={32} className="mb-2 opacity-50" />
            <p>No recent activity</p>
        </div>
    );

    const config = STATUS_CONFIG[status] || { label: status, color: 'text-slate-400', icon: ActivityIcon };
    const Icon = config.icon;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Live Activity</h3>

            <div
                className="relative pl-8 border-l border-white/10 space-y-8"
            >
                {/* Current Item */}
                <div className="relative">
                    <span className={`absolute -left-[39px] w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center ${config.color}`}>
                        <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
                    </span>

                    <div className="glass p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <h4 className={`font-semibold ${config.color}`}>{config.label}</h4>
                                <span className="text-xs text-slate-500">Just now</span>
                            </div>
                        </div>

                        {/* Assets Display */}
                        {assets && (
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                {assets.transcript_summary && (
                                    <div className="bg-black/20 p-3 rounded-lg text-sm text-slate-300">
                                        "{assets.transcript_summary}"
                                    </div>
                                )}
                                {assets.audio_url && (
                                    <audio controls src={assets.audio_url} className="w-full h-8 mt-2 opacity-80 hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
