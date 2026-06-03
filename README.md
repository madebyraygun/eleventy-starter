# Eleventy + Sveltia CMS starter

The starter [Push Pop](https://github.com/daltonrooney/site-manager) clones when you
create a new site. Eleventy for the site, Sveltia CMS at `/admin/` for editing,
rsync-over-SSH for deploys.

## Local

```bash
npm install
npm run dev          # serves on $PORT (default 8088); Push Pop sets PORT per profile
```

Eleventy honors the `PORT` env var (see `eleventy.config.js`) so each Push Pop profile
runs on its own port.

### Editing content locally

`/admin/` loads Sveltia CMS. For local editing without GitHub auth, run the proxy
alongside the dev server:

```bash
npx @sveltia/cms-proxy-server
```

(`local_backend: true` in `src/admin/config.yml` enables this.)

## Deploy

```bash
npm run deploy       # build + rsync _site/ to the server
npm run deploy:dry   # show what would change, transfer nothing
```

Deploy reads `deploy.env` (gitignored, written by Push Pop):

```
DEPLOY_HOST=user@server
DEPLOY_PATH=/var/www/.../public_html
# optional: DEPLOY_PORT (default 22), DEPLOY_KEY (default ~/.ssh/id_rsa)
```
