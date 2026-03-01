/**
 * Converts a CSV file (Key, Value columns) to content.json.
 * Use this with a spreadsheet: export sheet as CSV, then run:
 *   node scripts/csv-to-content.js content.csv
 * Or put CSV at content.csv and run: node scripts/csv-to-content.js
 *
 * CSV format: first row = "Key", "Value". Each row = content key path, text value.
 * Use dot notation for nested keys: projects.0.title, info.skills, info.jobs.1.company
 */

const fs = require("fs");
const path = require("path");

const defaultCsv = path.join(__dirname, "..", "content.csv");
const csvPath = process.argv[2] || defaultCsv;
const outPath = path.join(__dirname, "..", "content.json");

function parseCSVRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function setAtPath(obj, pathStr, value) {
  const parts = pathStr.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = parts[i + 1];
    const isArrayIndex = /^\d+$/.test(next);
    if (current[k] === undefined) {
      current[k] = isArrayIndex ? [] : {};
    }
    current = current[k];
  }
  current[parts[parts.length - 1]] = value;
}

function run() {
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    console.error("Create content.csv with columns Key, Value (or export from Google Sheets).");
    process.exit(1);
  }
  const csv = fs.readFileSync(csvPath, "utf8");
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    console.error("CSV needs a header row (Key, Value) and at least one data row.");
    process.exit(1);
  }
  const header = parseCSVRow(lines[0]);
  const keyIdx = header.findIndex((h) => /key/i.test(h));
  const valIdx = header.findIndex((h) => /value/i.test(h));
  if (keyIdx < 0 || valIdx < 0) {
    console.error("CSV must have 'Key' and 'Value' columns.");
    process.exit(1);
  }
  const content = {};
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const key = (row[keyIdx] || "").trim();
    const value = (row[valIdx] || "").trim();
    if (!key) continue;
    setAtPath(content, key, value);
  }
  fs.writeFileSync(outPath, JSON.stringify(content, null, 2), "utf8");
  console.log("Wrote", outPath);
}

run();
