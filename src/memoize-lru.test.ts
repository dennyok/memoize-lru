import { memoizeLru } from './memoize-lru';

describe('memoizeLru()', () => {
  it('caches', async () => {
    let count = 0;
    const [wrapped] = memoizeLru(
      (x: string, y: number) => {
        count++;
        return Promise.resolve({ result: x.repeat(y) });
      },
      { max: 1 },
      (x, y) => `${x}/${y}`,
    );

    const res1 = await wrapped('foo', 3);
    const res2 = await wrapped('foo', 3);
    const res3 = await wrapped('foo', 3);
    expect(res1).toEqual({ result: 'foofoofoo' });
    expect(count).toBe(1);
    expect(res1).toBe(res2);
    expect(res2).toBe(res3);

    await wrapped('bar', 2);
    expect(count).toBe(2);

    const res4 = await wrapped('foo', 3);
    expect(count).toBe(3); // max items exceeded
    expect(res4).toEqual({ result: 'foofoofoo' });
    expect(res4).not.toBe(res1);
  });

  it('caches undefined as value', async () => {
    const [wrapped] = memoizeLru(
      (x: number) => Promise.resolve(x % 2 === 0 ? x : undefined),
      { max: 1 },
      (x) => x.toString(),
    );

    expect(await wrapped(3)).toBeUndefined();
  });

  it('caches null as value', async () => {
    const [wrapped] = memoizeLru(
      (x: number) => Promise.resolve(x % 2 === 0 ? x : null),
      { max: 1 },
      (x) => x.toString(),
    );

    expect(await wrapped(3)).toBeNull();
  });

  it('propagates error', async () => {
    const [wrapped] = memoizeLru(
      (x: string, y: number) => {
        return x === 'fails' ? Promise.reject(new Error('error')) : Promise.resolve(x.repeat(y));
      },
      { max: 1 },
      (x, y) => `${x}/${y}`,
    );

    expect(await wrapped('ok', 2)).toBe('okok');
    await expect(wrapped('fails', 3)).rejects.toThrow(Error);
  });

  it('clears cache', async () => {
    const [wrapped, clear] = memoizeLru(
      (x: string) => Promise.resolve({ x }),
      { max: 1 },
      (x) => x,
    );

    const res1 = await wrapped('x');
    clear();
    const res2 = await wrapped('x');
    expect(res1 === res2).toBe(false);
  });
});
