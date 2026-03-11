import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { initiateBolnaCall } from '../services/bolnaService';
import { sendWhatsAppNotification } from '../services/whatsappService';

interface NotificationJobData {
    tenant_id: string;
    patient: {
        id: string;
        name: string;
        phone: string;
    };
    context: {
        type: string;
        location: string;
        language: string;
    };
    metadata: {
        callback_url: string;
    };
}

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const startWorker = () => {
    const worker = new Worker(
        'notification-queue',
        async (job: Job<NotificationJobData>) => {
            const { patient, context } = job.data;
            const stateKey = `notification:state:${job.id}`;

            try {
                console.log(`Processing job ${job.id} for patient ${patient.name}`);

                // Phase 2: Call Bolna.ai
                console.log(`[Bolna] Initiating call to ${patient.phone}`);
                const bolnaResponse = await initiateBolnaCall(patient, context, job.id as string);

                // Save Call ID for local polling/sync
                if (bolnaResponse && bolnaResponse.call_id) {
                    await connection.set(`notification:call_id:${job.id}`, bolnaResponse.call_id);
                    console.log(`[Bolna] Call ID saved: ${bolnaResponse.call_id}`);
                }

                // Initial state update - webhook will refine this to CALL_IN_PROGRESS
                await connection.set(stateKey, 'CALL_INITIATED');

                // Wait for a period or listen for state changes to decide on fallback
                // For demonstration/baseline we'll assume webhook handles finality
                // but we could implement a secondary check here.
            } catch (error: any) {
                // Check if we should skip fallback due to missing credentials
                if (process.env.WHATSAPP_API_KEY?.includes('your_whatsapp_key')) {
                    console.warn(`[SKIP] WhatsApp fallback skipped: Credentials are not configured in .env`);
                    throw error; // Re-throw the original Bolna error so we see it
                }

                console.error(`[CRITICAL] Bolna Call failed for ${patient.name}:`, error.response?.data || error.message);
                await connection.set(stateKey, 'WHATSAPP_SENT');

                try {
                    console.log(`[WhatsApp] Attempting fallback for ${patient.name}...`);
                    await sendWhatsAppNotification(job.data);
                    console.log(`[WhatsApp] Fallback SUCCESS for ${patient.name}`);
                } catch (wsError: any) {
                    console.error(`[CRITICAL] WhatsApp fallback FAILED:`, wsError.response?.data || wsError.message);
                    // We still throw so BullMQ knows the job "failed" overall
                    throw new Error(`Voice failed: ${error.message} && WhatsApp failed: ${wsError.message}`);
                }
            }
        },
        { connection }
    );

    worker.on('completed', (job: Job) => {
        console.log(`Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job: Job | undefined, err: Error) => {
        console.error(`Job ${job?.id} failed with error: ${err.message}`);
    });

    worker.on('error', (err: Error) => {
        console.error('Worker Error:', err);
    });

    console.log('Notification Worker Started');
};
