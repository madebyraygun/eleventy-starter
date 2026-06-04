#!/usr/bin/env node
// Activates one template layer and one theme, then removes itself.
// Zero dependencies: runs before `npm install` on a fresh clone.
//   node scaffold/scaffold.js --template=blog --theme=paper
const fs = require("node:fs");
const path = require("node:path");

const TEMPLATES = ["blog", "portfolio", "docs"];
const THEMES = ["paper", "signal", "carbon", "dune"];

function fail(message) {
  console.error(`scaffold: ${message}`);
  process.exit(1);
}

const args = {};
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)=(.+)$/);
  if (!m) fail(`unrecognized argument: ${arg}`);
  args[m[1]] = m[2];
}

const { template, theme } = args;
if (!template) fail("missing --template");
if (!theme) fail("missing --theme");
if (!TEMPLATES.includes(template)) fail(`unknown template: ${template}`);
if (!THEMES.includes(theme)) fail(`unknown theme: ${theme}`);

const root = path.join(__dirname, "..");
const layer = path.join(__dirname, template);
if (!fs.existsSync(path.join(layer, "src"))) fail(`missing template layer: ${layer}/src`);
if (!fs.existsSync(path.join(layer, "cms.yml"))) fail(`missing template layer: ${layer}/cms.yml`);

// 1. Overlay the template's seed content onto src/.
fs.cpSync(path.join(layer, "src"), path.join(root, "src"), { recursive: true });

// 2. Merge the template's CMS collections (collections: is the final key in config.yml).
const cmsPath = path.join(root, "src", "admin", "config.yml");
fs.appendFileSync(cmsPath, "\n" + fs.readFileSync(path.join(layer, "cms.yml"), "utf8"));

// 3. Record template and theme in site settings.
const sitePath = path.join(root, "src", "_data", "site.json");
const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
site.template = template;
site.theme = theme;
fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + "\n");

// 4. Remove the scaffold machinery from the new site.
fs.rmSync(__dirname, { recursive: true, force: true });

console.log(`scaffolded template=${template} theme=${theme}`);
