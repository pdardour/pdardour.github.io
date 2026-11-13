# filrock.com

Fil's website — French chansons and classic rock, live in South Florida.
It is a plain HTML site hosted for free on GitHub Pages, at https://filrock.com.
Do not delete the CNAME file: it tells GitHub to use the filrock.com address.

## What is where

| File | What it holds |
|---|---|
| `index.html` | Home page: set list, next shows, videos, songs, booking form, bio, photos |
| `videos.html` | All the videos, with a language filter and a search box |
| `photos.html` | All the photo galleries |
| `data/shows.js` | The upcoming shows, the booking email and the form key |
| `data/videos.js` | The list of videos (title, artist, place, link) |
| `data/photos.js` | The photo galleries and their captions |
| `assets/` | Styles, script, photos and video preview pictures |

## Common changes

**Add a show** — open `data/shows.js`, copy one show block, change the date (YYYY-MM-DD), place and time. Past shows hide by themselves.

**Move a video to YouTube** — open `data/videos.js`, find the song, and paste the YouTube video ID between the quotes of `"youtube": ""`.
The ID is the part after `v=` in a YouTube link (for `https://www.youtube.com/watch?v=abc123XYZ`, the ID is `abc123XYZ`).
Until a video has a YouTube ID, it plays from the copy stored on the old Wix site.

**Get booking requests straight to your inbox** — put a free Web3Forms access key in `FILROCK_FORM_KEY` in `data/shows.js`.
Without a key, the form opens the visitor's email app, addressed to fil@filrock.com.

## After each change
Bump the `?v=` number on the CSS, JS and data file links in every .html page (for example `?v=20261113c` → `?v=20261114a`), so visitors get the new files right away instead of an old copy from their browser cache.
