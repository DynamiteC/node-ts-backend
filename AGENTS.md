# Workspace Rules

## Resilience Patterns — Implementation & Configuration Rules

When adding or suggesting new resilience patterns (circuit-breaker, retry, timeout, bulkhead, rate-limiter, etc.):

1. Follow the **exact same style** as existing resilience utilities:
   - Place in `src/shared/` as standalone file
   - Examples of correct naming/location:
     - src/shared/circuit-breaker.ts
     - src/shared/idempotency.ts
     - (future) src/shared/retry.ts
     - (future) src/shared/timeout-wrapper.ts
     - (future) src/shared/bulkhead.ts

2. ALWAYS make the behavior **configurable via environment variables**
   Use clear, consistent naming convention:
   RESILIENCE_CIRCUITBREAKER_RAZORPAY=true
   RESILIENCE_RETRY_NOTIFICATION=false
   RESILIENCE_TIMEOUT_RAZORPAY_MS=8000
   RESILIENCE_CIRCUIT_ERROR_THRESHOLD=50
   RESILIENCE_RETRY_MAX_ATTEMPTS=4

3. Default values should be conservative/safe in production
   (breakers on, reasonable timeouts, limited retries)

4. In non-production environments:
   - Allow relaxed defaults (shorter timeouts, retries off, breakers off)
   - But code MUST still read and respect the same env variables

5. Every new resilience utility MUST:
   - Preserve request-id / correlation-id / trace-id propagation
   - Use structured logging (existing logger)
   - Emit metrics when possible (success/failure/counts)

NEVER:
- Put resilience logic directly inside service files (razorpay.service.ts, sms.service.ts, etc.)
- Hard-code timeout/retry/breaker values
- Add new pattern without env-based switch
- Change existing circuit-breaker.ts or idempotency.ts style without strong justification
