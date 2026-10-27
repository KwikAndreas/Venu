export const SPORTS = ['futsal', 'badminton', 'basket'] as const;

export type Sport = (typeof SPORTS)[number];

export function isSport(value: unknown): value is Sport {
  return typeof value === 'string' && (SPORTS as readonly string[]).includes(value);
}
