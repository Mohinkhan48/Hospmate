import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendWhatsAppNotification = async (data: any) => {
    const { patient, context } = data;

    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
    const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    try {
        const templateMap: Record<string, string> = {
            'LAB_REPORT_READY': 'k_voice_lab_report',
            'APPOINTMENT_REMINDER': 'k_voice_appointment'
        };

        const response = await axios.post(WHATSAPP_API_URL, {
            messaging_product: 'whatsapp',
            to: patient.phone,
            type: 'template',
            template: {
                name: templateMap[context.type] || 'k_voice_notification',
                language: {
                    code: 'kn'
                },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: patient.name },
                            { type: 'text', text: context.location }
                        ]
                    }
                ]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        throw error;
    }
};
