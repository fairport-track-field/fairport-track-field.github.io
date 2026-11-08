// Builds Fairport's Section V sectional championship stats from src/_data/sectionals.json.
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.join(__dirname, "..", "src", "_data", "sectionals.json");
const POINTS = [10, 8, 6, 4, 2, 1]; // current Section V sectional scoring
const LABELS = {
  "55m": "55m", "300m": "300m", "600m": "600m", "1000m": "1000m", "1500m": "1500m", "1600m": "1600m",
  "3000m": "3000m", "3200m": "3200m", "55mH": "55m Hurdles", RW: "1500m Racewalk",
  "4x200": "4x200 Relay", "4x400": "4x400 Relay", "4x800": "4x800 Relay",
  HJ: "High Jump", LJ: "Long Jump", TJ: "Triple Jump", PV: "Pole Vault", SP: "Shot Put", WT: "Weight Throw",
};
const ORDER = Object.keys(LABELS);
const FIRST_SEASON = 2003;

function who(r) {
  return r.athlete || "Relay team";
}

function build() {
  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const seasons = data.seasons
    .map((s) => {
      const results = s.results
        .map((r) => ({
          ...r,
          label: LABELS[r.event] || r.event,
          who: who(r),
          points: r.place && r.place <= POINTS.length ? POINTS[r.place - 1] : 0,
        }))
        .sort((a, b) =>
          a.gender.localeCompare(b.gender) ||
          ORDER.indexOf(a.event) - ORDER.indexOf(b.event) ||
          (a.place || 99) - (b.place || 99));
      const byGender = {};
      for (const g of ["girls", "boys"]) {
        const rs = results.filter((r) => r.gender === g);
        byGender[g] = {
          results: rs,
          champions: rs.filter((r) => r.place === 1),
          scorers: rs.filter((r) => r.points > 0),
          scoringPoints: rs.reduce((t, r) => t + r.points, 0),
          team: (s.team || {})[g] || null,
        };
        byGender[g].resultsMissing = rs.length === 0;
      }
      return { ...s, results, byGender };
    })
    .sort((a, b) => b.year - a.year);

  const champions = [];
  seasons.forEach((s) => ["girls", "boys"].forEach((g) =>
    s.byGender[g].champions.forEach((r) => champions.push({ ...r, year: s.year }))));

  // Individual titles per athlete (relay titles listed separately)
  const titleCount = {};
  champions.filter((c) => c.athlete).forEach((c) => {
    const key = `${c.gender}|${c.athlete}`;
    titleCount[key] = titleCount[key] || { athlete: c.athlete, gender: c.gender, titles: [] };
    titleCount[key].titles.push(`${c.label} ${c.year}`);
  });
  const multiChampions = Object.values(titleCount)
    .filter((a) => a.titles.length > 1)
    .sort((a, b) => b.titles.length - a.titles.length || a.athlete.localeCompare(b.athlete));

  const eventTitles = ORDER.map((ev) => ({
    event: ev,
    label: LABELS[ev],
    girls: champions.filter((c) => c.event === ev && c.gender === "girls").length,
    boys: champions.filter((c) => c.event === ev && c.gender === "boys").length,
  })).filter((e) => e.girls + e.boys > 0);

  const covered = seasons.map((s) => s.year);
  // Most recent sectional season that has already happened (sectionals are in February)
  const now = new Date();
  const lastHeld = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1;
  const latest = Math.max(lastHeld, ...covered);
  const missing = [];
  for (let y = latest; y >= FIRST_SEASON; y--) if (!covered.includes(y) && y !== 2021) missing.push(y);

  const teamTitles = [];
  seasons.forEach((s) => ["girls", "boys"].forEach((g) => {
    const t = s.byGender[g].team;
    if (t && t.place === 1) teamTitles.push({ year: s.year, gender: g, points: t.points, meet: s.meet, shared_with: t.shared_with });
  }));
  const partial = [];
  seasons.forEach((s) => ["girls", "boys"].forEach((g) => {
    if (s.byGender[g].resultsMissing) partial.push({ year: s.year, gender: g });
  }));

  const totals = {
    teamTitles: teamTitles.length,
    seasons: seasons.length,
    titles: champions.length,
    scorers: seasons.reduce((t, s) => t + s.byGender.girls.scorers.length + s.byGender.boys.scorers.length, 0),
    entries: seasons.reduce((t, s) => t + s.results.length, 0),
  };

  return { seasons, teamTitles, partial, champions, multiChampions, eventTitles, missing, totals, pointsTable: POINTS };
}

module.exports = { build };
