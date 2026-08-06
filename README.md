# JetForce Washing — website

Static one-page site for JetForce Washing, served from GitHub Pages at
**https://www.jetforcewashing.com**.

No build step and no dependencies — plain HTML, CSS and JavaScript. Pushing to
`main` publishes the site.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, services, before/after, process, reviews, areas, FAQ, quote form |
| `styles.css` | All styling. Palette is derived from the logo's cyan-teal (`#379FBF`) |
| `script.js` | Mobile nav, sticky header, scroll reveals, quote-form submission |
| `404.html` | Not-found page |
| `CNAME` | Tells GitHub Pages the custom domain is `www.jetforcewashing.com` — do not delete |
| `assets/` | Logo and before/after photos |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | Search-engine and PWA metadata |

## Editing common things

**Phone number** — appears in several places. Search for `07427982678` (the
`tel:` links use `+447427982678`) and change every hit, including the
`telephone` field in the JSON-LD block near the bottom of `index.html`.

**Before/after photos** — replace `assets/before.jpg` and `assets/after.jpg`.
The layout crops to a 4:3 box automatically, so any reasonably sized photo
works. Keep them under ~300KB each so the page stays fast.

**Reviews** — the three `<figure class="quote">` blocks in the Reviews section.

**Service areas** — listed in three places: the `.areas-list` section, the
footer, and `areaServed` in the JSON-LD.

## Quote form

Submissions go to [Formspree](https://formspree.io) endpoint `xgvldaze`, which
emails them on. `script.js` posts via `fetch` and shows an inline confirmation,
so the visitor never leaves the page. If the request fails, the visitor is shown
the phone number and email instead.

To change where enquiries land, update the `action` URL on `#quoteForm`.

## Local preview

Because the page uses absolute paths (`/favicon.ico`) and `fetch`, open it
through a server rather than double-clicking the file:

```bash
python3 -m http.server 4173
```

Then visit http://localhost:4173.

## Deployment

GitHub Pages builds from the root of `main`. Pushing is deploying; a build
usually takes a minute or two.

DNS is managed at **Spaceship**. The records the site depends on:

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `www` | `ym-mmv.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

The `www` record is what actually serves the site. The four apex `A` records
make the bare `jetforcewashing.com` redirect to it rather than showing the
registrar's parking page.
