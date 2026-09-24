import { SLOT_COUNT } from './slots';

const empty = () => Array(SLOT_COUNT).fill(null);

export const DEFAULT_CONTENT = {
  site: {
    client: 'Ahuja Group',
    subtitle: 'Arculattervezés — Moodboard',
    date: '2026/09/02',
    studio: 'The Highest Five Studio',
    studioUrl: 'https://www.highestfivestudio.com',
  },
  boards: [
    {
      title: 'Modern Institutional',
      bg: '#EFEDE8',
      keywords: 'Capital\nDiscipline\nReal assets\nBrighter tomorrow',
      description:
        'A confident and institutional visual direction built around stability, scale and trust. Strong sans serif typography and structured layouts create the character of an established investment firm, while large-scale architectural imagery connects the identity naturally to real estate.',
      atmosphere: 'Established\nStable\nAuthoritative\nGlobal mindset',
      font: 'Inter Tight',
      fontNote: 'Bold, structured\nSans serif\nModern\nConfident',
      colors: [
        { hex: '#0F1D19', name: 'Deep green' },
        { hex: '#1D1D1D', name: 'Black' },
        { hex: '#7A7A77', name: 'Grey' },
        { hex: '#D5D1C9', name: 'Stone' },
      ],
      images: empty(),
    },
    {
      title: 'Contemporary Private Equity',
      bg: '#101010',
      keywords: 'Identify\nAcquire\nImprove\nCreate value\nRepeat',
      description:
        'A contemporary investment-focused identity combining financial precision with architectural character. Distinctive typography, disciplined layouts and data-driven elements communicate expertise and confidence, while carefully curated imagery gives the brand a distinctive and sophisticated edge.',
      atmosphere: 'Confident\nContemporary\nIntelligent\nData-driven',
      font: 'Playfair Display',
      fontNote: 'Modern serif + sans\nRefined\nPrecise\nMinimal',
      colors: [
        { hex: '#1A1A1A', name: 'Black' },
        { hex: '#6E655C', name: 'Umber' },
        { hex: '#A39A8E', name: 'Taupe' },
        { hex: '#F2EEE8', name: 'Ivory' },
      ],
      images: empty(),
    },
    {
      title: 'Timeless Legacy',
      bg: '#EAE5DD',
      keywords: 'People\nPlaces\nCommunities\nLasting value',
      description:
        'A timeless and sophisticated direction inspired by established global institutions. Warm, natural tones and classic imagery create a sense of permanence and trust, while refined details and human moments bring approachability. This direction radiates strength, credibility and long-term vision.',
      atmosphere: 'Timeless\nSophisticated\nMasculine\nHuman-centered',
      font: 'Cormorant Garamond',
      fontNote: 'Elegant serif\nRefined\nUnderstated\nPremium feel',
      colors: [
        { hex: '#2A1F18', name: 'Espresso' },
        { hex: '#5A4535', name: 'Walnut' },
        { hex: '#CDBFAE', name: 'Sand' },
        { hex: '#E9E4DC', name: 'Linen' },
      ],
      images: empty(),
    },
  ],
};

// Hiányzó mezők pótlása, hogy egy régebbi mentés se törje az oldalt
export const MAX_BOARDS = 6;

export function blankBoard() {
  return {
    title: 'Új moodboard', bg: '#0A0A0A', keywords: '', description: '', atmosphere: '',
    font: 'Inter Tight', fontNote: '', colors: [], images: empty(),
  };
}

export function normalize(c) {
  const d = DEFAULT_CONTENT;
  const out = { site: { ...d.site, ...(c?.site || {}) }, boards: [] };
  const n = Math.min(MAX_BOARDS, Math.max(1, Array.isArray(c?.boards) ? c.boards.length : d.boards.length));
  for (let i = 0; i < n; i++) {
    const b = { ...(d.boards[i] || blankBoard()), ...(c?.boards?.[i] || {}) };
    const imgs = Array.isArray(b.images) ? b.images.slice(0, SLOT_COUNT) : [];
    while (imgs.length < SLOT_COUNT) imgs.push(null);
    b.images = imgs.map((u) => (typeof u === 'string' && u ? u : null));
    b.colors = Array.isArray(b.colors) ? b.colors.filter((x) => x && x.hex).slice(0, 8) : [];
    out.boards.push(b);
  }
  return out;
}

// Háttérszínből számolt szövegszínek (világos háttéren sötét szöveg és fordítva)
export function themeVars(bg) {
  const m = /^#?([0-9a-f]{6})$/i.exec(bg || '');
  const hex = m ? m[1] : '0a0a0a';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const light = lum > 0.5;
  return {
    '--bg': '#' + hex,
    '--fg': light ? '#141414' : '#ecebe6',
    '--muted': light ? '#6d6c67' : '#8b8a85',
    '--line': light ? 'rgba(0,0,0,0.13)' : 'rgba(255,255,255,0.11)',
  };
}

export const lines = (t) => (t || '').split('\n').map((x) => x.trim()).filter(Boolean);
