/**
 * Seeded RNG. Two pages for the same business must look identical on reload,
 * and two different businesses must not — so every random-looking value
 * (shape positions, animation offsets, which curated image) comes from here
 * rather than Math.random.
 */

function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

export function seedFrom(...parts: string[]): number {
  return hashString(parts.join("::"));
}

export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  /** Small symmetric jitter, e.g. jitter(0.15) → -0.15..0.15. Used for timing offsets. */
  jitter: (amount: number) => number;
};

export function rngFrom(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    jitter: (amount) => (next() * 2 - 1) * amount,
  };
}
