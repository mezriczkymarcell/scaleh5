// Google Fonts URL a moodboardokhoz javasolt betűtípusokhoz
export function googleFontHref(names) {
  const fams = [...new Set(names.filter(Boolean).map((n) => n.trim()))]
    .map((n) => 'family=' + encodeURIComponent(n).replace(/%20/g, '+'))
    .join('&');
  return fams ? `https://fonts.googleapis.com/css2?${fams}&display=swap` : null;
}
