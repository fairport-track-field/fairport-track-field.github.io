// Reads src/_data/performances.csv and builds ranked all-time lists.
// You never need to sort the CSV: marks are parsed and ranked here at build time.
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("csv-parse/sync");

const CSV = path.join(__dirname, "..", "src", "_data", "performances.csv");
const EVENTS = require("../src/_data/events.json");
const LIST_LENGTH = 10;

// "6.37" -> 6.37, "1:32.54" -> 92.54, "10:45.0" -> 645
function parseTime(mark) {
  const clean = String(mark).replace(/[^0-9:.]/g, "");
  if (!clean) return NaN;
  return clean.split(":").reduce((total, part) => total * 60 + parseFloat(part), 0);
}

// "22-11.25" / "22' 11.25\"" / "37'06\"" -> inches
function parseDistance(mark) {
  const m = String(mark).match(/(\d+)\s*['\-]\s*(\d+(?:\.\d+)?)?/);
  if (m) return parseInt(m[1], 10) * 12 + (m[2] ? parseFloat(m[2]) : 0);
  const feet = parseFloat(mark);
  return Number.isFinite(feet) ? feet * 12 : NaN;
}

function markValue(mark, measure) {
  return measure === "distance" ? parseDistance(mark) : parseTime(mark);
}

function loadPerformances() {
  const rows = parse(fs.readFileSync(CSV, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return rows.map((row, index) => ({ ...row, order: index }));
}

function rank(entries, measure) {
  const better = measure === "distance" ? (a, b) => b.value - a.value : (a, b) => a.value - b.value;
  const sorted = [...entries].sort((a, b) => better(a, b) || a.order - b.order);
  let lastValue = null;
  let lastRank = 0;
  sorted.forEach((entry, i) => {
    // Equal marks share a rank (standard competition ranking: 1, 2, 2, 4)
    if (lastValue === null || Math.abs(entry.value - lastValue) > 1e-9) lastRank = i + 1;
    entry.rank = lastRank;
    lastValue = entry.value;
  });
  sorted.forEach((entry) => {
    entry.tied = sorted.filter((other) => other.rank === entry.rank).length > 1;
  });
  return sorted;
}

function build() {
  const performances = loadPerformances();
  const warnings = [];
  const currentYear = Math.max(...performances.map((p) => parseInt(p.year, 10) || 0));

  const events = EVENTS.map((event) => {
    const result = { ...event, lists: {} };
    for (const gender of ["girls", "boys"]) {
      const code = event[gender];
      if (!code) {
        result.lists[gender] = null;
        continue;
      }
      const entries = performances
        .filter((p) => p.gender === gender && p.event === code)
        .map((p) => ({ ...p, value: markValue(p.mark, event.measure) }))
        .filter((p) => {
          if (Number.isFinite(p.value)) return true;
          warnings.push(`Skipped ${gender} ${code} row ${p.order + 2}: unreadable mark "${p.mark}"`);
          return false;
        });
      const ranked = rank(entries, event.measure);
      result.lists[gender] = {
        code,
        all: ranked,
        top: ranked.filter((e) => e.rank <= LIST_LENGTH),
        record: ranked.filter((e) => e.rank === 1),
      };
    }
    return result;
  });

  const known = new Set(EVENTS.flatMap((e) => [e.girls && `girls|${e.girls}`, e.boys && `boys|${e.boys}`]).filter(Boolean));
  performances.forEach((p) => {
    if (!known.has(`${p.gender}|${p.event}`)) warnings.push(`Row ${p.order + 2}: unknown gender/event "${p.gender}, ${p.event}"`);
  });
  warnings.forEach((w) => console.warn(`[rankings] ${w}`));

  // Marks from the most recent season that made a top-10 list
  const recent = [];
  events.forEach((event) => {
    ["girls", "boys"].forEach((gender) => {
      const list = event.lists[gender];
      if (!list) return;
      list.top
        .filter((e) => parseInt(e.year, 10) === currentYear)
        .forEach((e) => recent.push({ ...e, eventLabel: event.label, eventId: event.id, isRelay: event.group === "Relays" }));
    });
  });
  // Best placings first; individual events ahead of relays at the same place.
  recent.sort((a, b) => a.rank - b.rank || a.isRelay - b.isRelay);

  return { events, currentYear, recent, listLength: LIST_LENGTH };
}

module.exports = { build, parseTime, parseDistance };
