import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import process from 'process';
import { notifyRoutes } from './routes/notify';
import { webhookRoutes } from './routes/webhooks';
import { syncStatusRoutes } from './routes/syncStatus';
import { startWorker } from './workers/notificationWorker';

const fastify = Fastify({
    logger: true
});

// Basic info
fastify.get('/', async () => {
    return {
        name: 'K-Voice API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            notify: '/v1/notify'
        }
    };
});

// Health check
fastify.get('/health', async (request: any, reply: any) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(notifyRoutes, { prefix: '/v1' });
fastify.register(webhookRoutes, { prefix: '/v1' });
fastify.register(syncStatusRoutes, { prefix: '/v1' });

const start = async () => {
    try {
        startWorker();
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

start();
