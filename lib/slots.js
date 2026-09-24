// A képrács elrendezése (a vázlat alapján). Összesen 14 kép / moodboard.
// ratio = szélesség / magasság egy cellára.
export const ROWS_TOP = [
  { cols: 1, count: 1, ratio: '16 / 9' },
  { cols: 4, count: 4, ratio: '16 / 9' },
  { cols: 2, count: 2, ratio: '7 / 8' },
  { cols: 1, count: 1, ratio: '16 / 9' },
];
export const ROWS_BOTTOM = [
  { cols: 2, count: 4, ratio: '16 / 10' },
  { cols: 2, count: 2, ratio: '7 / 8' },
];
export const SLOT_COUNT = [...ROWS_TOP, ...ROWS_BOTTOM].reduce((n, r) => n + r.count, 0);

// Sorok kiosztása: melyik sor melyik képindexektől indul
export function withOffsets(rows, start = 0) {
  let i = start;
  return rows.map((r) => {
    const o = { ...r, start: i };
    i += r.count;
    return o;
  });
}
