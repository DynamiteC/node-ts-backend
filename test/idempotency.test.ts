import t from 'tap';
import { isValidIdempotencyKey } from '../src/shared/idempotency';

t.test('Idempotency Key Validation', (t) => {
  t.test('should return true for valid UUID v7', (t) => {
    // A valid UUID v7 example
    const validKey = '018b3263-5471-7000-81d3-375837651234';
    t.ok(isValidIdempotencyKey(validKey), 'Should be valid');
    t.end();
  });

  t.test('should return false for invalid UUID', (t) => {
    const invalidKey = 'not-a-uuid';
    t.notOk(isValidIdempotencyKey(invalidKey), 'Should be invalid');
    t.end();
  });

  t.test('should return false for empty string', (t) => {
    t.notOk(isValidIdempotencyKey(''), 'Should be invalid');
    t.end();
  });

  t.test('should return false for UUID v4 (regex expects v7)', (t) => {
      // The current regex specifically checks for '7' in the third group
      const v4Key = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      t.notOk(isValidIdempotencyKey(v4Key), 'UUID v4 should fail if strict v7 check is applied');
      t.end();
  });

  t.end();
});
