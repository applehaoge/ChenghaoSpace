import websocket from '@fastify/websocket';
import { subscribeJob } from './jobStore.js';
export const registerJobStreamRoute = async (fastify) => {
    await fastify.register(websocket);
    fastify.get('/api/run/:jobId/stream', { websocket: true }, (connection, req) => {
        const { jobId } = req.params;
        const unsubscribe = subscribeJob(jobId, job => {
            connection.socket.send(JSON.stringify({ jobId, job }));
            if (['succeeded', 'failed', 'cancelled'].includes(job.status)) {
                unsubscribe();
                connection.socket.close();
            }
        });
        connection.socket.on('close', () => {
            unsubscribe();
        });
    });
};
