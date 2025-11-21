import type { FastifyInstance } from 'fastify';
import websocket, { type SocketStream } from '@fastify/websocket';
import { subscribeJob } from './jobStore.js';
import { subscribeJobEvents } from './jobEvents.js';

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
          unsubscribeEvents();
          connection.socket.close();
        }
      });

      const unsubscribeEvents = subscribeJobEvents(jobId, event => {
        connection.socket.send(JSON.stringify({ jobId, event }));
      });

      connection.socket.on('close', () => {
        unsubscribe();
        unsubscribeEvents();
      });
    },
  );
};
