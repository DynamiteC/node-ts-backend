# Workspace Rules

## Architecture & Engineering Standards (Ruthless Top-1% Mode)

### 1. Layers are Sacred (One-Way Dependency)
- **Flow:** `common` → `infra` → `domain` → `http`
- **Strict Rule:** `Domain` MUST NEVER import anything from `http/`.
- **Infra:** Returns raw data only. No business decisions in infra.
- **Dependency Injection:** Use strict injection for all external dependencies.

### 2. Money Safety
- **Type:** Monetary values MUST ALWAYS be `{ currency: string, amount: string }` or `BigInt`.
- **Forbidden:** NEVER use `number` or `float` for money.
- **Idempotency:** `IdempotencyKey` (UUID v7) is MANDATORY on every write operation.

### 3. Security Baseline
- **Headers:** `@fastify/helmet` with strict CSP + HSTS.
- **Rate Limiting:** `@fastify/rate-limit` on all public routes.
- **Validation:** Zod validation everywhere (Inputs, Env, Domain Objects).
- **Logs:** No PII/tokens in logs (configure Pino redaction).

### 4. Resilience Patterns
- **Timeouts:** Every external call MUST have a configurable timeout.
- **Location:** Resilience utilities live in `src/shared/`.
- **Configuration:** ALL resilience features must be controlled via ENV flags (prefix `RESILIENCE_`).
  - Example: `RESILIENCE_TIMEOUT_RAZORPAY_MS`, `RESILIENCE_CIRCUIT_NOTIFICATION=true`.
- **Implementation:** Follow existing `circuit-breaker.ts` style.

### 5. Observability
- **Logging:** Structured Pino + Correlation-ID / Request-ID.
- **Tracing:** Trace/Span propagation on all calls.
- **Endpoints:** `/health`, `/ready`, `/metrics` must exist.

### 6. Feature Toggles
- **Rule:** NEVER hard-code behavior.
- **Env:** Use `FEATURE_` env vars for anything that can be disabled.

---

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
