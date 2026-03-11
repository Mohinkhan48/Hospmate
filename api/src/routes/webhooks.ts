import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';
import { sendWhatsAppNotification } from '../services/whatsappService';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const webhookRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.post('/webhooks/bolna', async (request: FastifyRequest, reply: FastifyReply) => {
        const signature = request.headers['x-bolna-secret'];
        if (process.env.BOLNA_WEBHOOK_SECRET && signature !== process.env.BOLNA_WEBHOOK_SECRET) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        const payload = request.body as any;
        console.log(`[Webhook] Received event: ${payload.event}`, JSON.stringify(payload, null, 2));

        const jobId = payload.user_data?.job_id;
        if (!jobId) {
            fastify.log.warn('[Webhook] No job_id in payload, ignoring');
            return reply.code(200).send();
        }

        const stateKey = `notification:state:${jobId}`;
        const assetsKey = `notification:assets:${jobId}`;

        // Handle different call events
        const event = payload.event?.toLowerCase();

        // CALL STARTED
        if (event === 'call_started' || event === 'call.started' || event === 'call_initiated') {
            await connection.set(stateKey, 'CALL_IN_PROGRESS');
            fastify.log.info(`[Webhook] Job ${jobId} - Call started`);
        }

        // CALL COMPLETED SUCCESSFULLY
        else if (event === 'call_completed' || event === 'call.completed') {
            const intent = payload.interaction_details?.user_intent?.toUpperCase();

            // 1. Capture Assets
            const assets = {
                transcript_summary: payload.data?.transcript_summary || payload.transcript_summary,
                transcript_uri: payload.data?.transcript_uri || payload.transcript_uri,
                audio_url: payload.data?.audio_url || payload.data?.recording_url || payload.audio_url || payload.recording_url || null
            };
            await connection.set(assetsKey, JSON.stringify(assets));

            // 2. Determine State based on Intent
            const POSITIVE_INTENTS = ['ACKNOWLEDGED', 'YES', 'CONFIRMED', 'COMING', 'INTERESTED'];
            const NEGATIVE_INTENTS = ['DENIED', 'NO', 'BUSY', 'NOT_INTERESTED', 'WRONG_NUMBER'];

            let finalState = 'COMPLETED_NO_ANSWER';
            if (POSITIVE_INTENTS.includes(intent)) {
                finalState = 'COMPLETED_AGREED';
            } else if (NEGATIVE_INTENTS.includes(intent)) {
                finalState = 'COMPLETED_DISAGREED';
            }

            await connection.set(stateKey, finalState);
            fastify.log.info(`[Webhook] Job ${jobId} finished with state ${finalState} (intent: ${intent})`);

            // 3. Escalation Logic (Only if NO ANSWER or explicitly required)
            if (finalState === 'COMPLETED_NO_ANSWER') {
                const jobDataRaw = await connection.get(`notification:data:${jobId}`);
                if (jobDataRaw) {
                    try {
                        const jobData = JSON.parse(jobDataRaw);
                        await sendWhatsAppNotification(jobData);
                        await connection.set(stateKey, 'WHATSAPP_SENT');
                        fastify.log.info(`[Escalation] WhatsApp sent for job ${jobId}`);
                    } catch (err: any) {
                        fastify.log.error(err);
                    }
                }
            }
        }

        // CALL FAILED / DECLINED / REJECTED
        else if (event === 'call_failed' || event === 'call.failed' ||
            event === 'call_declined' || event === 'call.declined' ||
            event === 'call_rejected' || event === 'call.rejected' ||
            event === 'call_busy' || event === 'call.busy' ||
            event === 'call_no_answer' || event === 'call.no_answer') {

            const reason = payload.reason || payload.error || 'Unknown';
            await connection.set(stateKey, 'CALL_FAILED');
            fastify.log.warn(`[Webhook] Job ${jobId} - Call failed/declined: ${reason}`);

            // Store failure reason as asset
            const failureAsset = {
                failure_reason: reason,
                event_type: event
            };
            await connection.set(assetsKey, JSON.stringify(failureAsset));
        }

        // UNKNOWN EVENT - Log for debugging
        else {
            fastify.log.warn(`[Webhook] Unknown event type: ${event} for job ${jobId}`);
        }

        return reply.code(200).send({ status: 'received' });
    });
};
