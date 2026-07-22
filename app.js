(() => {
  "use strict";

  const assetVersion = "20260722-1";
  const chapterOneQuestions = Array.isArray(window.chapterOneQuestions) ? window.chapterOneQuestions : [];
  const additionalQuestions = Array.isArray(window.additionalQuestions) ? window.additionalQuestions : [];
  const challengeQuestions = Array.isArray(window.challengeQuestions) ? window.challengeQuestions : [];
  const workbookQuestions = [...chapterOneQuestions, ...additionalQuestions].sort((a, b) => a.id - b.id);
  const allCardQuestions = [...workbookQuestions, ...challengeQuestions].sort((a, b) => a.id - b.id);
  const questionById = new Map(allCardQuestions.map((question) => [question.id, question]));
  const maxCardId = allCardQuestions.at(-1)?.id || 1;

  const chapters = [
    { id: "chapter-1", index: "第一章", title: "识字写字", mark: "字", start: 1, end: 14, qStart: 1, qEnd: 77 },
    { id: "chapter-2", index: "第二章", title: "词语天地", mark: "词", start: 15, end: 34, qStart: 78, qEnd: 157 },
    { id: "chapter-3", index: "第三章", title: "句子乐园", mark: "句", start: 35, end: 46, qStart: 158, qEnd: 195 },
    { id: "chapter-4", index: "第四章", title: "标点符号", mark: "点", start: 47, end: 58, qStart: 196, qEnd: 225 },
    { id: "chapter-5", index: "第五章", title: "句段修改", mark: "改", start: 59, end: 70, qStart: 226, qEnd: 261 },
    { id: "chapter-6", index: "第六章", title: "名言俗语", mark: "言", start: 71, end: 80, qStart: 262, qEnd: 311 },
    { id: "chapter-7", index: "第七章", title: "诗词歌赋", mark: "诗", start: 81, end: 92, qStart: 312, qEnd: 381 },
    { id: "chapter-8", index: "第八章", title: "课外阅读", mark: "读", start: 93, end: 102, qStart: 382, qEnd: 449 },
    { id: "chapter-9", index: "第九章", title: "跨学科学习", mark: "融", start: 103, end: 122, qStart: 450, qEnd: 509 },
    { id: "challenge-1", index: "基础冲关（一）", title: "综合情境一", mark: "一", start: 123, end: 126, bookStart: 125, bookEnd: 128, challenge: 1, answerPages: [24, 25] },
    { id: "challenge-2", index: "基础冲关（二）", title: "综合情境二", mark: "二", start: 127, end: 129, bookStart: 129, bookEnd: 131, challenge: 2, answerPages: [25] },
    { id: "challenge-3", index: "基础冲关（三）", title: "综合情境三", mark: "三", start: 130, end: 132, bookStart: 132, bookEnd: 134, challenge: 3, answerPages: [25, 26] },
    { id: "challenge-4", index: "基础冲关（四）", title: "综合情境四", mark: "四", start: 133, end: 135, bookStart: 135, bookEnd: 137, challenge: 4, answerPages: [26] },
    { id: "challenge-5", index: "基础冲关（五）", title: "综合情境五", mark: "五", start: 136, end: 138, bookStart: 138, bookEnd: 140, challenge: 5, answerPages: [26, 27] },
    { id: "challenge-6", index: "基础冲关（六）", title: "综合情境六", mark: "六", start: 139, end: 141, bookStart: 141, bookEnd: 143, challenge: 6, answerPages: [27] },
    { id: "challenge-7", index: "基础冲关（七）", title: "综合情境七", mark: "七", start: 142, end: 144, bookStart: 144, bookEnd: 146, challenge: 7, answerPages: [27, 28] },
    { id: "challenge-8", index: "基础冲关（八）", title: "综合情境八", mark: "八", start: 145, end: 147, bookStart: 147, bookEnd: 149, challenge: 8, answerPages: [28, 29] },
    { id: "challenge-9", index: "基础冲关（九）", title: "综合情境九", mark: "九", start: 148, end: 150, bookStart: 150, bookEnd: 152, challenge: 9, answerPages: [29, 30] },
    { id: "challenge-10", index: "基础冲关（十）", title: "综合情境十", mark: "十", start: 151, end: 153, bookStart: 153, bookEnd: 155, challenge: 10, answerPages: [30] }
  ];

  const answerRanges = [
    [1, 33], [34, 67], [68, 97], [98, 118], [119, 137], [138, 147],
    [148, 155], [156, 162], [163, 191], [192, 229], [230, 251], [252, 272],
    [273, 294], [295, 321], [322, 353], [354, 407], [408, 440], [441, 450],
    [451, 462], [463, 469], [470, 483], [484, 491], [492, 501], [502, 509]
  ];

  const storageKey = "yuwen-basic-100-v1";
  const defaultState = {
    currentPage: 1,
    currentQuestion: 1,
    completed: [],
    favorites: [],
    notes: {},
    results: {},
    questionDrafts: {},
    questionExtraDrafts: {},
    inlineDrafts: {},
    questionChecked: [],
    workspaceMode: "cards",
    zoom: 100
  };
  let state = loadState();
  let currentPage = clamp(Number(state.currentPage) || 1, 1, 153);
  let currentQuestion = clamp(Number(state.currentQuestion) || 1, 1, maxCardId);
  let workspaceMode = state.workspaceMode === "scan" ? "scan" : "cards";
  let answerVisible = false;
  let cardAnswerVisible = false;
  let activeTab = "answer";

  const $ = (id) => document.getElementById(id);
  const els = {
    sidebar: $("sidebar"), scrim: $("scrim"), menuButton: $("menuButton"), closeMenuButton: $("closeMenuButton"),
    chapterNav: $("chapterNav"), chapterGrid: $("chapterGrid"), homeView: $("homeView"), overviewSection: $("overviewSection"),
    workspaceView: $("workspaceView"), workspaceKicker: $("workspaceKicker"), workspaceTitle: $("workspaceTitle"),
    practiceModeSwitch: $("practiceModeSwitch"), cardModeButton: $("cardModeButton"), scanModeButton: $("scanModeButton"), modeSummary: $("modeSummary"),
    questionPractice: $("questionPractice"), scanWorkspaceGrid: $("scanWorkspaceGrid"), questionCount: $("questionCount"),
    questionSelect: $("questionSelect"), questionProgressLabel: $("questionProgressLabel"), questionProgressBar: $("questionProgressBar"),
    questionType: $("questionType"), questionSource: $("questionSource"), questionPrompt: $("questionPrompt"),
    questionContext: $("questionContext"), questionContextText: $("questionContextText"),
    questionOptions: $("questionOptions"), shortAnswerWrap: $("shortAnswerWrap"), questionDraftLabel: $("questionDraftLabel"), questionDraft: $("questionDraft"),
    questionDraftStatus: $("questionDraftStatus"), revealCardAnswer: $("revealCardAnswer"),
    cardAnswer: $("cardAnswer"), cardAnswerText: $("cardAnswerText"),
    cardAnswerDetail: $("cardAnswerDetail"), openCardAnswerSource: $("openCardAnswerSource"), cardFeedback: $("cardFeedback"), cardSelfCheck: $("cardSelfCheck"),
    pageSelect: $("pageSelect"), questionImage: $("questionImage"), paperStage: $("paperStage"), pageLocation: $("pageLocation"),
    questionImageState: $("questionImageState"), questionImageStateTitle: $("questionImageStateTitle"),
    questionImageStateCopy: $("questionImageStateCopy"), retryQuestionImage: $("retryQuestionImage"),
    favoriteButton: $("favoriteButton"), doneButton: $("doneButton"), questionNumber: $("questionNumber"),
    numberLocator: $("numberLocator"), challengeLocator: $("challengeLocator"), challengeName: $("challengeName"), challengeHint: $("challengeHint"),
    locatorHint: $("locatorHint"), answerGate: $("answerGate"), answerGateCopy: $("answerGateCopy"), answerResult: $("answerResult"),
    answerMatchLabel: $("answerMatchLabel"), answerPageLabel: $("answerPageLabel"), answerImages: $("answerImages"),
    pageNotes: $("pageNotes"), notesSaved: $("notesSaved"), answerPanel: $("answerPanel"), notesPanel: $("notesPanel"),
    answerTab: $("answerTab"), notesTab: $("notesTab"), progressLabel: $("progressLabel"), progressBar: $("progressBar"),
    sidebarProgress: $("sidebarProgress"), zoomRange: $("zoomRange"), zoomOutput: $("zoomOutput"),
    imageDialog: $("imageDialog"), dialogImage: $("dialogImage"), dialogTitle: $("dialogTitle"),
    answerDialog: $("answerDialog"), globalQuestionNumber: $("globalQuestionNumber"), globalResult: $("globalResult")
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        ...defaultState,
        ...saved,
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        favorites: Array.isArray(saved.favorites) ? saved.favorites : [],
        notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
        results: saved.results && typeof saved.results === "object" ? saved.results : {},
        questionDrafts: saved.questionDrafts && typeof saved.questionDrafts === "object" ? saved.questionDrafts : {},
        questionExtraDrafts: saved.questionExtraDrafts && typeof saved.questionExtraDrafts === "object" ? saved.questionExtraDrafts : {},
        inlineDrafts: saved.inlineDrafts && typeof saved.inlineDrafts === "object" ? saved.inlineDrafts : {},
        questionChecked: Array.isArray(saved.questionChecked) ? saved.questionChecked : []
      };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    state.currentPage = currentPage;
    state.currentQuestion = currentQuestion;
    state.workspaceMode = workspaceMode;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function pad3(value) { return String(value).padStart(3, "0"); }
  function sourceForPage(bookPage) { return `assets/pages/page-${pad3(bookPage + 5)}.jpg?v=${assetVersion}`; }
  function sourceForAnswer(answerPage) { return `assets/answers/answer-${pad3(answerPage + 159)}.jpg?v=${assetVersion}`; }
  function displayedBookPage(page) { return page >= 123 ? page + 2 : page; }
  function chapterBookStart(chapter) { return chapter.bookStart || chapter.start; }
  function chapterBookEnd(chapter) { return chapter.bookEnd || chapter.end; }
  function chapterForPage(page) { return chapters.find((chapter) => page >= chapter.start && page <= chapter.end); }
  function chapterForQuestion(number) { return chapters.find((chapter) => !chapter.challenge && number >= chapter.qStart && number <= chapter.qEnd); }
  function chapterForCard(question) {
    return question?.challenge
      ? chapters.find((chapter) => chapter.challenge === question.challenge)
      : chapterForQuestion(question?.id);
  }
  function questionsForChapter(chapter) {
    if (!chapter) return [];
    if (chapter.challenge) return challengeQuestions.filter((question) => question.challenge === chapter.challenge);
    return workbookQuestions.filter((question) => question.id >= chapter.qStart && question.id <= chapter.qEnd);
  }
  function answerPageForQuestion(number) {
    const index = answerRanges.findIndex(([start, end]) => number >= start && number <= end);
    return index < 0 ? null : index + 1;
  }
  function rangeLabel(values) { return values.length === 1 ? `第 ${values[0]} 页` : `第 ${values[0]}—${values.at(-1)} 页`; }
  function completedCount(chapter) { return state.completed.filter((page) => page >= chapter.start && page <= chapter.end).length; }

  function renderNavigation() {
    const core = chapters.filter((chapter) => !chapter.challenge);
    const challenges = chapters.filter((chapter) => chapter.challenge);
    els.chapterNav.innerHTML = [
      ...core.map(navButton),
      '<p class="sidebar-divider">基础冲关 · 10 套</p>',
      ...challenges.map(navButton)
    ].join("");

    document.querySelectorAll(".nav-chapter").forEach((button) => {
      button.addEventListener("click", () => openChapter(button.dataset.chapter));
    });
  }

  function navButton(chapter) {
    const count = completedCount(chapter);
    const total = chapter.end - chapter.start + 1;
    return `<button class="nav-chapter" type="button" data-chapter="${chapter.id}">
      <span class="nav-index">${chapter.challenge ? `0${chapter.challenge}`.slice(-2) : chapter.index.replace(/第|章/g, "")}</span>
      <span class="nav-title"><strong>${chapter.challenge ? chapter.index : chapter.title}</strong><small>书本 ${chapterBookStart(chapter)}—${chapterBookEnd(chapter)} 页</small></span>
      <span class="nav-progress">${count}/${total}</span>
    </button>`;
  }

  function renderCards() {
    els.chapterGrid.innerHTML = chapters.map((chapter) => {
      const count = completedCount(chapter);
      const total = chapter.end - chapter.start + 1;
      const percent = Math.round((count / total) * 100);
      const meta = chapter.challenge
        ? `${questionsForChapter(chapter).length} 道小题 · 书本 ${chapterBookStart(chapter)}—${chapterBookEnd(chapter)} 页`
        : `${chapter.qEnd - chapter.qStart + 1} 个题号 · 书本 ${chapter.start}—${chapter.end} 页`;
      return `<button class="chapter-card ${chapter.challenge ? "challenge-card" : ""}" type="button" data-chapter="${chapter.id}" data-mark="${chapter.mark}">
        <span class="card-number">${chapter.index}</span><h3>${chapter.title}</h3><p>${meta}</p>
        <span class="card-progress-row"><i><b style="width:${percent}%"></b><span>${count}/${total} 页</span></span>
      </button>`;
    }).join("");
    document.querySelectorAll(".chapter-card").forEach((button) => button.addEventListener("click", () => openChapter(button.dataset.chapter)));
  }

  function openChapter(id) {
    const chapter = chapters.find((item) => item.id === id);
    if (!chapter) return;
    const chapterQuestions = questionsForChapter(chapter);
    workspaceMode = chapterQuestions.length ? "cards" : "scan";
    if (chapterQuestions.length && !chapterQuestions.some((question) => question.id === currentQuestion)) {
      currentQuestion = chapterQuestions[0].id;
    }
    const remembered = workspaceMode === "cards"
      ? activeQuestion().page
      : (currentPage >= chapter.start && currentPage <= chapter.end ? currentPage : chapter.start);
    openPage(remembered);
    closeMenu();
  }

  function openPage(page, options = {}) {
    currentPage = clamp(Number(page), 1, 153);
    if (options.mode) workspaceMode = options.mode;
    state.currentPage = currentPage;
    saveState();
    els.homeView.hidden = true;
    els.overviewSection.hidden = true;
    els.workspaceView.hidden = false;
    renderWorkspace(Boolean(options.keepAnswer));
    if (!options.noScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderWorkspace(keepAnswer = false) {
    const chapter = chapterForPage(currentPage);
    const bookPage = displayedBookPage(currentPage);
    els.workspaceKicker.textContent = chapter.index;
    els.workspaceTitle.textContent = chapter.title;
    els.questionImage.alt = `《百题大过关·小升初语文》书本第 ${bookPage} 页原题`;
    loadQuestionImage();
    els.pageLocation.textContent = `书本第 ${bookPage} 页 · PDF 第 ${currentPage + 5} 页`;
    els.pageSelect.innerHTML = Array.from({ length: chapter.end - chapter.start + 1 }, (_, index) => {
      const page = chapter.start + index;
      return `<option value="${page}" ${page === currentPage ? "selected" : ""}>第 ${displayedBookPage(page)} 页${state.completed.includes(page) ? " ✓" : ""}</option>`;
    }).join("");
    els.favoriteButton.setAttribute("aria-pressed", String(state.favorites.includes(currentPage)));
    els.favoriteButton.textContent = state.favorites.includes(currentPage) ? "★ 已收藏" : "☆ 收藏本页";
    els.doneButton.setAttribute("aria-pressed", String(state.completed.includes(currentPage)));
    els.doneButton.textContent = state.completed.includes(currentPage) ? "✓ 本页已完成" : "✓ 标记完成";
    els.pageNotes.value = state.notes[currentPage] || "";
    els.zoomRange.value = String(state.zoom || 100);
    updateZoom();

    document.querySelectorAll(".nav-chapter").forEach((button) => button.classList.toggle("active", button.dataset.chapter === chapter.id));
    if (chapter.challenge) {
      els.numberLocator.hidden = true;
      els.challengeLocator.hidden = false;
      els.challengeName.textContent = chapter.index;
      els.challengeHint.textContent = `本套答案位于答案册${rangeLabel(chapter.answerPages)}，显示时会按顺序完整呈现。`;
      els.answerGateCopy.textContent = `完成${chapter.index}后，再显示对应的原书答案页。`;
    } else {
      els.numberLocator.hidden = false;
      els.challengeLocator.hidden = true;
      els.questionNumber.min = String(chapter.qStart);
      els.questionNumber.max = String(chapter.qEnd);
      if (!(Number(els.questionNumber.value) >= chapter.qStart && Number(els.questionNumber.value) <= chapter.qEnd)) {
        els.questionNumber.value = "";
      }
      els.locatorHint.textContent = `本章题号 ${pad3(chapter.qStart)}—${pad3(chapter.qEnd)}。题号印在原题左侧。`;
      els.answerGateCopy.textContent = "输入本页题号后，点击下方按钮显示唯一对应的原书答案页。";
    }
    if (!keepAnswer) hideAnswer();
    renderWorkspaceMode(chapter);
    renderProgress();
    renderResultSelection();
  }

  function renderWorkspaceMode(chapter = chapterForPage(currentPage)) {
    const chapterQuestions = questionsForChapter(chapter);
    const hasCards = chapterQuestions.length > 0;
    if (!hasCards) workspaceMode = "scan";
    const cards = hasCards && workspaceMode === "cards";
    els.practiceModeSwitch.hidden = !hasCards;
    els.questionPractice.hidden = !cards;
    els.scanWorkspaceGrid.hidden = cards;
    els.workspaceView.classList.toggle("card-mode", cards);
    els.cardModeButton.setAttribute("aria-pressed", String(cards));
    els.scanModeButton.setAttribute("aria-pressed", String(!cards));
    els.modeSummary.textContent = hasCards ? `${chapter.index} · ${chapterQuestions.length} 题` : "本章仅提供原书扫描";
    if (cards) renderQuestionCard();
    saveState();
  }

  function loadQuestionImage(retry = false) {
    const base = sourceForPage(currentPage);
    const src = retry ? `${base}&retry=${Date.now()}` : base;
    els.paperStage.classList.remove("image-ready", "image-error");
    els.paperStage.classList.add("image-loading");
    els.questionImageState.hidden = false;
    els.questionImageStateTitle.textContent = "正在加载原书页…";
    els.questionImageStateCopy.textContent = "首次打开可能需要几秒";
    els.retryQuestionImage.hidden = true;
    els.questionImage.onload = () => {
      els.paperStage.classList.remove("image-loading", "image-error");
      els.paperStage.classList.add("image-ready");
      els.questionImageState.hidden = true;
    };
    els.questionImage.onerror = () => {
      els.paperStage.classList.remove("image-loading", "image-ready");
      els.paperStage.classList.add("image-error");
      els.questionImageState.hidden = false;
      els.questionImageStateTitle.textContent = "原书页没有加载成功";
      els.questionImageStateCopy.textContent = "可能是微信缓存或网络波动，请点下方重试。";
      els.retryQuestionImage.hidden = false;
    };
    els.questionImage.src = src;
    setTimeout(() => {
      if (!els.questionImage.complete) return;
      if (els.questionImage.naturalWidth > 0) els.questionImage.onload();
      else els.questionImage.onerror();
    }, 0);
  }

  function activeQuestion() {
    return questionById.get(currentQuestion) || allCardQuestions[0];
  }

  function normalizedAnswer(value) {
    return String(value || "").replace(/[\s　，,。；;：:（）()]/g, "").toLowerCase();
  }

  function inlineDraftKey(question, scope, blank) {
    return `q-${question.id}:${scope}:${blank.key}`;
  }

  function appendTextWithUnderlines(container, text, phrases = []) {
    let remaining = text;
    while (remaining) {
      let nextIndex = -1;
      let nextPhrase = "";
      phrases.forEach((phrase) => {
        const index = remaining.indexOf(phrase);
        if (index >= 0 && (nextIndex < 0 || index < nextIndex)) {
          nextIndex = index;
          nextPhrase = phrase;
        }
      });
      if (nextIndex < 0) {
        container.append(document.createTextNode(remaining));
        break;
      }
      if (nextIndex > 0) container.append(document.createTextNode(remaining.slice(0, nextIndex)));
      const underline = document.createElement("span");
      underline.className = "source-underline";
      underline.textContent = nextPhrase;
      container.append(underline);
      remaining = remaining.slice(nextIndex + nextPhrase.length);
    }
  }

  function appendTextWithBlanks(container, text, blanks, cursor, question, scope, underlinePhrases = []) {
    const blankPattern = /（[\s　]*）/g;
    let lastIndex = 0;
    let match;
    while ((match = blankPattern.exec(text)) && cursor.index < blanks.length) {
      appendTextWithUnderlines(container, text.slice(lastIndex, match.index), underlinePhrases);
      const blank = blanks[cursor.index++];
      const wrapper = document.createElement("span");
      wrapper.className = "inline-parenthesis";
      wrapper.append(document.createTextNode("（"));
      const input = document.createElement("input");
      const key = inlineDraftKey(question, scope, blank);
      input.type = "text";
      input.className = `inline-blank ${blank.size || "medium"}`;
      input.value = state.inlineDrafts?.[key] || "";
      input.setAttribute("aria-label", `${question.label || `第 ${question.id} 题`}填空：${blank.key}`);
      input.autocomplete = "off";
      input.addEventListener("input", () => saveInlineDraft(key, input.value));
      if (cardAnswerVisible) {
        const entered = normalizedAnswer(input.value);
        input.classList.toggle("correct", Boolean(entered) && entered === normalizedAnswer(blank.answer));
        input.classList.toggle("wrong", Boolean(entered) && entered !== normalizedAnswer(blank.answer));
      }
      wrapper.append(input, document.createTextNode("）"));
      if (cardAnswerVisible) {
        const hint = document.createElement("span");
        hint.className = "inline-answer-hint";
        hint.textContent = `答案：${blank.answer}`;
        wrapper.append(hint);
      }
      container.append(wrapper);
      lastIndex = blankPattern.lastIndex;
    }
    appendTextWithUnderlines(container, text.slice(lastIndex), underlinePhrases);
  }

  function renderQuestionContext(question) {
    els.questionContext.hidden = !question.context;
    els.questionContextText.replaceChildren();
    if (!question.context) return;
    const underlined = new Set(question.contextUnderlineParagraphs || []);
    const blanks = question.contextBlanks || [];
    const cursor = { index: 0 };
    question.context.split(/\n\s*\n/).forEach((paragraph, index) => {
      const block = document.createElement("p");
      if (underlined.has(index)) block.classList.add("source-underline");
      appendTextWithBlanks(block, paragraph, blanks, cursor, question, "context");
      els.questionContextText.append(block);
    });
  }

  function renderQuestionPrompt(question) {
    els.questionPrompt.replaceChildren();
    appendTextWithBlanks(
      els.questionPrompt,
      question.prompt,
      question.promptBlanks || [],
      { index: 0 },
      question,
      "prompt",
      question.promptUnderlinePhrases || []
    );
  }

  function hasInlineDraft(question) {
    return [...(question.contextBlanks || []), ...(question.promptBlanks || [])].some((blank) => {
      const scope = (question.contextBlanks || []).includes(blank) ? "context" : "prompt";
      return Boolean(state.inlineDrafts?.[inlineDraftKey(question, scope, blank)]);
    });
  }

  function saveInlineDraft(key, value) {
    state.inlineDrafts ||= {};
    if (value) state.inlineDrafts[key] = value;
    else delete state.inlineDrafts[key];
    saveState();
    const question = activeQuestion();
    const hasSavedAnswer = hasInlineDraft(question) || state.questionDrafts?.[question.id] || state.questionExtraDrafts?.[question.id];
    els.questionDraftStatus.textContent = hasSavedAnswer ? "作答已保存" : "作答会自动保存在本机";
  }

  function renderQuestionCard() {
    const question = activeQuestion();
    if (!question) return;
    const chapter = chapterForCard(question);
    const chapterQuestions = questionsForChapter(chapter);
    const questionIndex = chapterQuestions.findIndex((item) => item.id === question.id);
    const checked = new Set(Array.isArray(state.questionChecked) ? state.questionChecked : []);
    const checkedCount = chapterQuestions.filter((item) => checked.has(item.id)).length;
    const result = state.results[`q-${question.id}`];
    const draft = state.questionDrafts?.[question.id] || "";
    const extraDraft = state.questionExtraDrafts?.[question.id] || "";

    els.questionCount.textContent = question.challenge
      ? `${question.label} · 本套 ${chapterQuestions.length} 道小题`
      : `第 ${pad3(question.id)} 题 · 本章 ${chapterQuestions.length} 题`;
    els.questionProgressLabel.textContent = `已核对 ${checkedCount} / ${chapterQuestions.length}`;
    els.questionProgressBar.style.width = `${Math.round((checkedCount / chapterQuestions.length) * 100)}%`;
    els.questionType.textContent = question.extraResponse ? "选择＋表达" : question.inlineOnly ? "填空题" : question.type === "choice" ? "选择题" : "书写题";
    els.questionSource.textContent = `原书第 ${question.bookPage || question.page} 页`;
    renderQuestionContext(question);
    renderQuestionPrompt(question);

    els.questionSelect.innerHTML = chapterQuestions.map((item) =>
      `<option value="${item.id}" ${item.id === question.id ? "selected" : ""}>${item.label || `第 ${pad3(item.id)} 题`}${checked.has(item.id) ? " ✓" : ""}</option>`
    ).join("");

    const isChoice = question.type === "choice";
    const showsWrittenResponse = !question.inlineOnly && (!isChoice || Boolean(question.extraResponse));
    els.questionOptions.hidden = !isChoice;
    els.shortAnswerWrap.hidden = !showsWrittenResponse;
    if (isChoice) {
      els.questionOptions.innerHTML = question.options.map((option, index) => {
        const value = option.slice(0, 1);
        return `<label class="question-option ${draft === value ? "selected" : ""}">
          <input type="radio" name="question-card-answer" value="${value}" ${draft === value ? "checked" : ""}>
          <span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${option.replace(/^[A-Z]\.\s*/, "")}</span>
        </label>`;
      }).join("");
      els.questionOptions.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => {
        saveQuestionDraft(input.value);
        els.questionOptions.querySelectorAll(".question-option").forEach((label) => label.classList.toggle("selected", label.contains(input)));
        if (cardAnswerVisible) renderCardAnswer(question);
      }));
    } else {
      els.questionOptions.innerHTML = "";
    }

    if (showsWrittenResponse) {
      els.questionDraftLabel.textContent = question.extraResponse || "我的作答";
      els.questionDraft.value = question.extraResponse ? extraDraft : draft;
      const answerLines = question.answerLines || 4;
      els.questionDraft.rows = answerLines;
      els.questionDraft.style.minHeight = `${Math.max(82, answerLines * 36 + 28)}px`;
    }

    els.questionDraftStatus.textContent = draft || extraDraft || hasInlineDraft(question) ? "作答已保存在本机" : "作答会自动保存在本机";
    els.cardAnswer.hidden = !cardAnswerVisible;
    els.revealCardAnswer.textContent = cardAnswerVisible ? "收起答案" : "核对答案";
    if (cardAnswerVisible) renderCardAnswer(question);
    document.querySelectorAll("[data-card-result]").forEach((button) => {
      button.classList.toggle("active", button.dataset.cardResult === result);
    });
    $("prevQuestionButton").disabled = questionIndex <= 0;
    $("nextQuestionButton").disabled = questionIndex < 0 || questionIndex >= chapterQuestions.length - 1;
  }

  function saveQuestionDraft(value) {
    const question = activeQuestion();
    if (!question) return;
    state.questionDrafts ||= {};
    if (value) state.questionDrafts[question.id] = value;
    else delete state.questionDrafts[question.id];
    saveState();
    els.questionDraftStatus.textContent = value ? "作答已保存" : "作答会自动保存在本机";
  }

  function saveQuestionExtraDraft(value) {
    const question = activeQuestion();
    if (!question) return;
    state.questionExtraDrafts ||= {};
    if (value) state.questionExtraDrafts[question.id] = value;
    else delete state.questionExtraDrafts[question.id];
    saveState();
    els.questionDraftStatus.textContent = value ? "作答已保存" : "作答会自动保存在本机";
  }

  function renderCardAnswer(question = activeQuestion()) {
    const draft = state.questionDrafts?.[question.id] || "";
    const extraDraft = state.questionExtraDrafts?.[question.id] || "";
    const hasAnyDraft = Boolean(draft || extraDraft || hasInlineDraft(question));
    els.cardAnswer.hidden = false;
    els.cardAnswerText.textContent = question.answer;
    els.cardAnswerDetail.hidden = !question.detail;
    els.cardAnswerDetail.textContent = question.detail || "";
    if (question.type === "choice") {
      if (!draft) {
        els.cardFeedback.className = "card-feedback neutral";
        els.cardFeedback.textContent = "你还没有选择答案，可以先核对，再回到上方作答。";
      } else if (draft === question.answer) {
        els.cardFeedback.className = "card-feedback correct";
        els.cardFeedback.textContent = `你的答案：${draft}　✓ 与参考答案一致`;
      } else {
        els.cardFeedback.className = "card-feedback wrong";
        els.cardFeedback.textContent = `你的答案：${draft}　参考答案：${question.answer}`;
      }
    } else {
      els.cardFeedback.className = "card-feedback neutral";
      els.cardFeedback.textContent = hasAnyDraft ? "请逐项对照参考答案，并在下方完成自评。" : "可以先查看参考答案，再补写或订正自己的作答。";
    }
  }

  function toggleCardAnswer() {
    cardAnswerVisible = !cardAnswerVisible;
    if (cardAnswerVisible) {
      const checked = new Set(Array.isArray(state.questionChecked) ? state.questionChecked : []);
      checked.add(activeQuestion().id);
      state.questionChecked = [...checked].sort((a, b) => a - b);
      saveState();
    }
    renderQuestionCard();
  }

  function setCardResult(result) {
    const question = activeQuestion();
    if (!question) return;
    state.results[`q-${question.id}`] = result;
    saveState();
    renderQuestionCard();
  }

  function goToQuestion(number, scroll = true) {
    const target = questionById.get(Number(number));
    if (!target) return;
    currentQuestion = target.id;
    const question = activeQuestion();
    currentPage = question.page;
    cardAnswerVisible = false;
    saveState();
    renderQuestionCard();
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function stepQuestion(delta) {
    const question = activeQuestion();
    const chapterQuestions = questionsForChapter(chapterForCard(question));
    const index = chapterQuestions.findIndex((item) => item.id === question.id);
    const target = chapterQuestions[index + delta];
    if (target) goToQuestion(target.id);
  }

  function setWorkspaceMode(mode) {
    if (mode === "cards") {
      workspaceMode = "cards";
      const chapter = chapterForPage(currentPage);
      const chapterQuestions = questionsForChapter(chapter);
      if (!chapterQuestions.some((question) => question.id === currentQuestion)) currentQuestion = chapterQuestions[0]?.id || currentQuestion;
      currentPage = activeQuestion()?.page || 4;
    } else {
      workspaceMode = "scan";
    }
    saveState();
    renderWorkspace(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderProgress() {
    const count = new Set(state.completed).size;
    const percent = Math.round((count / 153) * 100);
    els.progressLabel.textContent = `已完成 ${count} / 153 页`;
    els.progressBar.style.width = `${percent}%`;
    els.sidebarProgress.textContent = `${percent}%`;
    renderNavigation();
    renderCards();
  }

  function showHome() {
    els.workspaceView.hidden = true;
    els.homeView.hidden = false;
    els.overviewSection.hidden = false;
    document.querySelectorAll(".nav-chapter").forEach((button) => button.classList.remove("active"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function revealAnswer() {
    const chapter = chapterForPage(currentPage);
    let answerPages;
    let matchLabel;
    if (chapter.challenge) {
      answerPages = chapter.answerPages;
      matchLabel = chapter.index;
    } else {
      const number = Number(els.questionNumber.value);
      if (!Number.isInteger(number) || number < chapter.qStart || number > chapter.qEnd) {
        els.questionNumber.focus();
        els.locatorHint.textContent = `请输入本章范围内的题号：${chapter.qStart}—${chapter.qEnd}。`;
        els.locatorHint.style.color = "var(--red)";
        return;
      }
      const answerPage = answerPageForQuestion(number);
      answerPages = [answerPage];
      matchLabel = `原书第 ${pad3(number)} 题`;
      els.locatorHint.style.color = "";
    }
    answerVisible = true;
    els.answerGate.hidden = true;
    els.answerResult.hidden = false;
    els.answerMatchLabel.textContent = matchLabel;
    els.answerPageLabel.textContent = `答案册${rangeLabel(answerPages)}`;
    els.answerImages.innerHTML = answerPages.map((answerPage) => `<div class="answer-image-wrap is-loading">
      <span class="answer-page-chip">答案册第 ${answerPage} 页</span>
      <img src="${sourceForAnswer(answerPage)}" alt="答案册第 ${answerPage} 页" data-answer-page="${answerPage}" decoding="async">
      <div class="answer-image-status"><span class="loading-spinner"></span><strong>正在加载答案页…</strong><button type="button" hidden>重新加载</button></div>
    </div>`).join("");
    els.answerImages.scrollTop = 0;
    els.answerImages.querySelectorAll(".answer-image-wrap").forEach((wrap) => {
      const image = wrap.querySelector("img");
      const status = wrap.querySelector(".answer-image-status");
      const retry = status.querySelector("button");
      image.addEventListener("load", () => { wrap.classList.remove("is-loading", "is-error"); status.hidden = true; });
      image.addEventListener("error", () => {
        wrap.classList.remove("is-loading");
        wrap.classList.add("is-error");
        status.hidden = false;
        status.querySelector("strong").textContent = "答案页加载失败";
        status.querySelector(".loading-spinner").hidden = true;
        retry.hidden = false;
      });
      retry.addEventListener("click", () => {
        wrap.classList.remove("is-error");
        wrap.classList.add("is-loading");
        status.hidden = false;
        status.querySelector("strong").textContent = "正在重新加载…";
        status.querySelector(".loading-spinner").hidden = false;
        retry.hidden = true;
        image.src = `${sourceForAnswer(Number(image.dataset.answerPage))}&retry=${Date.now()}`;
      });
      image.addEventListener("click", () => openImageDialog(image.src, image.alt));
      if (image.complete) {
        if (image.naturalWidth > 0) {
          wrap.classList.remove("is-loading", "is-error");
          status.hidden = true;
        } else {
          image.dispatchEvent(new Event("error"));
        }
      }
    });
    renderResultSelection();
  }

  function hideAnswer() {
    answerVisible = false;
    els.answerGate.hidden = false;
    els.answerResult.hidden = true;
    els.answerImages.innerHTML = "";
  }

  function currentResultKey() {
    const chapter = chapterForPage(currentPage);
    return chapter.challenge ? chapter.id : `q-${Number(els.questionNumber.value) || 0}`;
  }

  function renderResultSelection() {
    const result = state.results[currentResultKey()];
    document.querySelectorAll("[data-result]").forEach((button) => button.classList.toggle("active", button.dataset.result === result));
  }

  function setResult(result) {
    const key = currentResultKey();
    if (key === "q-0") return;
    state.results[key] = result;
    saveState();
    renderResultSelection();
  }

  function setTab(tab) {
    activeTab = tab;
    const answer = tab === "answer";
    els.answerTab.setAttribute("aria-selected", String(answer));
    els.notesTab.setAttribute("aria-selected", String(!answer));
    els.answerPanel.hidden = !answer;
    els.notesPanel.hidden = answer;
  }

  function toggleListValue(key, value) {
    const set = new Set(state[key]);
    set.has(value) ? set.delete(value) : set.add(value);
    state[key] = [...set].sort((a, b) => a - b);
    saveState();
    renderWorkspace(answerVisible);
  }

  let notesTimer;
  function saveNotes() {
    clearTimeout(notesTimer);
    const page = currentPage;
    const value = els.pageNotes.value.trimEnd();
    els.notesSaved.textContent = "正在保存…";
    notesTimer = setTimeout(() => {
      if (value) state.notes[page] = value;
      else delete state.notes[page];
      saveState();
      els.notesSaved.textContent = "已自动保存";
    }, 280);
  }

  function updateZoom() {
    const zoom = Number(els.zoomRange.value);
    state.zoom = zoom;
    els.zoomOutput.value = `${zoom}%`;
    els.questionImage.style.width = `${zoom}%`;
    saveState();
  }

  function openImageDialog(src, title) {
    els.dialogImage.src = src;
    els.dialogTitle.textContent = title;
    els.imageDialog.showModal();
  }

  function openMenu() {
    els.sidebar.classList.add("open");
    els.scrim.classList.add("open");
    els.menuButton.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    els.sidebar.classList.remove("open");
    els.scrim.classList.remove("open");
    els.menuButton.setAttribute("aria-expanded", "false");
  }

  function runGlobalSearch() {
    const number = Number(els.globalQuestionNumber.value);
    const answerPage = answerPageForQuestion(number);
    if (!Number.isInteger(number) || !answerPage) {
      els.globalResult.textContent = "请输入 1—509 之间的整数题号。";
      return;
    }
    const chapter = chapterForQuestion(number);
    els.globalResult.textContent = `第 ${pad3(number)} 题属于${chapter.index}「${chapter.title}」，对应答案册第 ${answerPage} 页。`;
    currentPage = clamp(chapter.start, 1, 153);
    if (questionById.has(number)) currentQuestion = number;
    els.questionNumber.value = String(number);
    els.answerDialog.close();
    openPage(currentPage, { noScroll: true, mode: "scan" });
    els.questionNumber.value = String(number);
    revealAnswer();
  }

  $("startButton").addEventListener("click", () => openChapter("chapter-1"));
  $("continueButton").addEventListener("click", () => openPage(currentPage));
  $("backHomeButton").addEventListener("click", showHome);
  $("prevPageButton").addEventListener("click", () => openPage(currentPage - 1));
  $("nextPageButton").addEventListener("click", () => openPage(currentPage + 1));
  els.pageSelect.addEventListener("change", () => openPage(Number(els.pageSelect.value)));
  els.favoriteButton.addEventListener("click", () => toggleListValue("favorites", currentPage));
  els.doneButton.addEventListener("click", () => toggleListValue("completed", currentPage));
  $("revealAnswerButton").addEventListener("click", revealAnswer);
  $("hideAnswerButton").addEventListener("click", hideAnswer);
  $("decrementQuestion").addEventListener("click", () => {
    const chapter = chapterForPage(currentPage);
    els.questionNumber.value = String(clamp((Number(els.questionNumber.value) || chapter.qStart + 1) - 1, chapter.qStart, chapter.qEnd));
    hideAnswer(); renderResultSelection();
  });
  $("incrementQuestion").addEventListener("click", () => {
    const chapter = chapterForPage(currentPage);
    els.questionNumber.value = String(clamp((Number(els.questionNumber.value) || chapter.qStart - 1) + 1, chapter.qStart, chapter.qEnd));
    hideAnswer(); renderResultSelection();
  });
  els.questionNumber.addEventListener("input", () => { hideAnswer(); renderResultSelection(); });
  els.questionNumber.addEventListener("keydown", (event) => { if (event.key === "Enter") revealAnswer(); });
  document.querySelectorAll("[data-result]").forEach((button) => button.addEventListener("click", () => setResult(button.dataset.result)));
  els.answerTab.addEventListener("click", () => setTab("answer"));
  els.notesTab.addEventListener("click", () => setTab("notes"));
  els.pageNotes.addEventListener("input", saveNotes);
  $("clearNotesButton").addEventListener("click", () => { els.pageNotes.value = ""; saveNotes(); });
  els.zoomRange.addEventListener("input", updateZoom);
  els.retryQuestionImage.addEventListener("click", () => loadQuestionImage(true));
  $("openQuestionImageButton").addEventListener("click", () => openImageDialog(els.questionImage.src, els.questionImage.alt));
  els.cardModeButton.addEventListener("click", () => setWorkspaceMode("cards"));
  els.scanModeButton.addEventListener("click", () => setWorkspaceMode("scan"));
  els.questionSelect.addEventListener("change", () => goToQuestion(Number(els.questionSelect.value)));
  els.questionDraft.addEventListener("input", () => {
    if (activeQuestion()?.extraResponse) saveQuestionExtraDraft(els.questionDraft.value);
    else saveQuestionDraft(els.questionDraft.value);
    if (cardAnswerVisible) renderCardAnswer();
  });
  $("revealCardAnswer").addEventListener("click", toggleCardAnswer);
  $("prevQuestionButton").addEventListener("click", () => stepQuestion(-1));
  $("nextQuestionButton").addEventListener("click", () => stepQuestion(1));
  $("openSourcePage").addEventListener("click", () => setWorkspaceMode("scan"));
  els.openCardAnswerSource.addEventListener("click", () => {
    const question = activeQuestion();
    const answerPage = question.answerPage || answerPageForQuestion(question.id);
    openImageDialog(sourceForAnswer(answerPage), `${question.label || `第 ${pad3(question.id)} 题`} · 答案册第 ${answerPage} 页`);
  });
  document.querySelectorAll("[data-card-result]").forEach((button) => button.addEventListener("click", () => setCardResult(button.dataset.cardResult)));
  $("closeDialogButton").addEventListener("click", () => els.imageDialog.close());
  els.imageDialog.addEventListener("click", (event) => { if (event.target === els.imageDialog) els.imageDialog.close(); });
  els.menuButton.addEventListener("click", openMenu);
  els.closeMenuButton.addEventListener("click", closeMenu);
  els.scrim.addEventListener("click", closeMenu);
  $("topAnswerButton").addEventListener("click", () => { els.answerDialog.showModal(); setTimeout(() => els.globalQuestionNumber.focus(), 50); });
  $("globalSearchButton").addEventListener("click", runGlobalSearch);
  els.globalQuestionNumber.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); runGlobalSearch(); } });
  $("resetButton").addEventListener("click", () => {
    if (!confirm("确定清空所有完成记录、收藏、作答笔记和自评结果吗？此操作无法撤销。")) return;
    state = { ...defaultState, completed: [], favorites: [], notes: {}, results: {}, questionDrafts: {}, questionExtraDrafts: {}, inlineDrafts: {}, questionChecked: [] };
    currentPage = 1;
    currentQuestion = 1;
    workspaceMode = "cards";
    saveState();
    renderProgress();
    showHome();
  });

  document.addEventListener("keydown", (event) => {
    if (els.workspaceView.hidden || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (workspaceMode === "cards" && !els.questionPractice.hidden) {
      if (event.key === "ArrowLeft") stepQuestion(-1);
      if (event.key === "ArrowRight") stepQuestion(1);
      if (event.key.toLowerCase() === "a") toggleCardAnswer();
    } else {
      if (event.key === "ArrowLeft") openPage(currentPage - 1);
      if (event.key === "ArrowRight") openPage(currentPage + 1);
      if (event.key.toLowerCase() === "a") revealAnswer();
      if (event.key.toLowerCase() === "d") toggleListValue("completed", currentPage);
    }
  });

  renderProgress();
  setTab(activeTab);
})();
