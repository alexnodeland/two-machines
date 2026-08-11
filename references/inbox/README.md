# Drop zone

Put manually collected sources here, named after their manifest id:

    michigan-daily-1979.html
    eno-discreet-music-sleeve.jpg

Then run:

    node extract.mjs

HTML is extracted to clean Markdown in `files/`. Anything else (PDF, image,
audio) is stored in `files/raw/` as-is. Either way the file is adopted and this
folder goes back to empty.

A file whose name does not match a manifest id is left here untouched, with a
warning — that is the check against silently archiving something we cannot cite.

See `../collect.html` for the list of what is still needed.
