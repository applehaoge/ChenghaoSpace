import type { FastifyInstance } from 'fastify';
import { getActiveVersion, getLessonById } from '../lessons/lessonRepository.js';
import { createLessonRunJob } from '../lessons/lessonRunService.js';

export const registerLessonRunRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/api/lessons/:lessonId/run', async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return reply.code(404).send({ errorCode: 'LESSON_NOT_FOUND', message: 'Lesson not found' });
    }

    const version = await getActiveVersion(lessonId);
    if (!version) {
      return reply
        .code(500)
        .send({ errorCode: 'LESSON_VERSION_MISSING', message: 'No active version for lesson' });
    }

    try {
      const { jobId } = await createLessonRunJob(version);
      return reply.code(202).send({
        jobId,
        runSource: 'lesson',
        lessonId,
        version: version.version,
      });
    } catch (err) {
      request.log.error({ err, lessonId, version: version.version }, 'Failed to start lesson run');
      return reply.code(500).send({
        errorCode: 'LESSON_RUN_FAILED',
        message: 'Failed to start lesson run',
      });
    }
  });
};
