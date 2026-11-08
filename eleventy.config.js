const { HtmlBasePlugin } = require("@11ty/eleventy");
const rankings = require("./lib/rankings.js");
const sectionals = require("./lib/sectionals.js");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Dates in the data files are plain "YYYY-MM-DD" strings; parse them as local calendar dates.
function toDate(value) {
  if (value instanceof Date) return value;
  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/CNAME"); // only used if you add a custom domain
  eleventyConfig.addWatchTarget("src/_data/performances.csv");

  eleventyConfig.addGlobalData("rankings", () => rankings.build());
  eleventyConfig.addGlobalData("sectionalStats", () => sectionals.build());
  eleventyConfig.addWatchTarget("src/_data/sectionals.json");
  eleventyConfig.addFilter("ordinal", (n) => {
    const v = n % 100;
    const suf = v >= 11 && v <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" })[n % 10] || "th";
    return `${n}${suf}`;
  });
  eleventyConfig.addFilter("pts", (n) => (Number.isInteger(n) ? String(n) : String(Number(n).toFixed(1))));
  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().slice(0, 10));
  eleventyConfig.addFilter("nextMeet", (meets, today) => meets.find((m) => (m.end_date || m.date) >= today) || null);
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("weekday", (v) => DAYS[toDate(v).getUTCDay()]);
  eleventyConfig.addFilter("monthDay", (v) => {
    const d = toDate(v);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  });
  eleventyConfig.addFilter("longDate", (v) => {
    const d = toDate(v);
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("isoDate", (v) => toDate(v).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateRange", (start, end) => {
    const s = toDate(start);
    const base = `${DAYS[s.getUTCDay()]}, ${MONTHS[s.getUTCMonth()]} ${s.getUTCDate()}`;
    if (!end) return base;
    const e = toDate(end);
    return e.getUTCMonth() === s.getUTCMonth()
      ? `${base}–${e.getUTCDate()}`
      : `${base} – ${MONTHS[e.getUTCMonth()]} ${e.getUTCDate()}`;
  });
  eleventyConfig.addFilter("seasonLabel", (year) => {
    const y = parseInt(year, 10);
    return `${y - 1}–${String(y).slice(2)}`;
  });
  eleventyConfig.addFilter("excerpt", (content) => {
    const text = String(content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .replace(/\s+([:;,.!?])/g, "$1")
      .trim();
    return text.length > 180 ? text.slice(0, 180).replace(/\s+\S*$/, "") + "…" : text;
  });
  eleventyConfig.addFilter("groupBy", (items, key) => {
    const groups = [];
    items.forEach((item) => {
      let g = groups.find((x) => x.name === item[key]);
      if (!g) groups.push((g = { name: item[key], items: [] }));
      g.items.push(item);
    });
    return groups;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // GitHub Pages project sites live at /<repo-name>/; the deploy workflow sets this.
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
};
