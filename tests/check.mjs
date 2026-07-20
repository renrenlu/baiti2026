import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("app.js", root), "utf8");
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("styles.css", root), "utf8");

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, "HTML ids must be unique");
for (const match of source.matchAll(/\$\("([^"]+)"\)/g)) {
  assert.ok(htmlIds.includes(match[1]), `app.js references missing #${match[1]}`);
}

globalThis.window = {};
await import(new URL("chapter1-data.js", root));
const chapterOneQuestions = globalThis.window.chapterOneQuestions;

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
assert.match(html, /chapter1-data\.js\?v=/);
assert.ok(html.indexOf("chapter1-data.js") < html.indexOf("app.js"), "chapter data must load before the app");
assert.match(source, /answers\/answer-/);
assert.match(source, /localStorage/);
assert.match(source, /retryQuestionImage/);
assert.match(source, /revealCardAnswer: \$\("revealCardAnswer"\)/, "answer toggle must be present in the element map");
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /\.chapter-grid \{ grid-template-columns: 1fr;/);

assert.equal(chapterOneQuestions.length, 77, "chapter one must contain 77 text cards");
assert.deepEqual(chapterOneQuestions.map((item) => item.id), Array.from({ length: 77 }, (_, index) => index + 1));
for (const item of chapterOneQuestions) {
  assert.ok(item.prompt.trim().length > 8, `question ${item.id} prompt is unexpectedly short`);
  assert.ok(item.answer.trim().length > 0, `question ${item.id} answer is missing`);
  assert.ok(item.page >= 4 && item.page <= 13, `question ${item.id} source page is invalid`);
  if (item.type === "choice") {
    assert.ok(item.options.length >= 2, `question ${item.id} needs at least two choices`);
    assert.ok(item.options.some((option) => option.startsWith(`${item.answer}.`)), `question ${item.id} answer does not match an option`);
  }
}
assert.deepEqual(chapterOneQuestions.filter((item) => item.page === 4).map((item) => item.id), [1,2,3,4,5,6,7,8,9]);
assert.deepEqual(chapterOneQuestions.filter((item) => item.page === 13).map((item) => item.id), [75,76,77]);

console.log("OK: scans 154+30, answer mappings 1—509, mobile breakpoint, image retry, and 77 chapter-one cards verified.");
