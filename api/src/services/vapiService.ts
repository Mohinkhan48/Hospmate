import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const VAPI_API_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY as string;

export const initiateVapiCall = async (patientData: any, contextData: any, jobId: string) => {
    const { name, phone } = patientData;
    const { type, location } = contextData;

    // Kannada script mapping
    const scripts: Record<string, string> = {
        'LAB_REPORT_READY': `Namaskara ${name}, DScribe hospital inda karedheve. Nimma lab report ready ide. Dayavittu ${location} hatthira banni. Nimma uttara 'Baruttene' athava 'Horage iddene' endu heli.`,
        'APPOINTMENT_REMINDER': `Namaskara ${name}, Nimma appointment samaya dagide. Dayavittu ${location} ge banni.`
    };

    const script = scripts[type] || scripts['LAB_REPORT_READY'];

    try {
        const response = await axios.post(`${VAPI_API_URL}/call`, {
            customer: {
                number: phone,
                name: name
            },
            phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // Required for outbound
            metadata: { jobId },
            assistant: {
                name: 'K-Voice Kannada Assistant',
                firstMessage: script,
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-2-medical',
                    language: 'kn-IN'
                },
                voice: {
                    provider: 'elevenlabs',
                    voiceId: 'kn-IN-local-voice', // Select a warm local Kannada voice
                    model: 'eleven_multilingual_v2'
                },
                model: {
                    provider: 'openai',
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an automated assistant for DScribe Hospital. Speak only in Kannada. 
                            Objective: Inform patient relative ${name} about ${type} at ${location}. 
                            Logic: If the user says they are coming, set user_intent to ACKNOWLEDGED. If they say they aren't there, set to AWAY.`
                        }
                    ]
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('Vapi API Error:', error.response?.data || error.message);
        throw error;
    }
};
