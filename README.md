# memoize-lru

A simple wrapper for [lru-cache](https://www.npmjs.com/package/lru-cache) that augments any async function with a cache.

The cache evicts items by applying the LRU strategy, meaning that the least recently used items in the cache will be deleted.

## Installation

```bash
npm install memoize-lru --save
```

## Usage

```ts
import { memoizeLru } from 'memoize-lru';

const fetchUser = async (userId: string) => {
  const response = await fetch(`http://localhost:8080/users/${userId}`);
  return await response.json();
}

const [wrapped, clean] = memoizeLru(
  fetchUser, // the function to be wrapped
  { max: 1000 }, //  the cache config - will be passed as is to lru-cache
  userId => userId // determines the cash key based on the function args
)

// get some
const adam = await wrapped('adam');
const bert = await wrapped('bert');
const adam2 = await wrapped('adam');

console.log(adam === adam2); // prints "true"

// reset cache
clean();
```

All supported `lru-cache` options can be found [here](https://github.com/isaacs/node-lru-cache#options).