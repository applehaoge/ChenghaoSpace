import type { FastifyInstance } from 'fastify';
import websocket, { type SocketStream } from '@fastify/websocket';
import { subscribeJob } from './jobStore.js';

export const registerJobStreamRoute = async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  fastify.get<{ Params: { jobId: string } }>(
    '/api/run/:jobId/stream',
    { websocket: true },
    (connection: SocketStream, req) => {
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
    },
  );
};
