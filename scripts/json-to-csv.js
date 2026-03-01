/**
 * Flattens content.json to CSV (Key, Value) for editing in a spreadsheet.
 * Run: node scripts/json-to-csv.js
 * Then edit content.csv (or the file you export from Google Sheets), and run
 * node scripts/csv-to-content.js content.csv to update content.json.
 */

const fs = require("fs");
const path = require("path");

const contentPath = path.join(__dirname, "..", "content.json");
const outPath = path.join(__dirname, "..", "content.csv");

function flatten(obj, prefix, out) {
  if (obj === null || typeof obj !== "object") {
    out[prefix] = String(obj);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flatten(item, prefix + "." + i, out));
    return;
  }
  Object.keys(obj).forEach((k) => {
    const key = prefix ? prefix + "." + k : k;
    const v = obj[k];
    if (v !== null && typeof v === "object" && typeof v !== "string") {
      flatten(v, key, out);
    } else {
      out[key] = v == null ? "" : String(v);
    }
  });
}

function escapeCsv(val) {
  const s = String(val);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function run() {
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const flat = {};
  flatten(content, "", flat);
  const lines = ["Key,Value"];
  Object.keys(flat).sort().forEach((key) => {
    lines.push(escapeCsv(key) + "," + escapeCsv(flat[key]));
  });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log("Wrote", outPath);
}

run();
