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
await import(new URL("questions-data.js", root));
await import(new URL("challenge-data.js", root));
const chapterOneQuestions = globalThis.window.chapterOneQuestions;
const additionalQuestions = globalThis.window.additionalQuestions;
const challengeQuestions = globalThis.window.challengeQuestions;
const workbookQuestions = [...chapterOneQuestions, ...additionalQuestions];

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
assert.match(html, /questions-data\.js\?v=/);
assert.ok(html.indexOf("questions-data.js") < html.indexOf("app.js"), "all question data must load before the app");
assert.match(html, /challenge-data\.js\?v=/);
assert.ok(html.indexOf("challenge-data.js") < html.indexOf("app.js"), "challenge question data must load before the app");
assert.match(source, /answers\/answer-/);
assert.match(source, /localStorage/);
assert.match(source, /retryQuestionImage/);
assert.match(source, /revealCardAnswer: \$\("revealCardAnswer"\)/, "answer toggle must be present in the element map");
assert.match(source, /openCardAnswerSource/, "each text card must link to its original answer page");
assert.match(source, /challengeQuestions\.filter/, "challenge suites must render as text cards");
assert.match(html, /id="questionContext"/, "long challenge passages need a collapsible reading area");
assert.match(html, /id="questionDraftLabel"/, "hybrid questions need an explicit written-response label");
assert.match(css, /\.question-context > div \{ max-height:/, "long reading passages must not overwhelm a mobile screen");
assert.match(css, /\.inline-blank\.correct/, "inline blanks need answer feedback styling");
assert.match(css, /\.source-underline/, "source underlines must be preserved in text cards");
assert.match(source, /inlineDrafts/, "inline answers must persist on the device");
assert.match(source, /renderQuestionContext/, "rich reading context must be rendered structurally");
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /\.chapter-grid \{ grid-template-columns: 1fr;/);

assert.equal(chapterOneQuestions.length, 77, "chapter one must contain 77 text cards");
assert.deepEqual(chapterOneQuestions.map((item) => item.id), Array.from({ length: 77 }, (_, index) => index + 1));
for (const item of chapterOneQuestions) {
  assert.ok(item.prompt.trim().length > 5, `question ${item.id} prompt is unexpectedly short`);
  assert.ok(item.answer.trim().length > 0, `question ${item.id} answer is missing`);
  assert.ok(item.page >= 4 && item.page <= 13, `question ${item.id} source page is invalid`);
  if (item.type === "choice") {
    assert.ok(item.options.length >= 2, `question ${item.id} needs at least two choices`);
    assert.ok(item.options.some((option) => option.startsWith(`${item.answer}.`)), `question ${item.id} answer does not match an option`);
  }
}
assert.deepEqual(chapterOneQuestions.filter((item) => item.page === 4).map((item) => item.id), [1,2,3,4,5,6,7,8,9]);
assert.deepEqual(chapterOneQuestions.filter((item) => item.page === 13).map((item) => item.id), [75,76,77]);

assert.equal(additionalQuestions.length, 432, "chapters two through nine must contain 432 text cards");
assert.deepEqual(workbookQuestions.map((item) => item.id), Array.from({ length: 509 }, (_, index) => index + 1));
const chapterMappings = [
  [1, 77, 1, 14], [78, 157, 15, 34], [158, 195, 35, 46],
  [196, 225, 47, 58], [226, 261, 59, 70], [262, 311, 71, 80],
  [312, 381, 81, 92], [382, 449, 93, 102], [450, 509, 103, 124]
];
for (const [qStart, qEnd, pageStart, pageEnd] of chapterMappings) {
  const chapterQuestions = workbookQuestions.filter((item) => item.id >= qStart && item.id <= qEnd);
  assert.equal(chapterQuestions.length, qEnd - qStart + 1, `chapter question range ${qStart}—${qEnd} is incomplete`);
  assert.ok(chapterQuestions.every((item) => item.page >= pageStart && item.page <= pageEnd), `chapter ${qStart}—${qEnd} has an invalid source page`);
}
for (const item of additionalQuestions) {
  assert.ok(item.prompt.trim().length > 5, `question ${item.id} prompt is unexpectedly short`);
  assert.ok(item.answer.trim().length > 0, `question ${item.id} answer is missing`);
  assert.ok(item.page >= 17 && item.page <= 122, `question ${item.id} source page is invalid`);
  assert.ok(item.answerPage >= 3 && item.answerPage <= 24, `question ${item.id} answer page is invalid`);
  assert.doesNotMatch(item.prompt, /过关攻略|基础冲关/, `question ${item.id} contains non-question page content`);
  assert.doesNotMatch(item.answer, /第[一二三四五六七八九]章|基础冲关/, `question ${item.id} answer contains neighboring section content`);
  if (item.type === "choice") {
    assert.ok(item.options.length >= 2, `question ${item.id} needs at least two choices`);
    assert.ok(item.options.some((option) => option.startsWith(`${item.answer}.`)), `question ${item.id} answer does not match an option`);
  }
}
assert.equal(workbookQuestions.at(-1).id, 509);
assert.equal(workbookQuestions.at(-1).answerPage, 24);

assert.equal(challengeQuestions.length, 128, "all ten challenge suites must contain 128 text cards");
assert.deepEqual(challengeQuestions.map((item) => item.id), Array.from({ length: 128 }, (_, index) => index + 510));
for (let challenge = 1; challenge <= 10; challenge += 1) {
  assert.ok(challengeQuestions.some((item) => item.challenge === challenge), `challenge suite ${challenge} is missing`);
}
for (const item of challengeQuestions) {
  assert.ok(item.prompt.trim().length > 5, `challenge card ${item.id} prompt is unexpectedly short`);
  assert.ok(item.answer.trim().length > 0, `challenge card ${item.id} answer is missing`);
  assert.ok(item.context.trim().length > 20, `challenge card ${item.id} reading context is missing`);
  assert.ok(item.page >= 124 && item.page <= 153, `challenge card ${item.id} source page is invalid`);
  assert.equal(item.bookPage, item.page + 2, `challenge card ${item.id} printed page is not aligned`);
  assert.ok(item.answerPage >= 24 && item.answerPage <= 30, `challenge card ${item.id} answer page is invalid`);
  assert.match(item.label, /^情境[一二] · 第 \d+ 题$/, `challenge card ${item.id} label is invalid`);
  if (item.type === "choice") {
    assert.ok(item.options.length >= 2, `challenge card ${item.id} needs at least two choices`);
    assert.ok(item.options.some((option) => option.startsWith(`${item.answer}.`)), `challenge card ${item.id} answer does not match an option`);
  }
}
assert.match(source, /start: 123, end: 126, bookStart: 125, bookEnd: 128/, "challenge one page range is not corrected");
assert.match(source, /start: 151, end: 153, bookStart: 153, bookEnd: 155/, "challenge ten page range is not corrected");

const challengeNine = challengeQuestions.filter((item) => item.challenge === 9);
assert.equal(challengeNine.length, 18, "challenge nine must contain all 18 source questions");
const c9 = (scenario, number) => challengeNine.find((item) => item.scenario === scenario && item.number === number);
assert.deepEqual(c9("情境一", 3).contextBlanks.map((blank) => blank.answer), ["推广", "传承"]);
assert.equal(c9("情境一", 3).inlineOnly, true, "passage blanks should replace the generic textarea");
assert.deepEqual(c9("情境一", 4).promptBlanks.map((blank) => blank.answer), ["A", "D"]);
assert.deepEqual(c9("情境一", 6).contextUnderlineParagraphs, [0], "the source correction sentence must stay underlined");
assert.doesNotMatch(c9("情境一", 5).answer, /因为能够成为伟大的民族/, "question five answer contains question six content");
assert.match(c9("情境一", 7).answer, /言必信，行必果/, "question seven reference answer is incomplete");
assert.equal(c9("情境二", 4).type, "choice");
assert.equal(c9("情境二", 4).options.length, 4);
assert.match(c9("情境二", 4).extraResponse, /组词并造句/);
assert.deepEqual(c9("情境二", 5).promptBlanks.map((blank) => blank.answer), ["栉风沐雨", "迸发"]);
assert.match(c9("情境二", 6).promptUnderlinePhrases[0], /最好的教科书/);

console.log("OK: scans, mobile layout, image retry, 509 main cards, and 128 challenge cards verified.");
