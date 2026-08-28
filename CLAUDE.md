# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**دژنبشت (Dezhnebesht)** — "fortress of writings", after the Sasanian archive where a copy of the Avesta was kept. A personal encyclopedia: a static, dependency-free site published on GitHub Pages.

Content is split into **topics** (crypto & blockchain is the first); each topic has its own categories and entries. The index lists clickable terms with live search; each term has its own view with definition, explanation, optional example and diagram, hashtags, and links to related terms. Bilingual (Persian / English) with a language switch.

The design spec is `docs/superpowers/specs/2026-07-29-crypto-glossary-design.md` and the implementation plan is `docs/superpowers/plans/2026-07-29-crypto-glossary.md` — read the spec before making structural changes.

## Running

`fetch()` cannot read local JSON over `file://`, so opening `index.html` directly will load an empty page. Always serve it:

```
node serve.js                  # dependency-free static server in the repo
python3 -m http.server 8000    # alternative
```

There is no build or install step. Local serving is identical to what GitHub Pages runs.

Unit tests cover the pure modules (`validate`, `localized`, `filterEntries`, `normalize`, `parseHash`, the i18n key tables) plus the real data files on disk, using Node's built-in runner — nothing is installed:

```
node --test
```

Pass no path argument. `node --test test/` fails on Node 22 with `MODULE_NOT_FOUND` because it loads the directory as a module; explicit *file* paths work.

Before publishing, open `#/self-test` — it renders every entry in both languages and reports validation errors, render failures, entries missing an English translation, and entries that are not on their topic's roadmap.

## Constraints

- No framework, no npm packages, no build step. Plain HTML/CSS/JS with ES modules.
- No external hosts: no CDNs, no web fonts, no remote images. Diagrams are inline SVG, never raster images.
- Content is Persian-first; `dir`/`lang` flip with the language switch. English terms inside Persian text need `dir="ltr"` so they don't reverse.
- Give an established technical term its English name in parentheses on **first use** in the Persian body — `اثر بهمنی <span dir="ltr">(Avalanche Effect)</span>` — because that is the form the reader will meet again in documentation and search for later. Once per entry, not on every mention.
- Never set `letter-spacing` on Persian, and never set Persian in a monospace face. The script is cursive; both break the joins and the word stops reading as a word. Monospace is for Latin and hex only.
- An inline SVG inside an entry needs `direction="ltr"` on its root when it contains Latin or hex strings. The entry body is RTL and the SVG inherits it, which reorders and clips those strings.
- Write formulas in plain `<code>` with normal spaces. `render.js` turns the spaces of any inline `<code>` up to 32 characters into non-breaking ones, so `p − y` never splits across a line, while a 64-character hex key still wraps instead of overflowing. CSS cannot tell those two apart — it does not see length — so this is a render-time rule, not something an entry has to encode with invisible characters.
- Entry prose may use `<table>` for genuinely tabular content. Only horizontal rules are drawn; the table scrolls inside itself so the page body never scrolls horizontally.
- Before writing entries, read `docs/entry-conventions.md`. It is the set of rules learned while writing the 78 Docker Swarm entries — which Persian renderings are already taken and must not be re-coined, how «مدخل ‹عنوان›» may and may not be used, what CLI output has to look like to be honest, and the traps in proofing a diagram. Each rule there cost a review round.

## Architecture

Data lives in `data/`, code in `assets/js/`, and the two never mix: `data.js` does not touch the DOM, `render.js` does not load data.

Entries are the whole point of the project — everything else is derived. The index, categories, search, hashtag filters, and related-term links are all built from the data at load time. **Adding an entry must never require touching a JS file.**

It does require a second data file, though: every entry must also be placed in a stage of `data/<topic>/roadmap.json`, after everything that entry cites. `test/roadmap-order.test.mjs` reads those citations straight out of the Persian body and example — every `مدخل ‹عنوان›` is a real prerequisite — and fails both on an entry missing from the roadmap and on one placed before something it leans on, so a new entry turns `node --test` red until it is on the path. The roadmap stays data like everything else: `roadmap.js` is pure logic over it and never needs editing to add an entry.

An entry's **topic** comes from which directory under `data/` it lives in and its **category** from which file under that topic's `entries/`. Neither is a field on the entry. Language-neutral fields (`id`, `tags`, `related`, `svg`) sit outside the `fa`/`en` blocks so the two languages can't drift apart. Hashtags are stored as lowercase English slugs without `#`, so one tag is shared across both languages.

Entry `id`s are unique across the **whole site**, not per topic. That is deliberate: `#/t/<id>` never has to carry a topic, `related` can link across topics with no special syntax, and the duplicate-id check stays a plain global check. For an encyclopedia this is a feature — one term, one entry.

Search always spans every topic, even while a topic filter is active. The filter is for browsing; search deliberately escapes it, so you find an entry even when you've forgotten which topic you filed it under.

`data.js` validates on load — duplicate ids, missing required fields, `related` pointing at a nonexistent id — and shows failures in a banner without taking the page down. Broken `related` references are the most common breakage, since entries are added one at a time and often reference terms not yet written.

An entry with no `fa.title` is dropped from `loadAll`'s returned entries while keeping its error. Such an entry cannot be rendered in any view, and letting it through blanked the entire index — the site must come up despite bad data.
