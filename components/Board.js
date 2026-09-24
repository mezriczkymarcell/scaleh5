import Image from 'next/image';
import { ROWS_TOP, ROWS_BOTTOM, withOffsets } from '@/lib/slots';
import Reveal from './Reveal';
import { lines } from '@/lib/defaults';

function sizesFor(cols) {
  if (cols === 1) return '100vw';
  if (cols === 4) return '(max-width: 700px) 50vw, 25vw';
  return '(max-width: 560px) 100vw, 50vw';
}

function Rows({ rows, images, priorityFirst }) {
  return rows.map((r, ri) => (
    <div key={ri} className={`row cols-${r.cols}${r.cols === 2 && r.ratio === '7 / 8' ? ' tall' : ''}`}>
      {Array.from({ length: r.count }, (_, k) => {
        const i = r.start + k;
        const src = images[i];
        return (
          <Reveal key={i} className="tile" style={{ aspectRatio: r.ratio }}>
            {src ? (
              <Image src={src} alt="" fill sizes={sizesFor(r.cols)} quality={85}
                priority={priorityFirst && ri === 0} />
            ) : (
              <span className="tile-empty">{String(i + 1).padStart(2, '0')}</span>
            )}
          </Reveal>
        );
      })}
    </div>
  ));
}

export default function Board({ board }) {
  const top = withOffsets(ROWS_TOP);
  const bottom = withOffsets(ROWS_BOTTOM, top.at(-1).start + top.at(-1).count);
  const fontStyle = board.font ? { fontFamily: `'${board.font}', serif` } : undefined;

  return (
    <>
      <div className="grid"><Rows rows={top} images={board.images} priorityFirst /></div>

      <section className="details">
        <Reveal className="detail">
          <h2>Visual atmosphere</h2>
          <ul className="big-list">{lines(board.atmosphere).map((l, i) => <li key={i}>{l}</li>)}</ul>
        </Reveal>
        <Reveal className="detail">
          <h2>Typography</h2>
          <div className="specimen" style={fontStyle}>Aa</div>
          <p className="font-name" style={fontStyle}>{board.font}</p>
          <ul className="note-list">{lines(board.fontNote).map((l, i) => <li key={i}>{l}</li>)}</ul>
        </Reveal>
        <Reveal className="detail">
          <h2>Colour palette</h2>
          <div className="swatches">
            {board.colors.map((c, i) => (
              <span key={i} className="swatch" style={{ background: c.hex, zIndex: 10 - i }} />
            ))}
          </div>
          <ul className="swatch-list">
            {board.colors.map((c, i) => (
              <li key={i}><span>{c.name}</span><code>{c.hex.toUpperCase()}</code></li>
            ))}
          </ul>
        </Reveal>
      </section>

      <div className="grid"><Rows rows={bottom} images={board.images} /></div>
    </>
  );
}
