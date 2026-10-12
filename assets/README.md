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

## Tool logos in `public/logos`

The ten badges around the home page hero. Each file is the company's own,
fetched 2026-10-07 and used as downloaded: not recoloured, cropped, outlined or
redrawn. Only its display size changes.

| Tool | File | Source |
|---|---|---|
| Make | make.png | https://www.make.com/en/android-chrome-512x512.png (from make.com/site.webmanifest) |
| Zapier | zapier.png | https://zapier.com/favicon.ico, the 192px layer |
| n8n | n8n.png | https://n8n.io/android-chrome-512x512.png |
| Gmail | gmail.png | https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_512dp.png |
| Google Sheets | google-sheets.png | https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_512dp.png |
| Instagram | instagram.png | https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png |
| YouTube | youtube.png | https://www.gstatic.com/images/branding/product/2x/youtube_48dp.png |
| TikTok | tiktok.png | https://sf16-sg.tiktokcdn.com/obj/eden-sg/uvkuhyieh7lpqpbj/pwa/512x512.png (from tiktok.com/manifest.json) |
| Paystack | paystack.png | https://paystack.com/favicon.ico, the 48px layer |
| Notion | notion.png | https://www.notion.so/images/logo-ios.png |

Zapier and Paystack publish only `.ico` files, which the image optimiser
serves as they are. Their largest layer was converted to PNG pixel for pixel.
Paystack's largest is 48px, a little under twice its display size.

Before launch, swap in files from each company's brand kit and check its usage
terms: most ask you not to imply partnership or endorsement.

## Photographs in `public/images`

- `workshop-001/*.jpg` — Antitect's own photographs, Workshop 001, Lagos,
  1 August 2026. They show identifiable people: confirm consent to appear in
  marketing before launch.

## Newsreader in `fonts/`

`newsreader-48-latin.woff2` and `newsreader-48-latin-ext.woff2` are
Newsreader (SIL Open Font License) with its optical size fixed at 48 and its
weight free from 500 to 600, as Google Fonts serves
`Newsreader:opsz,wght@48,500..600`. They are loaded by `lib/fonts/site.ts`.
To regenerate them, request that CSS with a current browser's user agent and
download the `latin` and `latin-ext` files it names.

## Share-image fonts in `fonts/`

The link-preview images (`lib/share-image.tsx`) are drawn by a renderer that
reads TrueType, not the WOFF2 the pages use, so they have copies of their own,
read on the server only and never sent to a browser:

- `public-sans-500.ttf`: Public Sans Medium (SIL Open Font License), the full
  character set, so any title or date the CRM holds draws.
- `newsreader-48-600.ttf`: Newsreader SemiBold at optical size 48 (SIL Open
  Font License), full character set.
- `archivo-800-wordmark.ttf`: Archivo ExtraBold cut to the letters of ANTITECT.

To regenerate one, ask Google Fonts for TrueType with an old user agent:

```sh
URL=$(curl -s -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@48,600" | grep -o "https://[^)]*" | head -1)
curl -s -o assets/fonts/newsreader-48-600.ttf "$URL"
```
