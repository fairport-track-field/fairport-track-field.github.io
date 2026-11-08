# Fairport Track & Field website

A free, static team site built with [Eleventy](https://www.11ty.dev/) and hosted on GitHub Pages. All content lives in plain data files and Markdown. Edit a file, push, and the site rebuilds itself in about a minute.

## Pages

| Page | Comes from |
|---|---|
| Home (next meet, latest news, last season's top-10 marks) | built automatically from the files below |
| News | `src/posts/*.md` |
| Schedule & results | `src/_data/schedule.json` |
| School records | the #1 marks in `src/_data/performances.csv` |
| Top 10 | `src/_data/performances.csv` |
| Varsity standards | `src/_data/standards.json` |
| Championship history | `src/_data/championships.json` |

## Put it online (one time, about 10 minutes)

1. Create a free GitHub account if you don't have one, then create a new **public** repository (for example `fairport-track`).
2. Upload this folder's contents to it (or `git init && git add . && git commit -m "First version" && git push`).
3. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and watch the "Build and deploy" run finish. Your site is live at `https://<your-username>.github.io/fairport-track/`.

Want a cleaner address?
- Name the repository `<your-username>.github.io` and the site lives at the root: `https://<your-username>.github.io/`.
- Or buy a domain (about $12/year, the only cost), add a file `src/CNAME` containing just the domain (e.g. `fairporttrack.com`), and follow GitHub's custom-domain steps under Settings → Pages.

## Everyday updates

You can edit any file right on github.com (pencil icon) and commit. The site rebuilds automatically.

### Post a meet recap or news item

Add a file to `src/posts/`, named `YYYY-MM-DD-short-title.md`:

```markdown
---
title: Raiders open the season at Nazareth
date: 2026-12-05
author: Coach Smith
---

Write the post in Markdown. **Bold**, _italic_, [links](https://example.com), lists and images all work.
```

Its address will be `/news/short-title/` (the filename without the date).

### Link results after a meet

In `src/_data/schedule.json`, paste the Yen Timing results link into that meet's `results_url`, and optionally a recap link into `recap` (e.g. `"/news/raiders-open-the-season/"`). Also set `results_home` in `src/_data/site.json` to your Yen Timing page for a site-wide link in the footer.

### Add a new top-10 mark

Add **one row** anywhere in `src/_data/performances.csv`. You never need to sort the file or renumber anything. The site parses the marks, ranks them, handles ties (equal marks share a place, shown as "T7"), and keeps the top 10 per event. The school records page shows the #1 marks automatically.

```csv
gender,event,athletes,mark,year,meet,notes
girls,300m,Savanna Biehler,40.10,2027,,
boys,4x400,"Bowen (52.10), Corwin (52.40), Hickey (53.00), Newburge (51.20)",3:29.10,2027,,
```

- **gender**: `girls` or `boys`
- **event**: one of `55m 300m 600m 1000m 1500m 1600m 3000m 3200m 55mH RW LJ TJ HJ PV SP WT 4x200 4x400 4x800 SMR DMR` (girls run 1500m/3000m, boys 1600m/3200m. These are set in `src/_data/events.json`.)
- **athletes**: one name, or the relay legs. Wrap in quotes if it contains commas.
- **mark**: times like `7.16`, `1:32.54`; distances like `22-11.25` (feet-inches).
- **year**: the year the season *ends* (the 2026–27 season is `2027`). The highlighted "current season" rows use the latest year in the file.
- **meet** (optional): shown for relays when the legs aren't known.
- **notes** (optional): a short note shown under the name.

Rows that fall out of the top 10 stay in the file, which keeps a full history. If a row has a mark the site can't read, the build log prints a warning and skips that row.

Tip: this file opens in Excel or Google Sheets. Save it back as CSV.

### Next season's schedule

Replace the meets in `src/_data/schedule.json` and update `season`. Dates are `YYYY-MM-DD`; multi-day meets also get an `end_date`; set `"championship": true` to highlight a meet in red.

### Championship history

Add entries to `src/_data/championships.json`:

```json
{
  "results": [
    {
      "year": 2026,
      "meet": "Class A1 Sectionals",
      "girls": "1st",
      "boys": "4th",
      "champions": [
        { "athlete": "Savanna Biehler", "gender": "Girls", "event": "55m", "mark": "7.16" }
      ],
      "notes": "Optional short note"
    }
  ]
}
```

Seasons are grouped and listed newest first.

## Working on it locally (optional)

Needs Node 18+.

```bash
npm install
npm start        # live preview at http://localhost:8080
npm run build    # outputs the finished site to _site/
```

## How it's built

- `eleventy.config.js`: site setup and date filters
- `lib/rankings.js`: reads `performances.csv`, parses marks and builds the ranked lists
- `src/_includes/`: page layouts
- `src/assets/`: styles, the small script (next-meet countdown, past-meet shading, girls/boys filter) and self-hosted fonts (Big Shoulders Display and Barlow, both free under the Open Font License)
