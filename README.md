# JetForce Washing — website

Static one-page site for JetForce Washing, served from GitHub Pages at
**https://ym-mmv.github.io/JetForceWashing-website/**.

No build step and no dependencies — plain HTML, CSS and JavaScript. Pushing to
`main` publishes the site via `.github/workflows/deploy.yml`.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, services, before/after, process, reviews, areas, FAQ, quote form |
| `styles.css` | All styling. Palette is derived from the logo's cyan-teal (`#379FBF`) |
| `script.js` | Mobile nav, sticky header, scroll reveals, quote-form submission |
| `404.html` | Not-found page |
| `assets/` | Logo and before / during / after photos |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | Search-engine and PWA metadata |

## Editing common things

**Phone number** — appears in several places. Search for `07427982678` (the
`tel:` links use `+447427982678`) and change every hit, including the
`telephone` field in the JSON-LD block near the bottom of `index.html`.

**Results photos** — replace `assets/before.jpg`, `assets/in-progress.jpg` and
`assets/after.jpg`. The layout crops to a 4:3 box automatically, so any
reasonably sized photo works. Keep them under ~300KB each so the page stays
fast. The hero image is `assets/hero.jpg`.

These are currently Creative Commons stock photos, which is why the footer
carries a credits line and the results section says "Illustrative
photography". **Once you swap in photos of your own jobs, delete both** — the
credits line in the footer and the `.ba-note` paragraph in the results
section.

**Reviews** — the three `<figure class="quote">` blocks in the Reviews section.

**Service areas** — listed in three places: the `.areas-list` section, the
footer, and `areaServed` in the JSON-LD.

## Quote form

Submissions go to [Formspree](https://formspree.io) endpoint `xgvldaze`, which
emails them on. `script.js` posts via `fetch` and shows an inline confirmation,
so the visitor never leaves the page. If the request fails, the visitor is shown
the phone number.

The form is the only way to reach JetForce by writing — there is deliberately no
email address on the site, because the old `@jetforcewashing.com` mailbox is no
longer available. To change where enquiries land, update the `action` URL on
`#quoteForm`.

## Local preview

The page uses `fetch`, so open it through a server rather than double-clicking
the file:

```bash
python3 -m http.server 4173
```

Then visit http://localhost:4173.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the
repo root to GitHub Pages. A deploy takes a minute or two.

The site lives at the project URL,
`https://ym-mmv.github.io/JetForceWashing-website/` — note the
`/JetForceWashing-website/` subpath. `index.html` uses **relative** asset paths
so it works both there and at a domain root; `404.html` uses absolute
`/JetForceWashing-website/…` paths because GitHub serves it for missing URLs at
any depth, where relative paths would resolve against the bad URL.

### Moving to a custom domain later

1. Buy the domain, then at the registrar add a `CNAME` record on `www` pointing
   to `ym-mmv.github.io`, plus four `A` records on `@` to `185.199.108.153`,
   `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
2. Add a `CNAME` file to the repo root containing just the hostname, e.g.
   `www.example.com`.
3. Set the domain under Settings → Pages, and tick **Enforce HTTPS**.
4. Update the absolute URLs to the new domain: `canonical`, `og:url`,
   `og:image`, `twitter:image` and the JSON-LD `@id` / `url` / `image` / `logo`
   in `index.html`, the `loc` in `sitemap.xml`, the `Sitemap:` line in
   `robots.txt`, and the paths in `404.html`.
