# Milan Pocket Guide

A tiny, self-contained guide to a few favourite places in Milan — somewhere to
**eat** and something to **see**. Three plain HTML pages, no frameworks, no build
step, no server required.

## What's here

```
city-guide/
├── index.html   Home page — short intro + links to Eat and See
├── eat.html     List of places to eat
├── see.html     List of things to see
├── data.js      All the place data (name + one-line description)
├── style.css    One stylesheet shared by all three pages
└── README.md    This file
```

## How it's put together

Two small design choices keep things tidy:

- **One shared stylesheet.** Every page links the same `style.css`
  (`<link rel="stylesheet" href="style.css">`), so there are no per-page styles to
  keep in sync — change the look in one place and all pages update.

- **Data lives in one file.** All the places are defined in `data.js` as a single
  `MILAN` object with two lists, `eat` and `see`. The pages don't hardcode any
  places — `eat.html` and `see.html` each include `data.js` and render their list
  from it with a few lines of JavaScript. Add or edit a place in `data.js` and the
  pages pick it up automatically.

> Why a `.js` data file instead of `.json`? Browsers block `fetch()` of local files
> opened with `file://`, which would force you to run a local web server. A plain
> `data.js` loaded with a `<script>` tag avoids that, so the guide just works when
> you open it directly.

## How to run it

No installation, no build, no server.

1. Open the `city-guide` folder.
2. Double-click **`index.html`** to open it in your web browser.
3. Use the Home / Eat / See links at the top to move between pages.

That's it. To run it through a local server instead (optional), from this folder:

```
python -m http.server
```

then visit <http://localhost:8000>.

## Scope

Intentionally minimal. No maps, search, photos, mobile polish, or frameworks — just
three pages, shared CSS, and a single data file.
