'use client';

import { useState } from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [patientId, setPatientId] = useState('123'); // Default to trial user
    const [reason, setReason] = useState('LAB_REPORT_READY');
    const [location, setLocation] = useState('Counter 4 (Lab)');

    const handleCall = async () => {
        setLoading(true);
        setStatus('Initiating call...');

        try {
            const response = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenant_id: 'test-hospital',
                    patient: {
                        id: patientId,
                        name: 'Rayan',
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
                setStatus(`Success: ${data.message} (Job Queued)`);
            } else {
                setStatus(`Error: ${data.error || 'Request failed'}`);
            }
        } catch (err: any) {
            setStatus(`System Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
            <div className="z-10 max-w-lg w-full font-mono text-sm">
                <div className="bg-white shadow-xl rounded-lg p-8 w-full border border-gray-200">
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-bold text-gray-800">
                            K-Voice Console
                        </h1>
                        <p className="text-gray-500 mt-2">Patient Notification System / Bolna.ai</p>
                    </div>

                    <div className="space-y-6">

                        {/* Patient Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Verified Patient</label>
                            <select
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
                            >
                                <option value="123">Rayan (+91 9611554809)</option>
                                <option value="999" disabled>More patients (Upgrade Plan)</option>
                            </select>
                        </div>

                        {/* Reason Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
                            >
                                <option value="LAB_REPORT_READY">Lab Report Ready</option>
                                <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
                                <option value="BILL_PAYMENT_PENDING">Bill Payment Pending</option>
                                <option value="DISCHARGE_SUMMARY_READY">Discharge Summary Ready</option>
                                <option value="DOCTOR_ROUND_STARTING">Doctor Round Starting</option>
                            </select>
                        </div>

                        {/* Location Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Report To Location</label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
                            >
                                <option value="Counter 4 (Lab)">Counter 4 (Lab)</option>
                                <option value="Counter 1 (Reception)">Counter 1 (Reception)</option>
                                <option value="Room 101">Room 101</option>
                                <option value="Room 202">Room 202</option>
                                <option value="Emergency Ward">Emergency Ward</option>
                                <option value="Pharmacy">Pharmacy</option>
                            </select>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleCall}
                            disabled={loading}
                            className={`w-full py-4 px-4 rounded-md text-white font-bold text-lg transition-transform transform active:scale-95 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 shadow-lg'
                                }`}
                        >
                            {loading ? '📡 Initiating...' : '📞 TRIGGER NOTIFICATION'}
                        </button>

                        {/* Status Display */}
                        {status && (
                            <div className={`mt-6 p-4 rounded-md border ${status.startsWith('Success')
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                <p className="font-semibold text-center">{status}</p>
                            </div>
                        )}

                    </div>
                </div>
                <p className="text-center text-gray-400 mt-8 text-xs">System running on Port 3000 (Web) & 3003 (Worker)</p>
            </div>
        </main>
    );
}
