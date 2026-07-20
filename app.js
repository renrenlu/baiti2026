(() => {
  "use strict";

  const chapters = [
    { id: "chapter-1", index: "第一章", title: "识字写字", mark: "字", start: 1, end: 14, qStart: 1, qEnd: 77 },
    { id: "chapter-2", index: "第二章", title: "词语天地", mark: "词", start: 15, end: 34, qStart: 78, qEnd: 157 },
    { id: "chapter-3", index: "第三章", title: "句子乐园", mark: "句", start: 35, end: 46, qStart: 158, qEnd: 195 },
    { id: "chapter-4", index: "第四章", title: "标点符号", mark: "点", start: 47, end: 58, qStart: 196, qEnd: 225 },
    { id: "chapter-5", index: "第五章", title: "句段修改", mark: "改", start: 59, end: 70, qStart: 226, qEnd: 261 },
    { id: "chapter-6", index: "第六章", title: "名言俗语", mark: "言", start: 71, end: 80, qStart: 262, qEnd: 311 },
    { id: "chapter-7", index: "第七章", title: "诗词歌赋", mark: "诗", start: 81, end: 92, qStart: 312, qEnd: 381 },
    { id: "chapter-8", index: "第八章", title: "课外阅读", mark: "读", start: 93, end: 102, qStart: 382, qEnd: 449 },
    { id: "chapter-9", index: "第九章", title: "跨学科学习", mark: "融", start: 103, end: 124, qStart: 450, qEnd: 509 },
    { id: "challenge-1", index: "基础冲关（一）", title: "综合情境一", mark: "一", start: 125, end: 127, challenge: 1, answerPages: [24, 25] },
    { id: "challenge-2", index: "基础冲关（二）", title: "综合情境二", mark: "二", start: 128, end: 130, challenge: 2, answerPages: [25] },
    { id: "challenge-3", index: "基础冲关（三）", title: "综合情境三", mark: "三", start: 131, end: 133, challenge: 3, answerPages: [25, 26] },
    { id: "challenge-4", index: "基础冲关（四）", title: "综合情境四", mark: "四", start: 134, end: 136, challenge: 4, answerPages: [26] },
    { id: "challenge-5", index: "基础冲关（五）", title: "综合情境五", mark: "五", start: 137, end: 139, challenge: 5, answerPages: [26, 27] },
    { id: "challenge-6", index: "基础冲关（六）", title: "综合情境六", mark: "六", start: 140, end: 142, challenge: 6, answerPages: [27] },
    { id: "challenge-7", index: "基础冲关（七）", title: "综合情境七", mark: "七", start: 143, end: 145, challenge: 7, answerPages: [27, 28] },
    { id: "challenge-8", index: "基础冲关（八）", title: "综合情境八", mark: "八", start: 146, end: 148, challenge: 8, answerPages: [28, 29] },
    { id: "challenge-9", index: "基础冲关（九）", title: "综合情境九", mark: "九", start: 149, end: 151, challenge: 9, answerPages: [29, 30] },
    { id: "challenge-10", index: "基础冲关（十）", title: "综合情境十", mark: "十", start: 152, end: 154, challenge: 10, answerPages: [30] }
  ];

  const answerRanges = [
    [1, 33], [34, 67], [68, 97], [98, 118], [119, 137], [138, 147],
    [148, 155], [156, 162], [163, 191], [192, 229], [230, 251], [252, 272],
    [273, 294], [295, 321], [322, 353], [354, 407], [408, 440], [441, 450],
    [451, 462], [463, 469], [470, 483], [484, 491], [492, 501], [502, 509]
  ];

  const storageKey = "yuwen-basic-100-v1";
  const defaultState = { currentPage: 1, completed: [], favorites: [], notes: {}, results: {}, zoom: 100 };
  let state = loadState();
  let currentPage = clamp(Number(state.currentPage) || 1, 1, 154);
  let answerVisible = false;
  let activeTab = "answer";

  const $ = (id) => document.getElementById(id);
  const els = {
    sidebar: $("sidebar"), scrim: $("scrim"), menuButton: $("menuButton"), closeMenuButton: $("closeMenuButton"),
    chapterNav: $("chapterNav"), chapterGrid: $("chapterGrid"), homeView: $("homeView"), overviewSection: $("overviewSection"),
    workspaceView: $("workspaceView"), workspaceKicker: $("workspaceKicker"), workspaceTitle: $("workspaceTitle"),
    pageSelect: $("pageSelect"), questionImage: $("questionImage"), paperStage: $("paperStage"), pageLocation: $("pageLocation"),
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
      return { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    state.currentPage = currentPage;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function pad3(value) { return String(value).padStart(3, "0"); }
  function sourceForPage(bookPage) { return `assets/pages/page-${pad3(bookPage + 5)}.jpg`; }
  function sourceForAnswer(answerPage) { return `assets/answers/answer-${pad3(answerPage + 159)}.jpg`; }
  function chapterForPage(page) { return chapters.find((chapter) => page >= chapter.start && page <= chapter.end); }
  function chapterForQuestion(number) { return chapters.find((chapter) => !chapter.challenge && number >= chapter.qStart && number <= chapter.qEnd); }
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
      <span class="nav-title"><strong>${chapter.challenge ? chapter.index : chapter.title}</strong><small>书本 ${chapter.start}—${chapter.end} 页</small></span>
      <span class="nav-progress">${count}/${total}</span>
    </button>`;
  }

  function renderCards() {
    els.chapterGrid.innerHTML = chapters.map((chapter) => {
      const count = completedCount(chapter);
      const total = chapter.end - chapter.start + 1;
      const percent = Math.round((count / total) * 100);
      const meta = chapter.challenge
        ? `3 页套题 · 答案册${rangeLabel(chapter.answerPages)}`
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
    const remembered = currentPage >= chapter.start && currentPage <= chapter.end ? currentPage : chapter.start;
    openPage(remembered);
    closeMenu();
  }

  function openPage(page, options = {}) {
    currentPage = clamp(Number(page), 1, 154);
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
    els.workspaceKicker.textContent = chapter.index;
    els.workspaceTitle.textContent = chapter.title;
    els.questionImage.src = sourceForPage(currentPage);
    els.questionImage.alt = `《百题大过关·小升初语文》书本第 ${currentPage} 页原题`;
    els.pageLocation.textContent = `书本第 ${currentPage} 页 · PDF 第 ${currentPage + 5} 页`;
    els.pageSelect.innerHTML = Array.from({ length: chapter.end - chapter.start + 1 }, (_, index) => {
      const page = chapter.start + index;
      return `<option value="${page}" ${page === currentPage ? "selected" : ""}>第 ${page} 页${state.completed.includes(page) ? " ✓" : ""}</option>`;
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
    renderProgress();
    renderResultSelection();
  }

  function renderProgress() {
    const count = new Set(state.completed).size;
    const percent = Math.round((count / 154) * 100);
    els.progressLabel.textContent = `已完成 ${count} / 154 页`;
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
    els.answerImages.innerHTML = answerPages.map((answerPage) => `<div class="answer-image-wrap">
      <span class="answer-page-chip">答案册第 ${answerPage} 页</span>
      <img src="${sourceForAnswer(answerPage)}" alt="答案册第 ${answerPage} 页" data-answer-page="${answerPage}">
    </div>`).join("");
    els.answerImages.scrollTop = 0;
    els.answerImages.querySelectorAll("img").forEach((image) => image.addEventListener("click", () => openImageDialog(image.src, image.alt)));
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
    currentPage = clamp(chapter.start, 1, 154);
    els.questionNumber.value = String(number);
    els.answerDialog.close();
    openPage(currentPage, { noScroll: true });
    els.questionNumber.value = String(number);
    revealAnswer();
  }

  $("startButton").addEventListener("click", () => openPage(1));
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
  $("openQuestionImageButton").addEventListener("click", () => openImageDialog(els.questionImage.src, els.questionImage.alt));
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
    state = { ...defaultState, completed: [], favorites: [], notes: {}, results: {} };
    currentPage = 1;
    saveState();
    renderProgress();
    showHome();
  });

  document.addEventListener("keydown", (event) => {
    if (els.workspaceView.hidden || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (event.key === "ArrowLeft") openPage(currentPage - 1);
    if (event.key === "ArrowRight") openPage(currentPage + 1);
    if (event.key.toLowerCase() === "a") revealAnswer();
    if (event.key.toLowerCase() === "d") toggleListValue("completed", currentPage);
  });

  renderProgress();
  setTab(activeTab);
})();
