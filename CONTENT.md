# Managing site content from a spreadsheet

All written content is driven by **`content.json`**. When you update that file (or update a spreadsheet and regenerate it), the HTML pages load the new copy automatically.

## Option 1: Edit `content.json` directly

Edit `content.json` in the project. Use the same structure (see existing keys). Deploy or refresh the site; the loader script injects the values into the page.

## Option 2: Use a spreadsheet (Google Sheets, Excel, etc.)

### Step 1: Export current content to CSV

From the project folder:

```bash
npm run export-content
```

This creates **`content.csv`** with columns `Key` and `Value`. Open it in Excel or Google Sheets (File → Import or upload the file).

### Step 2: Edit in the spreadsheet

- **Key** = content path (e.g. `headerIntro`, `projects.0.title`, `info.skills`, `info.jobs.1.company`).
- **Value** = the text (or HTML for keys like `headerIntro` / `headerIntroInfo`).

Keep the Key column exactly as is; only change the Value column. Add new rows with new keys if you add new content blocks (you’ll need to add the matching `data-content="key"` or `data-content-html="key"` in the HTML).

### Step 3: Save and convert back to JSON

- **Google Sheets:** File → Download → Comma-separated values (.csv). Save as `content.csv` in the project root.
- **Excel:** Save As → CSV (UTF-8).

Then run:

```bash
npm run update-content
```

Or with a custom file:

```bash
node scripts/csv-to-content.js path/to/your-file.csv
```

This overwrites **`content.json`** with the data from the CSV. Reload the site to see changes.

## Key paths reference

| Key | Used on | Description |
|-----|---------|-------------|
| `headerIntro` | Index | Intro paragraph (can include HTML, e.g. mailto link) |
| `headerIntroInfo` | Info | Intro paragraph on Info page |
| `miscIntro` | Misc. | Intro on Misc. page |
| `projects.0.title` … `projects.5.title` | Index | Case study titles (Wordibly → Bloom) |
| `projects.0.role`, `.contributions`, `.about` | Index | Role, contributions, about per project |
| `info.contact.email`, `.phone`, `.linkedin` | Info | Contact line items |
| `info.skills`, `info.software`, `info.clients` | Info | Long text blocks |
| `info.jobs.0.company`, `.title`, `.dates` … `info.jobs.3.*` | Info | Work experience rows |
| `info.education.0`, `info.education.1` | Info | Education lines |

## Misc. page images

Put image files in **`assets/misc/`** (e.g. `assets/misc/1.png`, `assets/misc/sketch.jpg`). Then list their paths in `content.json` under **`miscImages`** so the playground uses them instead of the placeholder:

```json
"miscImages": [
  "assets/misc/1.png",
  "assets/misc/2.png",
  "assets/misc/thing.jpg"
]
```

Order in the array = order they appear (one every ~1.4s). If `miscImages` is empty or missing, the page shows 14 placeholder images.

## Notes

- **HTML:** Only use HTML in values for keys that are injected with `data-content-html` (e.g. `headerIntro`, `headerIntroInfo`). Other keys are inserted as plain text.
- **Quotes in CSV:** If a value contains commas or line breaks, wrap the whole value in double quotes; use `""` for a literal quote inside the value.
- **Same origin:** The site loads `content.json` from the same origin as the page (e.g. `./content.json`). Ensure `content.json` is deployed next to your HTML.
