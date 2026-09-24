'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { ROWS_TOP, ROWS_BOTTOM, withOffsets } from '@/lib/slots';
import { googleFontHref } from '@/lib/fonts';

const num = (i) => String(i + 1).padStart(2, '0');
const TOP = withOffsets(ROWS_TOP);
const BOTTOM = withOffsets(ROWS_BOTTOM, TOP.at(-1).start + TOP.at(-1).count);

function Login({ onOk }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) onOk(); else setErr((await r.json().catch(() => ({}))).error || 'Hiba');
  }
  return (
    <form className="login" onSubmit={submit}>
      <h1>Admin</h1>
      <input type="password" autoFocus placeholder="Jelszó" value={pw} onChange={(e) => setPw(e.target.value)} />
      <button disabled={busy || !pw}>{busy ? '…' : 'Belépés'}</button>
      {err && <p className="err">{err}</p>}
      <a href="/" className="back">← Vissza az oldalra</a>
    </form>
  );
}

async function uploadFile(file) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const blob = await upload(`images/${safe}`, file, { access: 'public', handleUploadUrl: '/api/upload' });
  return blob.url;
}

function Slot({ i, ratio, url, busy, onFiles, onRemove, onSwap }) {
  const [over, setOver] = useState(false);
  const input = useRef(null);
  return (
    <div
      className={`slot${over ? ' over' : ''}${url ? ' has' : ''}`}
      style={{ aspectRatio: ratio }}
      draggable={!!url}
      onDragStart={(e) => e.dataTransfer.setData('text/slot', String(i))}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setOver(false);
        const from = e.dataTransfer.getData('text/slot');
        if (from !== '') return onSwap(Number(from), i);
        if (e.dataTransfer.files.length) onFiles(i, [...e.dataTransfer.files]);
      }}
      onClick={() => !url && input.current?.click()}
    >
      {url && <img src={url} alt="" />}
      <span className="slot-n">{num(i)}</span>
      {!url && !busy && <span className="slot-hint">Húzd ide<br />vagy kattints</span>}
      {busy && <span className="slot-busy">Feltöltés…</span>}
      {url && (
        <div className="slot-tools">
          <button type="button" onClick={(e) => { e.stopPropagation(); input.current?.click(); }}>Csere</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(i); }}>Törlés</button>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" hidden
        onChange={(e) => { if (e.target.files.length) onFiles(i, [...e.target.files]); e.target.value = ''; }} />
    </div>
  );
}

function SlotRows({ rows, images, busy, ...h }) {
  return rows.map((r, ri) => (
    <div key={ri} className="a-row" style={{ gridTemplateColumns: `repeat(${r.cols}, 1fr)` }}>
      {Array.from({ length: r.count }, (_, k) => {
        const i = r.start + k;
        return <Slot key={i} i={i} ratio={r.ratio} url={images[i]} busy={busy[i]} {...h} />;
      })}
    </div>
  ));
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export default function Admin({ initialAuthed }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [content, setContent] = useState(null);
  const [hasBlob, setHasBlob] = useState(true);
  const [tab, setTab] = useState(0); // 0..2 moodboard, 3 = általános
  const [busy, setBusy] = useState({});
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [bulkOver, setBulkOver] = useState(false);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/content').then(async (r) => {
      if (r.status === 401) return setAuthed(false);
      const j = await r.json();
      setContent(j.content); setHasBlob(j.blob);
    });
  }, [authed]);

  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const update = useCallback((fn) => {
    setContent((c) => { const n = structuredClone(c); fn(n); return n; });
    setDirty(true);
  }, []);

  const board = content && tab < 3 ? content.boards[tab] : null;

  // több fájlt a megadott slottól kezdve az üres helyekre tesz (az első a célslotba kerül)
  async function handleFiles(start, files, b = tab) {
    const imgs = content.boards[b].images;
    const targets = [start];
    for (let i = 0; i < imgs.length && targets.length < files.length; i++)
      if (i !== start && !imgs[i]) targets.push(i);
    const jobs = files.slice(0, targets.length).map(async (f, k) => {
      const slot = targets[k];
      if (slot == null || slot < 0) return;
      setBusy((s) => ({ ...s, [slot]: true }));
      try {
        const url = await uploadFile(f);
        update((n) => { n.boards[b].images[slot] = url; });
      } catch (e) {
        setStatus('Feltöltési hiba: ' + e.message);
      } finally {
        setBusy((s) => ({ ...s, [slot]: false }));
      }
    });
    await Promise.all(jobs);
  }

  function bulkDrop(files) {
    const imgs = content.boards[tab].images;
    const first = imgs.findIndex((x) => !x);
    if (first < 0) return setStatus('Nincs üres hely — előbb törölj képet.');
    handleFiles(first, files.filter((f) => f.type.startsWith('image/')));
  }

  async function save() {
    setStatus('Mentés…');
    const r = await fetch('/api/content', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(content) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setContent(j.content); setDirty(false); setStatus('Mentve ✓'); setTimeout(() => setStatus(''), 2500); }
    else setStatus('Hiba: ' + (j.error || r.status));
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    setAuthed(false); setContent(null);
  }

  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  if (!content) return <div className="loading">Betöltés…</div>;

  const uploading = Object.values(busy).some(Boolean);
  const fontHref = board ? googleFontHref([board.font]) : null;
  const handlers = {
    busy,
    onFiles: (i, f) => handleFiles(i, f),
    onRemove: (i) => update((n) => { n.boards[tab].images[i] = null; }),
    onSwap: (a, b) => a !== b && update((n) => { const im = n.boards[tab].images; [im[a], im[b]] = [im[b], im[a]]; }),
  };

  return (
    <div className="admin">
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <header className="a-bar">
        <strong>Admin</strong>
        <nav>
          {content.boards.map((b, i) => (
            <button key={i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{num(i)} {b.title}</button>
          ))}
          <button className={tab === 3 ? 'on' : ''} onClick={() => setTab(3)}>Általános</button>
        </nav>
        <div className="a-actions">
          <span className="status">{status || (dirty ? 'Nem mentett változás' : '')}</span>
          <a href={tab < 3 ? (tab === 0 ? '/' : `/${tab + 1}`) : '/'} target="_blank">Megtekintés ↗</a>
          <button className="primary" disabled={!dirty || uploading} onClick={save}>Mentés</button>
          <button onClick={logout}>Kilépés</button>
        </div>
      </header>

      {!hasBlob && <p className="warn">Nincs bekötve Vercel Blob store — a feltöltés és a mentés nem fog működni. Lásd README.</p>}

      {tab === 3 ? (
        <section className="a-form">
          {[['client', 'Ügyfél neve (bal felső sarok)'], ['subtitle', 'Alcím'], ['date', 'Dátum'], ['studio', 'Stúdió neve (lábléc)'], ['studioUrl', 'Stúdió weboldala']].map(([k, l]) => (
            <Field key={k} label={l}>
              <input value={content.site[k]} onChange={(e) => update((n) => { n.site[k] = e.target.value; })} />
            </Field>
          ))}
        </section>
      ) : (
        <div className="a-board">
          <section className="a-form">
            <Field label="Irány neve (cím alatt és a menüben)">
              <input value={board.title} onChange={(e) => update((n) => { n.boards[tab].title = e.target.value; })} />
            </Field>
            <Field label="Háttérszín">
              <div className="color" style={{ gridTemplateColumns: '42px 1fr' }}>
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(board.bg) ? board.bg : '#0a0a0a'}
                  onChange={(e) => update((n) => { n.boards[tab].bg = e.target.value; })} />
                <input className="hex" value={board.bg} onChange={(e) => update((n) => { n.boards[tab].bg = e.target.value; })} />
              </div>
            </Field>
            <Field label="Kulcsszavak a cím mellett (soronként egy)">
              <textarea rows={4} value={board.keywords} onChange={(e) => update((n) => { n.boards[tab].keywords = e.target.value; })} />
            </Field>
            <Field label="Leírás (3–4 sor)">
              <textarea rows={6} value={board.description} onChange={(e) => update((n) => { n.boards[tab].description = e.target.value; })} />
            </Field>
            <Field label="Visual atmosphere (soronként egy)">
              <textarea rows={4} value={board.atmosphere} onChange={(e) => update((n) => { n.boards[tab].atmosphere = e.target.value; })} />
            </Field>
            <div>
              <Field label="Betűtípus (Google Fonts név)">
                <input value={board.font} placeholder="pl. Cormorant Garamond" onChange={(e) => update((n) => { n.boards[tab].font = e.target.value; })} />
              </Field>
            </div>
            <Field label="Tipográfia jellege (soronként egy)">
              <textarea rows={4} value={board.fontNote} onChange={(e) => update((n) => { n.boards[tab].fontNote = e.target.value; })} />
            </Field>
            <p className="font-preview" style={{ fontFamily: `'${board.font}', serif` }}>Aa Bb Cc — {board.font || '—'}</p>

            <div className="field"><span>Színpaletta</span>
              <div className="colors">
                {board.colors.map((c, ci) => (
                  <div key={ci} className="color">
                    <input type="color" value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '#000000'}
                      onChange={(e) => update((n) => { n.boards[tab].colors[ci].hex = e.target.value; })} />
                    <input className="hex" value={c.hex} onChange={(e) => update((n) => { n.boards[tab].colors[ci].hex = e.target.value; })} />
                    <input value={c.name} placeholder="Név" onChange={(e) => update((n) => { n.boards[tab].colors[ci].name = e.target.value; })} />
                    <button type="button" onClick={() => update((n) => { n.boards[tab].colors.splice(ci, 1); })}>×</button>
                  </div>
                ))}
                {board.colors.length < 8 && (
                  <button type="button" className="add" onClick={() => update((n) => { n.boards[tab].colors.push({ hex: '#888888', name: '' }); })}>+ Szín</button>
                )}
              </div>
            </div>
          </section>

          <section className="a-images">
            <div
              className={`bulk${bulkOver ? ' over' : ''}`}
              onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setBulkOver(true); } }}
              onDragLeave={() => setBulkOver(false)}
              onDrop={(e) => { e.preventDefault(); setBulkOver(false); bulkDrop([...e.dataTransfer.files]); }}
            >
              Húzz ide egyszerre több képet — sorban kitöltik az üres helyeket.
              <small>Egy slotba húzva oda kerül; képet képre húzva megcseréled a kettőt.</small>
            </div>
            <div className="a-grid">
              <SlotRows rows={TOP} images={board.images} {...handlers} />
              <div className="a-text">Leírás · Tipográfia · Színek</div>
              <SlotRows rows={BOTTOM} images={board.images} {...handlers} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
