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
        const jobId = payload.user_data?.job_id;

        if (!jobId) return reply.code(200).send();

        const stateKey = `notification:state:${jobId}`;

        // Bolna typically sends a "call_completed" or similar event
        // We'll map their interaction data to our states
        if (payload.event === 'call_completed') {
            const intent = payload.interaction_details?.user_intent;
            if (intent === 'ACKNOWLEDGED' || intent === 'Coming') {
                await connection.set(stateKey, 'COMPLETED_CONFIRMED');
            } else {
                await connection.set(stateKey, 'COMPLETED_NO_ANSWER');

                // Escalation Logic: Trigger WhatsApp if no positive confirmation
                const jobDataRaw = await connection.get(`notification:data:${jobId}`);
                if (jobDataRaw) {
                    try {
                        const jobData = JSON.parse(jobDataRaw);
                        await sendWhatsAppNotification(jobData);
                        await connection.set(stateKey, 'WHATSAPP_SENT');
                        fastify.log.info(`[Escalation] WhatsApp sent for job ${jobId} due to Bolna call outcome`);
                    } catch (err: any) {
                        fastify.log.error(err);
                    }
                }
            }
        } else if (payload.event === 'call_started') {
            await connection.set(stateKey, 'CALL_IN_PROGRESS');
        }

        return reply.code(200).send({ status: 'received' });
    });
};
