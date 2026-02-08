import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notification-queue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    },
});

export const queueNotification = async (data: any) => {
    const jobId = data.id || `job_${Date.now()}`;
    await notificationQueue.add('trigger-notification', data, { jobId });
};
