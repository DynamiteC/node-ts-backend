import t from 'tap';
// @ts-ignore
import { buildApp } from '../dist/app.js';

t.test('App Security & Health', async (t) => {
  const app = await buildApp();

  t.teardown(async () => {
    await app.close();
  });

  t.test('Health Check', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    t.equal(response.statusCode, 200);
    const body = JSON.parse(response.payload);
    t.equal(body.status, 'ok');
  });

  t.test('Security Headers (Helmet)', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    // HSTS
    t.equal(response.headers['strict-transport-security'], 'max-age=31536000; includeSubDomains; preload');

    // CSP
    const csp = response.headers['content-security-policy'];
    t.ok(csp, 'CSP header should exist');
    // We check for string type explicitly to satisfy TS if needed, though tap handles it
    if (typeof csp === 'string') {
        t.match(csp, "default-src 'self'");
        t.match(csp, "object-src 'none'");
    }
  });

  t.test('Rate Limiting', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    // Rate limit headers should be present
    t.ok(response.headers['x-ratelimit-limit'], 'Rate limit limit header should exist');
    t.ok(response.headers['x-ratelimit-remaining'], 'Rate limit remaining header should exist');
    t.ok(response.headers['x-ratelimit-reset'], 'Rate limit reset header should exist');
  });
});
