import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("app.js", root), "utf8");
const html = await readFile(new URL("index.html", root), "utf8");

for (let page = 6; page <= 159; page += 1) {
  const file = new URL(`assets/pages/page-${String(page).padStart(3, "0")}.jpg`, root);
  await access(file);
  assert.ok((await stat(file)).size > 10_000, `question scan ${page} is unexpectedly small`);
}

for (let page = 160; page <= 189; page += 1) {
  const file = new URL(`assets/answers/answer-${String(page).padStart(3, "0")}.jpg`, root);
  await access(file);
  assert.ok((await stat(file)).size > 10_000, `answer scan ${page} is unexpectedly small`);
}

const rangeText = source.match(/const answerRanges = \[([\s\S]*?)\n  \];/)?.[1] ?? "";
const pairs = [...rangeText.matchAll(/\[(\d+), (\d+)\]/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.equal(pairs.length, 24, "all 24 numbered answer-page ranges are present");
assert.deepEqual(pairs[0], [1, 33]);
assert.deepEqual(pairs.at(-1), [502, 509]);
for (let index = 1; index < pairs.length; index += 1) {
  assert.equal(pairs[index][0], pairs[index - 1][1] + 1, `answer ranges ${index} and ${index + 1} are not contiguous`);
}

assert.match(html, /题号印在原题左侧/);
assert.match(source, /answers\/answer-/);
assert.match(source, /localStorage/);
console.log("OK: 154 question scans, 30 answer scans, and continuous answer mappings 1—509 verified.");
