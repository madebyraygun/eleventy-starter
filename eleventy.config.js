module.exports = function (eleventyConfig) {
  // Sveltia CMS admin UI and uploaded media are copied through as-is.
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });

  // Honor the PORT set by Push Pop (each profile gets its own port).
  eleventyConfig.setServerOptions({ port: Number(process.env.PORT) || 8088 });

  return {
    dir: { input: "src", output: "_site" },
  };
};
