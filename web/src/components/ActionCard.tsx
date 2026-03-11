'use client';

import { useState } from 'react';
import { Phone, User, MapPin, FileText, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

interface ActionCardProps {
    onTrigger: (patientId: string, reason: string, location: string) => Promise<void>;
    loading: boolean;
    callState: string | null;
}

export function ActionCard({ onTrigger, loading, callState }: ActionCardProps) {
    const [patientId, setPatientId] = useState('123');
    const [reason, setReason] = useState('LAB_REPORT_READY');
    const [location, setLocation] = useState('Counter 4 (Lab)');

    const handleSubmit = () => {
        if (!loading) {
            onTrigger(patientId, reason, location);
        }
    };

    return (
        <div
            className="glass p-6 rounded-2xl border-t border-white/10"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Phone size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Trigger Notification</h2>
                    <p className="text-sm text-slate-400">Initiate a customized voice call</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Patient Select */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Verified Patient</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <select
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all hover:bg-slate-900/70"
                            >
                                <option value="123">Rayan (+91 9611554809)</option>
                                <option value="999" disabled>More patients (Upgrade Plan)</option>
                            </select>
                        </div>
                    </div>

                    {/* Reason Select */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Reason</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all hover:bg-slate-900/70"
                            >
                                <option value="LAB_REPORT_READY">Lab Report Ready</option>
                                <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
                                <option value="BILL_PAYMENT_PENDING">Bill Payment Pending</option>
                                <option value="DISCHARGE_SUMMARY_READY">Discharge Summary Ready</option>
                                <option value="DOCTOR_ROUND_STARTING">Doctor Round Starting</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Select */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Report To</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all hover:bg-slate-900/70"
                            >
                                <option value="Counter 4 (Lab)">Counter 4 (Lab)</option>
                                <option value="Counter 1 (Reception)">Counter 1 (Reception)</option>
                                <option value="Room 101">Room 101</option>
                                <option value="Room 202">Room 202</option>
                                <option value="Emergency Ward">Emergency Ward</option>
                                <option value="Pharmacy">Pharmacy</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading && !callState}
                        className={clsx(
                            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 hover:scale-[1.02]",
                            loading
                                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing Call...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                TRIGGER NOTIFICATION
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
