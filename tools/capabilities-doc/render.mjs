#!/usr/bin/env node
// Render the capability scorecards from the JSON source of truth into a markdown
// view. The JSON in docs/capabilities/data/ is the source of truth; this script
// generates docs/capabilities/scorecards.md so the tables can never drift from it.
//
//   node tools/capabilities-doc/render.mjs          # write scorecards.md
//   node tools/capabilities-doc/render.mjs --check   # exit 1 if scorecards.md is stale
//
// Wired as `npm run capabilities:render` / `npm run capabilities:check`.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA = join(ROOT, "docs", "capabilities", "data");
const OUT = join(ROOT, "docs", "capabilities", "scorecards.md");

const read = (f) => JSON.parse(readFileSync(join(DATA, f), "utf8"));

// Strip the LaTeX score helpers that may appear in pre-rendered table cells.
//   \axis{2} -> 2 ; \mat{3} -> 3 ; \matt{1}{DEAD} -> 1 (dead)
const clean = (s) =>
  String(s)
    .replace(/\\matt\{(\d+)\}\{([^}]*)\}/g, (_, n, tag) => `${n} (${tag.toLowerCase()})`)
    .replace(/\\(?:axis|mat)\{(\d+)\}/g, "$1")
    .trim();

const fsNum = (id) => parseInt(String(id).replace(/\D/g, ""), 10);
const table = (header, rows) =>
  [
    `| ${header.join(" | ")} |`,
    `|${header.map(() => "---").join("|")}|`,
    ...rows.map((r) => `| ${r.map(clean).join(" | ")} |`),
  ].join("\n");

function render() {
  const caps = read("capabilities.json");
  const sets = read("feature_sets.json").sort((a, b) => fsNum(a.id) - fsNum(b.id));
  const tables = read("tables.json");

  const out = [];
  out.push("<!-- GENERATED from docs/capabilities/data/*.json by tools/capabilities-doc/render.mjs.");
  out.push("     Do not edit by hand — edit the JSON and run `npm run capabilities:render`. -->");
  out.push("");
  out.push("# Capability scorecards (generated)");
  out.push("");
  out.push("Rendered from the JSON source of truth in `data/`. Axes are **C·Q·T·R·S**");
  out.push("(Completeness · Quality · Tests · Reliability · Security), each 0–4; **Maturity**");
  out.push("is 1–5 (Initial→Optimized). See `README.md` for the rubric and");
  out.push("`system-assessment.md` for the narrative analysis.");
  out.push("");

  // Per-feature-set capability tables
  out.push("## Capabilities by feature set");
  out.push("");
  for (const set of sets) {
    const rows = caps
      .filter((c) => c.feature_set === set.id)
      .map((c) => [
        c.dead ? `~~${c.name}~~` : c.name,
        `${c.cmpl}·${c.qual}·${c.test}·${c.rel}·${c.sec}`,
        c.dead ? `${c.maturity} (dead)` : c.maturity,
        c.evidence,
      ]);
    if (!rows.length) continue;
    out.push(`### ${set.domain}`);
    out.push(`*Importance ${set.importance} · Audience ${set.audience}*`);
    out.push("");
    out.push(table(["Capability", "C·Q·T·R·S", "Maturity", "Evidence"], rows));
    out.push("");
  }

  // Feature-set summary
  out.push("## Feature-set summary");
  out.push("");
  out.push(
    table(
      ["Feature Set", "Coh", "Coup", "Compl", "Bound", "Maturity", "Note"],
      sets.map((s) => [
        s.name,
        s.cohesion,
        s.coupling,
        s.completeness,
        s.boundary,
        s.maturity,
        s.note,
      ])
    )
  );
  out.push("");

  // System coherence + journeys (from tables.json)
  for (const [key, title] of [
    ["system_scorecard", "System coherence scorecard"],
    ["journeys", "User-journey coverage"],
  ]) {
    const t = tables[key];
    if (!t) continue;
    out.push(`## ${title}`);
    out.push("");
    out.push(table(t.columns.map((c) => c.label), t.rows));
    out.push("");
  }

  return out.join("\n").replace(/\n+$/, "\n");
}

const md = render();
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* missing file → stale */
  }
  if (current.trim() !== md.trim()) {
    console.error("scorecards.md is stale — run `npm run capabilities:render`.");
    process.exit(1);
  }
  console.log("scorecards.md is up to date.");
} else {
  writeFileSync(OUT, md);
  console.log(`Wrote ${OUT}`);
}
