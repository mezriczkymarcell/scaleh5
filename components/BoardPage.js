import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { googleFontHref } from '@/lib/fonts';
import Board from '@/components/Board';
import { themeVars, lines } from '@/lib/defaults';

export async function boardMetadata() {
  const { site } = await getContent();
  return { title: `${site.client} — Moodboard` };
}

const num = (i) => String(i + 1).padStart(2, '0');

export default async function BoardPage({ idx }) {
  const { site, boards } = await getContent();
  const board = boards[idx];
  if (!board) notFound();
  const fontHref = googleFontHref([board.font]);

  const theme = themeVars(board.bg);

  return (
    <div className="theme" style={theme}>
      <style>{`html{background:${theme['--bg']}}`}</style>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <header className="nav">
        <Link href="/" className="nav-brand">{site.client}</Link>
        <nav className={`nav-tabs${boards.length > 3 ? ' many' : ''}`} style={{ '--i': idx, '--n': boards.length }}>
          {boards.map((b, i) => (
            <Link key={i} href={i === 0 ? '/' : `/${i + 1}`} className={i === idx ? 'on' : ''} scroll={false}>
              <span className="n">{num(i)}</span>
              <span className="t">{b.title}</span>
            </Link>
          ))}
        </nav>
      </header>

      <main key={idx}>
        <section className="intro">
          <div className="intro-meta">
            <span>{site.subtitle}</span>
            <span>{site.date}</span>
          </div>
          <div className="intro-grid">
            <div>
              <h1>Moodboard {num(idx)}.</h1>
              <p className="intro-tagline">{board.title}</p>
            </div>
            {lines(board.keywords).length > 0 && (
              <ul className="intro-keys">
                {lines(board.keywords).map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            )}
          </div>
          <p className="intro-text">{board.description}</p>
        </section>
        <Board board={board} />
      </main>

      <footer className="foot">
        <a href={site.studioUrl} target="_blank" rel="noreferrer">{site.studio}</a>
        <span>© {new Date().getFullYear()}</span>
        <Link href="/admin" className="foot-admin">Admin</Link>
      </footer>
    </div>
  );
}
