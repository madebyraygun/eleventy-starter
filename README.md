# eleventy-starter

The Eleventy + Sveltia CMS engine that [Push Pop](https://github.com/madebyraygun/push-pop)
clones when creating a new site. One shared engine, three templates:

- **Blog** — posts, archive, about
- **Portfolio** — projects with covers and galleries
- **Docs** — sidebar-ordered documentation pages

## How a site is created

Push Pop runs, in order:

```sh
git clone <this repo> <site>
node scaffold/scaffold.js --template=<blog|portfolio|docs> --theme=<paper|signal|carbon|dune>
npm install
```

`scaffold.js` overlays the template's seed content onto `src/`, merges its CMS
collections into `src/admin/config.yml`, records the template and theme in
`src/_data/site.json`, and deletes `scaffold/`.

## Architecture

- `src/_includes/blocks/` — the page-builder blocks (heading, text, image, gallery,
  faq, cta). A page is a `blocks` list edited in the CMS; `layouts/page.njk` renders it.
  Adding a block type = one partial here + one schema entry in `src/admin/config.yml`.
- `src/assets/css/core.css` — all structure and layout, consuming tokens only.
- `src/assets/css/themes/` — one design-token file per theme. Owners switch themes in
  the CMS Site Settings panel. Every theme must define the full token set
  (`node scaffold/check-themes.js` enforces this).
- `src/_data/site.json` — site name, active theme, extra nav links, footer text.
  Exposed in the CMS as Site Settings.
- Navigation builds automatically from pages with `nav_show`/`nav_order`; Site
  Settings adds extra links and footer text.
- `scaffold/<template>/` — seed pages (`src/` overlay) + CMS collections fragment
  (`cms.yml`). `src/admin/config.yml` must keep `collections:` as its final key,
  because the fragment is merged by appending.

## Develop

```sh
npm install
npm test                        # scaffold.js tests (node:test)
node scaffold/check-themes.js   # theme token completeness
```

To try a template locally, copy the repo to a scratch dir, run `scaffold.js`,
then `npm install && npm run dev`. CI builds all three templates on every push.
