const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const REPO = path.join(__dirname, "..");

function freshCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "starter-"));
  fs.cpSync(REPO, dir, {
    recursive: true,
    filter: (src) => !/node_modules|\.git$|\.git\/|_site/.test(src),
  });
  return dir;
}

function scaffold(dir, args) {
  return spawnSync("node", [path.join(dir, "scaffold", "scaffold.js"), ...args], {
    encoding: "utf8",
  });
}

test("scaffolds blog: seeds pages, merges CMS, writes site.json, removes scaffold/", () => {
  const dir = freshCopy();
  execFileSync("node", [path.join(dir, "scaffold", "scaffold.js"), "--template=blog", "--theme=carbon"]);
  assert.ok(fs.existsSync(path.join(dir, "src/pages/index.md")));
  assert.ok(fs.existsSync(path.join(dir, "src/posts/welcome.md")));
  const cms = fs.readFileSync(path.join(dir, "src/admin/config.yml"), "utf8");
  assert.match(cms, /name: posts/);
  const site = JSON.parse(fs.readFileSync(path.join(dir, "src/_data/site.json"), "utf8"));
  assert.strictEqual(site.template, "blog");
  assert.strictEqual(site.theme, "carbon");
  assert.ok(!fs.existsSync(path.join(dir, "scaffold")));
});

test("rejects unknown template", () => {
  const dir = freshCopy();
  const r = scaffold(dir, ["--template=shop", "--theme=paper"]);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /unknown template/);
  assert.ok(fs.existsSync(path.join(dir, "scaffold")), "scaffold/ must survive a failed run");
});

test("rejects unknown theme", () => {
  const dir = freshCopy();
  const r = scaffold(dir, ["--template=blog", "--theme=neon"]);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /unknown theme/);
});

test("rejects missing arguments", () => {
  const dir = freshCopy();
  const r = scaffold(dir, ["--template=blog"]);
  assert.notStrictEqual(r.status, 0);
});

test("refuses to run against an already-scaffolded config", () => {
  const dir = freshCopy();
  fs.appendFileSync(path.join(dir, "src/admin/config.yml"), "\n  - name: posts\n");
  const r = scaffold(dir, ["--template=blog", "--theme=paper"]);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /already scaffolded/);
});
