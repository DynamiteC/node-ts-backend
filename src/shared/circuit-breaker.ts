import CircuitBreaker from 'opossum';
import { FastifyBaseLogger } from 'fastify';

/**
 * Configuration options for creating a circuit breaker
 */
export interface CircuitBreakerConfig {
  /**
   * The name of the target service (e.g., 'RAZORPAY', 'STRIPE')
   * Used to lookup environment variables and logging.
   */
  name: string;
  /**
   * The actual asynchronous function to wrap
   */
  action: (...args: any[]) => Promise<any>;
  /**
   * Logger instance
   */
  logger: FastifyBaseLogger;
  /**
   * Optional manual override options
   */
  options?: CircuitBreaker.Options;
}

/**
 * Helper to safely parse integer env vars with default
 */
function getEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Creates a configured Opossum Circuit Breaker
 *
 * Reads configuration from environment variables following the pattern:
 * - RESILIENCE_TIMEOUT_{NAME}_MS (default: 10000)
 * - RESILIENCE_CIRCUIT_ERROR_THRESHOLD_{NAME} (default: 50)
 * - RESILIENCE_CIRCUIT_RESET_TIMEOUT_{NAME}_MS (default: 30000)
 * - RESILIENCE_CIRCUITBREAKER_{NAME} (default: true) - Main toggle
 */
export function createCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  config: CircuitBreakerConfig
): CircuitBreaker<T> {
  const { name, action, logger } = config;
  const upperName = name.toUpperCase();

  // Read config from env (or defaults)
  const timeout = getEnvInt(`RESILIENCE_TIMEOUT_${upperName}_MS`, 10000);
  const errorThresholdPercentage = getEnvInt(`RESILIENCE_CIRCUIT_ERROR_THRESHOLD_${upperName}`, 50);
  const resetTimeout = getEnvInt(`RESILIENCE_CIRCUIT_RESET_TIMEOUT_${upperName}_MS`, 30000);

  // Naming convention from AGENTS.md: RESILIENCE_CIRCUITBREAKER_RAZORPAY=true
  const enabledEnvVar = `RESILIENCE_CIRCUITBREAKER_${upperName}`;
  const enabled = process.env[enabledEnvVar] !== 'false'; // Default to true

  const options: CircuitBreaker.Options = {
    timeout,
    errorThresholdPercentage,
    resetTimeout,
    enabled,
    name,
    ...config.options,
  };

  const breaker = new CircuitBreaker(action, options);

  // Structured Logging & Metrics
  breaker.on('fire', () => logger.debug({ msg: 'CircuitBreaker fired', circuit: name }));
  breaker.on('reject', () => logger.warn({ msg: 'CircuitBreaker rejected', circuit: name }));
  breaker.on('timeout', () => logger.warn({ msg: 'CircuitBreaker timeout', circuit: name }));
  breaker.on('success', () => logger.debug({ msg: 'CircuitBreaker success', circuit: name }));
  breaker.on('failure', (err) => logger.error({ msg: 'CircuitBreaker failure', circuit: name, err }));
  breaker.on('open', () => logger.warn({ msg: 'CircuitBreaker opened', circuit: name }));
  breaker.on('close', () => logger.info({ msg: 'CircuitBreaker closed', circuit: name }));
  breaker.on('halfOpen', () => logger.info({ msg: 'CircuitBreaker half-open', circuit: name }));
  breaker.on('fallback', () => logger.warn({ msg: 'CircuitBreaker fallback', circuit: name }));

  return breaker;
}
