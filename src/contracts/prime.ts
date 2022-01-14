function isPrime(n: number): boolean {
  for (let factor = 2; factor < Math.sqrt(n); factor++) {
    if (n % factor === 0) return false;
  }
  return true;
}

export default {
  type: 'Find Largest Prime Factor',
  description: /What is the largest prime factor of/,
  solve(input: number): number {
    for (let factor = input - 1; factor > 0; factor--) {
      if (input % factor === 0 && isPrime(factor)) return factor;
    }
    throw new Error('No prime factor found');
  }
};
