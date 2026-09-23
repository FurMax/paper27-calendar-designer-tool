import { isMonthNumber, type MonthNumber } from '../domain/calendar.ts';

export type Location =
  | { screen: 'entry' }
  | { screen: 'assign' }
  | { screen: 'editor'; month: MonthNumber }
  | { screen: 'review' };

export function parseLocation(pathname: string): Location {
  if (pathname === '/assign') return { screen: 'assign' };
  if (pathname === '/review') return { screen: 'review' };
  const match = /^\/editor\/(\d{1,2})\/?$/.exec(pathname);
  if (match) {
    const month = Number(match[1]);
    if (isMonthNumber(month)) return { screen: 'editor', month };
  }
  return { screen: 'entry' };
}

export function locationPath(location: Location): string {
  switch (location.screen) {
    case 'entry': return '/';
    case 'assign': return '/assign';
    case 'editor': return `/editor/${location.month}`;
    case 'review': return '/review';
  }
}
