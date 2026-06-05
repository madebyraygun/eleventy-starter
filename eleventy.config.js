const fs = require("node:fs");
const markdownIt = require("markdown-it");
const { designOverridesCss } = require("./lib/design-overrides");
const { fontFacesCss, downloadMissingFonts } = require("./lib/fonts");

module.exports = function (eleventyConfig) {
  // Sveltia CMS admin UI, uploads, and site assets are copied through as-is.
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Markdown rendering for block fields (Text, FAQ answers). html:true is
  // deliberate: block markdown is trusted single-owner content.
  const md = markdownIt({ html: true, linkify: true });
  eleventyConfig.addFilter("md", (value) => (value ? md.render(String(value)) : ""));

  // Design token overrides from CMS Site Settings.
  eleventyConfig.addFilter("designOverrides", designOverridesCss);
  eleventyConfig.addFilter("fontFaces", fontFacesCss);
  eleventyConfig.on("eleventy.before", async () => {
    const site = JSON.parse(fs.readFileSync("src/_data/site.json", "utf8"));
    const catalog = JSON.parse(fs.readFileSync("src/_data/fontCatalog.json", "utf8"));
    await downloadMissingFonts(site.design || {}, catalog, "src/assets/fonts");
  });

  // Header/footer navigation: pages that opt in, in nav_order.
  eleventyConfig.addCollection("nav", (api) =>
    api
      .getFilteredByGlob("src/pages/**/*.md")
      .filter((p) => p.data.nav_show !== false)
      .sort((a, b) => (a.data.nav_order ?? 99) - (b.data.nav_order ?? 99))
  );

  // Per-template collections; globs that don't exist simply yield empty lists,
  // so one shared config serves every template.
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("projects", (api) =>
    api
      .getFilteredByGlob("src/projects/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );
  eleventyConfig.addCollection("docs", (api) =>
    api
      .getFilteredByGlob("src/docs/**/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // Honor the PORT set by Push Pop (each profile gets its own port).
  eleventyConfig.setServerOptions({ port: Number(process.env.PORT) || 8088 });

  return {
    dir: { input: "src", output: "_site" },
  };
};
