import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOLNA_API_URL = 'https://api.bolna.ai/call';
export const initiateBolnaCall = async (patientData: any, contextData: any, jobId: string) => {
    const { name, phone } = patientData;
    const { location, type } = contextData;

    // Map the reason code to a human-readable string for the AI
    const REASON_MAP: Record<string, string> = {
        'LAB_REPORT_READY': 'Your Lab Report is ready to be collected',
        'APPOINTMENT_REMINDER': 'You have a doctor appointment scheduled',
        'BILL_PAYMENT_PENDING': 'You have a pending hospital bill payment',
        'DISCHARGE_SUMMARY_READY': 'Your discharge summary is ready',
        'DOCTOR_ROUND_STARTING': ' The doctor is starting rounds, please be available'
    };

    const callReason = REASON_MAP[type] || 'Important notification from the hospital';

    const BOLNA_API_KEY = process.env.BOLNA_API_KEY;
    const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID;

    const payload = {
        agent_id: BOLNA_AGENT_ID,
        recipient_phone_number: phone,
        user_data: {
            "patient_name": name,
            "room_location": location,
            "call_reason": callReason,
            "job_id": jobId
        }
    };

    try {
        console.log(`[Bolna] Sending Payload:`, JSON.stringify(payload.user_data, null, 2));
        const response = await axios.post(BOLNA_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${BOLNA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Response format: { "call_id": "...", "status": "queued", ... }
        return response.data;
    } catch (error: any) {
        console.error("Bolna API Error:", error.response?.data || error.message);
        throw new Error("Failed to initiate Bolna voice call");
    }
};

export const getBolnaCallStatus = async (callId: string) => {
    const BOLNA_API_KEY = process.env.BOLNA_API_KEY;

    try {
        const response = await axios.get(`${BOLNA_API_URL}/${callId}`, {
            headers: {
                'Authorization': `Bearer ${BOLNA_API_KEY}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Bolna Status API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch Bolna call status");
    }
};
