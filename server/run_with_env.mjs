// Temporary runner to set env vars then import built server
process.env.PORT = process.env.PORT || '8300';
process.env.OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'http://localhost:8082';
// keep OPENAI_API_KEY from environment
console.log('Starting server with PORT=' + process.env.PORT + ' OPENAI_API_BASE=' + process.env.OPENAI_API_BASE);
import('./dist/index.js').catch(err => { console.error('Failed to start server:', err); process.exit(1); });
