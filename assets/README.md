# assets

`archivo-800-subset.ttf` is Archivo ExtraBold (SIL Open Font License), cut
down to the characters `app/opengraph-image.tsx` draws. It is committed so the
build never has to fetch a font.

If you change the words on the share image, regenerate it with every
character the image now uses:

```sh
TEXT="Learning should lead to the ability to do.antitect.org Free webinars and programmes"
ENC=$(node -e "console.log(encodeURIComponent([...new Set(process.argv[1])].join('')))" "$TEXT")
URL=$(curl -s -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Archivo:wght@800&text=$ENC" | grep -o "https://[^)]*" | head -1)
curl -s -o assets/archivo-800-subset.ttf "$URL"
```

A character missing from the subset renders as a blank box in every link preview.

`fonts/archivo-800-wordmark.woff2` is the same face cut down to the letters of
the wordmark, ANTITECT, for the logo lockup on the site (`lib/fonts/wordmark.ts`).
It is about 1KB. To regenerate it, ask for WOFF2 with a current browser's user
agent:

```sh
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
URL=$(curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Archivo:wght@800&text=ANTIEC" | grep -o "https://[^)]*" | head -1)
curl -s -o assets/fonts/archivo-800-wordmark.woff2 "$URL"
```

## Photographs in `public/images`

- `workshop-001/*.jpg` — Antitect's own photographs, Workshop 001, Lagos,
  1 August 2026. They show identifiable people: confirm consent to appear in
  marketing before launch.
- `why-image.jpg` — stock, used in the "How it works" section. **The file
  supplied carries a visible "Unsplash+" watermark across it and must be
  replaced before launch**, either with the licensed, unwatermarked download
  or with one of Antitect's own photographs. Record the licence here once it
  is settled.
