function memoize<Key, Return>(fn: (key: Key) => Return): (key: Key) => Return {
  const cache = new Map<Key, Return>();
  return (key: Key): Return => {
    if (!cache.has(key)) {
      cache.set(key, fn(key));
    }
    return cache.get(key)!;
  };
}

function waysToSum(n: number): number[][] {
  if (n === 2) return [[1, 1]];

  const sums: number[][] = [];
  for (let i = n - 1; i > 2; i--) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    sums.push(...memoisedWaysToSum(n));
  }
  return sums;
}

const memoisedWaysToSum = memoize(waysToSum);

export default {
  type: 'Total Ways to Sum',
  description: /written as a sum of at least two positive integers/,
  solve(input: number): number {
    return memoisedWaysToSum(input)
      .filter((v, i, a) => a.indexOf(v) === i)
      .length;
  }
};


// 1 = 0
// 2 = 1
// 3 = 1
// 4 = 4
// 5 = 7?

// 4 + 1
// 3 + 2
// 3 + 1 + 1
// 2 + 2 + 2
// 2 + 2 + 1
// 2 + 1 + 1 + 1
// 1 + 1 + 1 + 1 +1
