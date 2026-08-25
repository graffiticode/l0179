// SPDX-License-Identifier: MIT
/**
 * Docs must compile. Ported from L0176's docs.test.ts, which exists because a stale example is
 * not a documentation nit here: the code generator writes from instructions.md and retrieves from
 * examples.md, so a wrong example is reproduced verbatim into generated programs.
 *
 * L0166 has no equivalent, and four `params` examples in its spec.md sat there never parsing —
 * unquoted keys and comma separators, both syntax errors — until L0179 was ported from them.
 */
import { test, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { parser } from "@graffiticode/parser";
import { compiler, lexicon } from "./index.js";

const SPEC_FILES = ["spec/spec.md", "spec/instructions.md", "spec/examples.md"];

function blocks(path: string): string[] {
  const out: string[] = [];
  let cur: string[] | null = null;
  for (const l of readFileSync(path, "utf-8").split("\n")) {
    if (l.trim().startsWith("```")) {
      if (cur) { out.push(cur.join("\n")); cur = null; } else cur = [];
      continue;
    }
    if (cur) cur.push(l);
  }
  return out;
}

/** A fenced block that is a program, rather than a table row or a formula snippet. */
function isProgram(src: string): boolean {
  if (!src || src.includes("...")) return false;
  return /^\s*sheets\s*\[/.test(src);
}

async function compileSrc(src: string) {
  const code = await parser.parse(179, src, lexicon);
  const err = Object.values(code as any).find((n: any) => n && n.tag === "ERROR");
  if (err) throw new Error(`parse error: ${JSON.stringify((err as any).elts)}`);
  return await new Promise((res, rej) =>
    compiler.compile(code, {}, {}, (e: any, v: any) => {
      const errs = Array.isArray(e) ? e.filter(Boolean) : e ? [e] : [];
      if (errs.length) rej(errs); else res(v);
    }));
}

test("every program fragment in spec/ compiles, not merely parses", async () => {
  // Parsing is not enough: a program can parse perfectly and fail in the builder, which is how
  // twenty stale examples once survived behind a parse-only guard in a sibling language.
  const bad: string[] = [];
  let ok = 0;
  for (const f of SPEC_FILES) {
    for (const b of blocks(f)) {
      const src = b.trim();
      if (!isProgram(src)) continue;
      try { await compileSrc(src.endsWith("..") ? src : `${src}..`); ok++; }
      catch (e: any) {
        const msg = Array.isArray(e) ? (e[0]?.message ?? JSON.stringify(e[0])) : (e?.message ?? String(e));
        bad.push(`\n--- ${f}\n${src.split("\n").slice(0, 6).join("\n")}\n  -> ${String(msg).slice(0, 160)}`);
      }
    }
  }
  expect(bad, `${bad.length} of ${ok + bad.length} fragments failed to compile:${bad.join("")}`).toEqual([]);
  expect(ok).toBeGreaterThan(100);   // the corpus alone is 127
});

test("the starter template compiles", async () => {
  // spec/template.gc is what a new task opens with, and build-static copies it verbatim into the
  // served bundle. A syntax change silently invalidates it.
  await expect(compileSrc(readFileSync("spec/template.gc", "utf-8"))).resolves.toBeTruthy();
});

/**
 * Words retired from L0166's surface. They are easy to leave behind in prose, and a documented
 * word that no longer exists is one the generator will emit.
 */
const RETIRED = ["hide-menu", "index", "order"];

test("no retired keyword is still documented", () => {
  // Only code — fenced blocks and backticked spans; quoted strings are stripped so an English
  // sentence inside a stimulus cannot trip it.
  const code = (text: string) =>
    [...text.matchAll(/```[\s\S]*?```/g), ...text.matchAll(/`[^`\n]+`/g)]
      .map((m) => m[0].replace(/"[^"]*"/g, '""'))
      .join("\n");
  const offences: string[] = [];
  for (const f of readdirSync("spec")) {
    if (!/\.(md|json|gc)$/.test(f)) continue;
    const text = readFileSync(`spec/${f}`, "utf-8");
    const haystack = f.endsWith(".gc") ? text.replace(/"[^"]*"/g, '""') : code(text);
    for (const word of RETIRED) {
      const re = new RegExp(`(?<![\\w/-])${word}(?![\\w/-])`, "g");
      const n = (haystack.match(re) || []).length;
      if (n > 0) offences.push(`spec/${f}: ${word} (${n})`);
    }
  }
  expect(offences, `retired keywords still documented:\n${offences.join("\n")}`).toEqual([]);
});

test("every attribute in the table is reachable from the lexicon", async () => {
  // The lexicon is generated from attributeFields, so this guards the inverse: a word documented
  // in spec.md that no table row backs. `id` in a sibling language sat unauthorable for months.
  const { attributeFields } = await import("./attributes.js");
  const words = new Set(Object.keys(attributeFields).map((n) => n.toLowerCase().replace(/_/g, "-")));
  // Only the leading cell of a table row — `fx` in the prose "hides the `fx` input" is English,
  // not a word this language defines, and scanning every backtick makes the check unrunnable.
  const documented = [...readFileSync("spec/spec.md", "utf-8").matchAll(/^\| `([a-z][a-z-]+)`/gm)]
    .flatMap((m) => m[1].split(/`,\s*`/));
  const structural = new Set([
    "sheets", "sheet", "cells", "cell", "columns", "column", "rows", "row", "params", "assess",
    "method", "expected", "points", "left", "right", "center", "justify",
  ]);
  const unknown = [...new Set(documented)].filter((w) => !words.has(w) && !structural.has(w));
  expect(unknown, `documented but not in the attribute table: ${unknown.join(", ")}`).toEqual([]);
});
