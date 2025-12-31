import t from 'tap';
import { createCircuitBreaker } from '../src/shared/circuit-breaker';
import pino from 'pino';

const logger = pino({ level: 'silent' });

t.test('Circuit Breaker Configuration', async (t) => {
  // Set Env Vars for test
  process.env.RESILIENCE_TIMEOUT_TESTSERVICE_MS = '100';
  process.env.RESILIENCE_CIRCUIT_ERROR_THRESHOLD_TESTSERVICE = '10';
  // Use the new naming convention from AGENTS.md
  process.env.RESILIENCE_CIRCUITBREAKER_TESTSERVICE = 'true';

  const action = async (shouldFail: boolean) => {
    if (shouldFail) throw new Error('Boom');
    return 'Success';
  };

  const breaker = createCircuitBreaker({
    name: 'TESTSERVICE',
    action,
    logger: logger as any,
  });

  t.equal(breaker.options.timeout, 100, 'Should read timeout from env');
  t.equal(breaker.options.errorThresholdPercentage, 10, 'Should read error threshold from env');
  t.equal(breaker.enabled, true, 'Should be enabled');

  // Test disable
  process.env.RESILIENCE_CIRCUITBREAKER_TESTSERVICE = 'false';
  const disabledBreaker = createCircuitBreaker({
    name: 'TESTSERVICE',
    action,
    logger: logger as any,
  });
  t.equal(disabledBreaker.enabled, false, 'Should be disabled via env var');


  // Cleanup
  delete process.env.RESILIENCE_TIMEOUT_TESTSERVICE_MS;
  delete process.env.RESILIENCE_CIRCUIT_ERROR_THRESHOLD_TESTSERVICE;
  delete process.env.RESILIENCE_CIRCUITBREAKER_TESTSERVICE;
});

t.test('Circuit Breaker Safe Parsing', async (t) => {
    // Set invalid int
    process.env.RESILIENCE_TIMEOUT_SAFEMODE_MS = 'invalid';

    const action = async (val: string) => val;
    const breaker = createCircuitBreaker({
      name: 'SAFEMODE',
      action,
      logger: logger as any,
    });

    t.equal(breaker.options.timeout, 10000, 'Should default to 10000 on invalid int');

    delete process.env.RESILIENCE_TIMEOUT_SAFEMODE_MS;
});

t.test('Circuit Breaker Behavior', async (t) => {
  const action = async (val: string) => val;
  const breaker = createCircuitBreaker({
    name: 'BEHAVIOR',
    action,
    logger: logger as any,
  });

  const result = await breaker.fire('hello');
  t.equal(result, 'hello', 'Should pass through execution');
});
