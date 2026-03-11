'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { ActionCard } from '@/components/ActionCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Phone, CheckCircle, Clock, BarChart3 } from 'lucide-react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [callState, setCallState] = useState<string | null>(null);
    const [assets, setAssets] = useState<any>(null);

    // Dashboard Stats (Mock Data for Visual)
    const stats = [
        { label: 'Total Calls Today', value: '42', icon: Phone, color: 'indigo' as const, trend: '+12%', trendUp: true },
        { label: 'Success Rate', value: '94%', icon: CheckCircle, color: 'emerald' as const, trend: '+4%', trendUp: true },
        { label: 'Avg. Duration', value: '1m 24s', icon: Clock, color: 'violet' as const, trend: '-12s', trendUp: false },
        { label: 'Pending Response', value: '3', icon: BarChart3, color: 'rose' as const, trend: '2 urgent', trendUp: false },
    ];

    const handleCall = async (patientId: string, reason: string, location: string) => {
        setLoading(true);
        setStatus('Initiating call...');
        setCallState('CALL_INITIATED');
        setAssets(null);
        setJobId(null);

        try {
            const response = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: 'test-hospital',
                    patient: {
                        id: patientId,
                        name: 'Rayan', // In a real app, fetch name based on ID
                        phone: '+919611554809' // Hardcoded for verified trial
                    },
                    context: {
                        type: reason,
                        location: location,
                        language: 'kn-IN'
                    },
                    metadata: {
                        callback_url: 'http://test.com'
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(`Success: ${data.message}`);
                if (data.jobId) {
                    setJobId(data.jobId);
                }
            } else {
                setStatus(`Error: ${data.error || 'Request failed'}`);
                setCallState('CALL_FAILED');
                setLoading(false);
            }
        } catch (err: any) {
            setStatus(`System Error: ${err.message}`);
            setCallState('CALL_FAILED');
            setLoading(false);
        }
    };

    // Polling Logic with Timeout Protection
    useEffect(() => {
        if (!jobId) return;

        let pollCount = 0;
        const MAX_POLLS = 60; // 60 polls × 3 seconds = 3 minutes max

        // Primary Poll (Local State)
        const interval = setInterval(async () => {
            pollCount++;

            // Timeout protection - stop after 3 minutes
            if (pollCount >= MAX_POLLS) {
                console.warn(`[Polling] Timeout reached for job ${jobId}`);
                setCallState('CALL_TIMEOUT');
                setLoading(false);
                clearInterval(interval);
                return;
            }

            try {
                const res = await fetch(`/api/status?jobId=${jobId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCallState(data.status);

                    if (data.assets) {
                        setAssets(data.assets);
                    }

                    // Stop polling if final state reached (including failures)
                    const terminalStates = [
                        'COMPLETED_AGREED',
                        'COMPLETED_DISAGREED',
                        'COMPLETED_NO_ANSWER',
                        'WHATSAPP_SENT',
                        'CALL_FAILED',
                        'CALL_TIMEOUT'
                    ];

                    if (terminalStates.includes(data.status)) {
                        console.log(`[Polling] Terminal state reached: ${data.status}`);
                        setLoading(false);
                        clearInterval(interval);
                        clearInterval(syncInterval); // Stop sync polling too
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000); // Poll every 3 seconds

        // Secondary Poll (Sync with Bolna) - Solves Localhost Webhook Issue
        const syncInterval = setInterval(async () => {
            try {
                // This forces the backend to ask Bolna "Is the call done?"
                await fetch(`/api/sync-status?jobId=${jobId}`);
            } catch (e) {
                console.error("Sync error", e);
            }
        }, 5000); // Sync every 5 seconds

        return () => {
            clearInterval(interval);
            clearInterval(syncInterval);
        };
    }, [jobId]);

    return (
        <div className="space-y-8">
            {/* Header / Stats Section */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
                    Dashboard Overview
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <StatsCard key={i} {...stat} delay={i * 0.1} />
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <ActionCard
                        onTrigger={handleCall}
                        loading={loading}
                        callState={callState}
                    />
                </div>

                {/* Right Column: Live Feed */}
                <div className="space-y-6">
                    <ActivityFeed status={callState} assets={assets} />
                </div>
            </div>
        </div>
    );
}
