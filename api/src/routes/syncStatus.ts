import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';
import { getBolnaCallStatus } from '../services/bolnaService';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const syncStatusRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.get('/status/:jobId/sync', async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId } = request.params as { jobId: string };

        try {
            // 1. Get Call ID from Redis
            const callId = await connection.get(`notification:call_id:${jobId}`);

            if (!callId) {
                return reply.code(404).send({ error: 'Call ID not found or call not initiated yet' });
            }

            // 2. Poll Bolna for status
            console.log(`[Sync] Polling Bolna for Job ${jobId}, Call ID ${callId}`);
            const bolnaStatus = await getBolnaCallStatus(callId);

            // 3. Map Bolna Status to Our internal State
            // Bolna statuses: "queued", "calling", "completed", "failed", "busy", "no-answer"
            const status = bolnaStatus.status?.toLowerCase();
            const stateKey = `notification:state:${jobId}`;
            const assetsKey = `notification:assets:${jobId}`;

            let internalState = null;

            if (status === 'completed') {
                // Check intent if available
                const intent = bolnaStatus.user_data?.user_intent?.toUpperCase() ||
                    bolnaStatus.interaction_details?.user_intent?.toUpperCase();

                const POSITIVE_INTENTS = ['ACKNOWLEDGED', 'YES', 'CONFIRMED', 'COMING', 'INTERESTED'];
                const NEGATIVE_INTENTS = ['DENIED', 'NO', 'BUSY', 'NOT_INTERESTED', 'WRONG_NUMBER'];

                if (POSITIVE_INTENTS.includes(intent)) {
                    internalState = 'COMPLETED_AGREED';
                } else if (NEGATIVE_INTENTS.includes(intent)) {
                    internalState = 'COMPLETED_DISAGREED';
                } else {
                    internalState = 'COMPLETED_NO_ANSWER'; // Default if completed but no clear intent
                }

                // Save Assets
                const assets = {
                    transcript_summary: bolnaStatus.transcript_summary,
                    transcript_uri: bolnaStatus.transcript_uri,
                    audio_url: bolnaStatus.audio_url || bolnaStatus.recording_url
                };
                await connection.set(assetsKey, JSON.stringify(assets));

            } else if (status === 'failed' || status === 'declined' || status === 'stopped') {
                internalState = 'CALL_FAILED';
            } else if (status === 'busy' || status === 'no-answer') {
                internalState = 'COMPLETED_NO_ANSWER';
            }

            // 4. Update Redis if we have a terminal state
            if (internalState) {
                const currentState = await connection.get(stateKey);
                // Only update if not already in a terminal state
                if (currentState !== internalState && currentState !== 'WHATSAPP_SENT') {
                    await connection.set(stateKey, internalState);
                    console.log(`[Sync] Updated Job ${jobId} to ${internalState} from Bolna poller`);
                }
            }

            return reply.send({
                synced: true,
                bolnaStatus: status,
                internalState: internalState || 'IN_PROGRESS'
            });

        } catch (err: any) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to sync status' });
        }
    });
};
