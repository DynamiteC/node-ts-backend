declare module 'opossum' {
  import { EventEmitter } from 'events';

  class CircuitBreaker<T extends (...args: any[]) => Promise<any> = any> extends EventEmitter {
    constructor(action: T, options?: CircuitBreaker.Options);

    fire(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
    opened: boolean;
    halfOpen: boolean;
    closed: boolean;
    name: string;
    group: string;
    enabled: boolean;

    fallback(callback: (err: any, ...args: Parameters<T>) => any): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    // Add other methods as needed
  }

  namespace CircuitBreaker {
    interface Options {
      timeout?: number;
      errorThresholdPercentage?: number;
      resetTimeout?: number;
      rollingCountTimeout?: number;
      rollingCountBuckets?: number;
      name?: string;
      group?: string;
      enabled?: boolean;
      allowWarmUp?: boolean;
      volumeThreshold?: number;
      errorFilter?: (err: any) => boolean;
      cache?: boolean;
    }
  }

  export = CircuitBreaker;
}
