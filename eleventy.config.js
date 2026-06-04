const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Sveltia CMS admin UI, uploads, and site assets are copied through as-is.
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Markdown rendering for block fields (Text, FAQ answers). html:true is
  // deliberate: block markdown is trusted single-owner content.
  const md = markdownIt({ html: true, linkify: true });
  eleventyConfig.addFilter("md", (value) => (value ? md.render(String(value)) : ""));

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
