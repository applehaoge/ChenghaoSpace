import { FastifyRequest } from 'fastify';

const RUNNER_TOKEN = process.env.RUNNER_ACCESS_TOKEN;

export const assertRunnerAuthorized = (request: FastifyRequest) => {
  if (!RUNNER_TOKEN) return true;
  const header = request.headers.authorization;
  if (!header) {
    const err = new Error('Missing Authorization header');
    (err as any).statusCode = 401;
    throw err;
  }
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (token !== RUNNER_TOKEN) {
    const err = new Error('Invalid runner token');
    (err as any).statusCode = 403;
    throw err;
  }
  return true;
};
