#!/usr/bin/env node
// Fails if the CMS font dropdowns drift from the font catalog, or a catalog
// entry's stack doesn't lead with its label (the @font-face family name).
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "src/_data/fontCatalog.json"), "utf8"));
const config = fs.readFileSync(path.join(root, "src/admin/config.yml"), "utf8");

const slugs = Object.keys(catalog).sort();
let failed = false;

const optionValues = [...config.matchAll(/\{ label: [^,}]+, value: ([a-z0-9-]+) \}/g)].map((m) => m[1]);
const expected = [...slugs, ...slugs].sort();
if (JSON.stringify(optionValues.sort()) !== JSON.stringify(expected)) {
  console.error("CMS font dropdown options do not match fontCatalog.json (each slug must appear in both Display and Body dropdowns)");
  console.error(`catalog: ${slugs.join(", ")}`);
  console.error(`config:  ${optionValues.join(", ")}`);
  failed = true;
}

for (const [slug, family] of Object.entries(catalog)) {
  if (!family.stack.startsWith(`"${family.label}"`)) {
    console.error(`${slug}: stack must start with "${family.label}"`);
    failed = true;
  }
  if (!Array.isArray(family.weights) || family.weights.length === 0) {
    console.error(`${slug}: weights must be a non-empty array`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("font catalog and CMS dropdowns are in sync");
