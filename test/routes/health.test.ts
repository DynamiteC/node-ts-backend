import t from 'tap';
import { buildApp } from '../../src/app.js';

t.test('Health Check', async (t) => {
  const app = await buildApp();

  t.teardown(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/api/health',
  });

  t.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  t.equal(body.status, 'ok');
  t.hasProp(body, 'services');
});
