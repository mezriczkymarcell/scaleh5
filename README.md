# Moodboard oldal

3 moodboardot mutat be az ügyfélnek, sötét, galériaszerű stílusban, admin felülettel.

- `/`, `/2`, `/3`: a három moodboard (a felső menüből választható)
- `/admin`: jelszavas belépés. Itt lehet a képeket drag & droppal feltölteni, és a szövegeket, színeket, betűtípust szerkeszteni.

## Kitétel (GitHub → Vercel)

1. Töltsd fel ezt a mappát egy új GitHub repóba.
2. Vercelen: **Add New → Project →** válaszd ki a repót → Deploy. A Next.js-t magától felismeri.
3. A projektben: **Storage → Create → Blob**. Hozz létre egy store-t **Public** hozzáféréssel, és kösd a projekthez.
   Ez automatikusan beállítja a `BLOB_READ_WRITE_TOKEN` változót.
4. **Settings → Environment Variables:** add meg az `ADMIN_PASSWORD` változót a jelszavaddal.
5. **Deployments → Redeploy**, hogy a változók életbe lépjenek.

## Használat

- Az oldal alján: **Admin** → jelszó.
- Moodboardonként 14 kép van a rácsban. Egy slotba húzott kép oda kerül. Ha a felső sávba egyszerre több képet húzol,
  azok sorban kitöltik az üres helyeket. Két képet egymásra húzva felcseréled őket.
- **Mentés** után az oldal azonnal frissül. A mentés a már nem használt képeket törli a tárhelyről.
- Betűtípusnak bármelyik Google Fonts család pontos nevét megadhatod (pl. `Cormorant Garamond`, `Bodoni Moda`, `Italiana`).

## Helyi futtatás

```bash
npm install
cp .env.example .env.local   # töltsd ki
npm run dev
```

A képrács elrendezését a `lib/slots.js` fájlban lehet módosítani.
