import { LRUCache } from 'lru-cache';

type Maybe<T> = T | null | undefined;

// We cannot use `undefined` and `null` directly as regular cache values when
// using lru-cache. The former is reserved for internal use, meaning "not cached",
// while the latter is not compatible with the type `{}` which happens to be
// the supertype of each cache value.
// Hence, we have to wrap cache values.
type CacheValue<T extends Maybe<{}>> = { value: T };

/**
 * Convenient wrapper for lru cache.
 * Passes original fn args per context.
 * Returns the wrapped fn and a fn that clears the cache.
 * @param fn - the function to cache.
 * @param options - LRU cache options, e.g. ttl, max.
 * @param resolveKey - turns fn args into a cache key (string).
 */
export function memoizeLru<Args extends any[], Result>(
  fn: (...args: Args) => Promise<Result>,
  options:
    | Omit<LRUCache.OptionsMaxLimit<string, CacheValue<Result>, { args: Args }>, 'fetchMethod'>
    | Omit<LRUCache.OptionsTTLLimit<string, CacheValue<Result>, { args: Args }>, 'fetchMethod'>
    | Omit<LRUCache.OptionsSizeLimit<string, CacheValue<Result>, { args: Args }>, 'fetchMethod'>,
  resolveKey: (...args: Args) => string,
): [(...args: Args) => Promise<Result>, () => void] {
  const cache = new LRUCache<string, CacheValue<Result>, { args: Args }>({
    ...options,
    fetchMethod: async (_key, _staleValue, { context }) => {
      const result = await fn(...context.args);
      return { value: result };
    },
  });

  return [
    async (...args) => {
      const result = await cache.fetch(resolveKey(...args), { context: { args } });
      if (result === undefined) {
        // should never happen here (we're using no abort signals)
        throw new Error('fetch aborted');
      }
      return result.value;
    },
    cache.clear.bind(cache),
  ];
}
