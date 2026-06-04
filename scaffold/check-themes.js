#!/usr/bin/env node
// Fails if any theme file is missing any required design token.
const fs = require("node:fs");
const path = require("node:path");

const REQUIRED = [
  "--color-bg", "--color-surface", "--color-text", "--color-muted",
  "--color-accent", "--color-accent-contrast",
  "--font-display", "--font-body",
  "--radius", "--space-unit", "--content-width",
];

const dir = path.join(__dirname, "..", "src", "assets", "css", "themes");
let failed = false;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".css"))) {
  const css = fs.readFileSync(path.join(dir, file), "utf8");
  for (const token of REQUIRED) {
    if (!css.includes(`${token}:`)) {
      console.error(`${file}: missing ${token}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("all themes define the full token set");
