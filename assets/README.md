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
