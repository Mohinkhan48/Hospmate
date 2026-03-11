import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import Redis from 'ioredis';
import { queueNotification } from '../services/queueService';

const notifySchema = z.object({
    tenant_id: z.string(),
    patient: z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string()
    }),
    context: z.object({
        type: z.string(),
        location: z.string(),
        language: z.string().default('kn-IN')
    }),
    metadata: z.object({
        callback_url: z.string().url()
    })
});

export const notifyRoutes = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    fastify.post('/notify', async (request: FastifyRequest, reply: FastifyReply) => {
        const validation = notifySchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                error: 'Invalid request body',
                details: validation.error.format()
            });
        }

        const { tenant_id, patient, context, metadata } = validation.data;

        const jobId = Buffer.from(`${tenant_id}:${patient.phone}:${Date.now()}`).toString('base64');

        try {
            // Store data for webhook accessibility (PRD Escatalion requirement)
            const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
            await connection.setex(`notification:data:${jobId}`, 3600, JSON.stringify(validation.data));

            await queueNotification({ ...validation.data, id: jobId });
            fastify.log.info(`Queued notification request ${jobId} for ${patient.name}`);

            return reply.code(202).send({
                status: 'QUEUED',
                message: 'Notification trigger received and queued.',
                jobId: jobId
            });
        } catch (err: any) {
            fastify.log.error(err, `Failed to queue notification for job ${jobId}`);
            return reply.code(500).send({ error: 'Failed to queue notification' });
        }
    });

    fastify.get('/notify/:jobId/status', async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId } = request.params as { jobId: string };
        const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

        try {
            const state = await connection.get(`notification:state:${jobId}`);
            const data = await connection.get(`notification:data:${jobId}`); // Original request data
            const assets = await connection.get(`notification:assets:${jobId}`); // Transcript/Audio

            if (!state) {
                return reply.code(404).send({ error: 'Job not found' });
            }

            return reply.code(200).send({
                jobId,
                status: state,
                assets: assets ? JSON.parse(assets) : null
            });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to fetch status' });
        }
    });
};
