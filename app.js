(() => {
  "use strict";

  const STORAGE_KEY_BOOKS = "booklist.books";
  const STORAGE_KEY_NEXT_ID = "booklist.nextId";

  const STATUS_ORDER = ["想读", "在读", "已读"];

  /** @typedef {{id:number,title:string,author:string,cover:string,status:"想读"|"在读"|"已读",rating:number,notes?:string,addedDate?:string}} Book */

  const el = {
    statTotal: document.getElementById("statTotal"),
    statRead: document.getElementById("statRead"),
    statReading: document.getElementById("statReading"),

    searchInput: document.getElementById("searchInput"),
    btnClearSearch: document.getElementById("btnClearSearch"),
    filters: document.querySelector(".filters"),
    bookGrid: document.getElementById("bookGrid"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyDesc: document.getElementById("emptyDesc"),

    modalOverlay: document.getElementById("modalOverlay"),
    modalContainer: document.getElementById("modalContainer"),
    formCard: document.getElementById("formCard"),
    notesCard: document.getElementById("notesCard"),
    form: document.getElementById("bookForm"),
    formTitle: document.getElementById("formTitle"),
    bookId: document.getElementById("bookId"),
    title: document.getElementById("title"),
    author: document.getElementById("author"),
    cover: document.getElementById("cover"),
    status: document.getElementById("status"),
    rating: document.getElementById("rating"),
    btnSubmit: document.getElementById("btnSubmit"),
    btnCancelEdit: document.getElementById("btnCancelEdit"),
    btnAddNew: document.getElementById("btnAddNew"),
    btnCloseForm: document.getElementById("btnCloseForm"),
    btnCloseNotes: document.getElementById("btnCloseNotes"),
    btnClearAll: document.getElementById("btnClearAll"),

    notesTitle: document.getElementById("notesTitle"),
    notesSubtitle: document.getElementById("notesSubtitle"),
    notesBookInfo: document.getElementById("notesBookInfo"),
    notesTextarea: document.getElementById("notesTextarea"),
    charCount: document.getElementById("charCount"),
    btnSaveNotes: document.getElementById("btnSaveNotes"),
    btnShareBook: document.getElementById("btnShareBook"),

    toast: document.getElementById("toast"),
  };

  /** @type {{books: Book[], filter: string, searchQuery: string}} */
  const state = {
    books: [],
    filter: "all",
    searchQuery: "",
  };

  function safeParseJson(text, fallback) {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  }

  /** @returns {Book[]} */
  function loadBooks() {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    const parsed = safeParseJson(raw ?? "[]", []);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeBook)
      .filter((b) => b && typeof b.id === "number");
  }

  function saveBooks(books) {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  }

  function getNextId() {
    const raw = localStorage.getItem(STORAGE_KEY_NEXT_ID);
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    // bootstrap from existing max id
    const maxId = state.books.reduce((m, b) => Math.max(m, b.id), 0);
    return maxId + 1;
  }

  function bumpNextId(nextId) {
    localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId));
  }

  /** @param {any} b @returns {Book|null} */
  function normalizeBook(b) {
    if (!b || typeof b !== "object") return null;
    const id = Number(b.id);
    const title = typeof b.title === "string" ? b.title : "";
    const author = typeof b.author === "string" ? b.author : "";
    const cover = typeof b.cover === "string" ? b.cover : "";
    const status = STATUS_ORDER.includes(b.status) ? b.status : "想读";
    const rating = clampInt(Number(b.rating), 0, 5);
    const notes = typeof b.notes === "string" ? b.notes : "";
    const addedDate = typeof b.addedDate === "string" ? b.addedDate : undefined;
    if (!Number.isFinite(id)) return null;
    return { id, title, author, cover, status, rating, notes, addedDate };
  }

  function clampInt(n, min, max) {
    const x = Number.isFinite(n) ? Math.round(n) : min;
    return Math.min(max, Math.max(min, x));
  }

  function showToast(message) {
    if (!message) return;
    el.toast.textContent = message;
    el.toast.classList.add("is-show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      el.toast.classList.remove("is-show");
      el.toast.textContent = "";
    }, 1600);
  }

  function setFieldError(fieldName, message) {
    const target = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (!target) return;
    target.textContent = message || "";
  }

  function clearErrors() {
    setFieldError("title", "");
    setFieldError("author", "");
  }

  function validateForm() {
    clearErrors();
    const title = el.title.value.trim();
    const author = el.author.value.trim();

    let ok = true;
    if (!title) {
      setFieldError("title", "请填写书名");
      ok = false;
    }
    if (!author) {
      setFieldError("author", "请填写作者");
      ok = false;
    }
    return ok;
  }

  function showForm() {
    if (!el.modalOverlay || !el.formCard) {
      console.error("弹窗元素未找到");
      return;
    }
    el.formCard.hidden = false;
    if (el.notesCard) el.notesCard.hidden = true;
    el.modalOverlay.hidden = false;
    // 防止背景滚动
    document.body.style.overflow = "hidden";
    // 聚焦到第一个输入框
    setTimeout(() => {
      if (el.title) el.title.focus();
    }, 100);
  }

  function hideForm() {
    el.modalOverlay.hidden = true;
    // 恢复背景滚动
    document.body.style.overflow = "";
  }

  let currentNotesBookId = null;

  function showNotes(book) {
    currentNotesBookId = book.id;
    el.formCard.hidden = true;
    el.notesCard.hidden = false;
    el.modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";

    el.notesTitle.textContent = `《${book.title}》笔记`;
    el.notesSubtitle.textContent = `作者：${book.author}`;
    
    // 显示书籍信息
    const badgeClass = statusToBadgeClass(book.status);
    el.notesBookInfo.innerHTML = `
      <div class="book-info-item">
        <span class="badge ${badgeClass}">${escapeHtml(book.status)}</span>
        ${renderStars(book.rating)}
      </div>
    `;

    // 加载笔记内容
    el.notesTextarea.value = book.notes || "";
    updateCharCount();
    
    // 聚焦到笔记输入框
    setTimeout(() => {
      el.notesTextarea.focus();
    }, 100);
  }

  function saveNotes() {
    if (!currentNotesBookId) {
      showToast("无法保存：未找到书籍信息");
      return;
    }
    const idx = state.books.findIndex((b) => b.id === currentNotesBookId);
    if (idx === -1) {
      showToast("未找到要保存的书籍");
      return;
    }
    const notes = el.notesTextarea.value.trim();
    state.books[idx] = { ...state.books[idx], notes };
    saveBooks(state.books);
    showToast("笔记已保存");
    hideForm(); // 关闭弹窗
    currentNotesBookId = null; // 清空当前编辑的书籍ID
    render();
  }

  function updateCharCount() {
    const count = el.notesTextarea.value.length;
    el.charCount.textContent = `${count} / 5000`;
    el.charCount.classList.toggle("char-count-warning", count > 4500);
  }

  function enterAddMode(shouldShow = true) {
    el.formTitle.textContent = "添加书籍";
    el.bookId.value = "";
    el.btnSubmit.innerHTML = `<i class="fa-solid fa-plus"></i> 添加`;
    el.btnCancelEdit.hidden = true;
    el.form.reset();
    el.status.value = "想读";
    el.rating.value = "0";
    clearErrors();
    if (shouldShow) {
      showForm();
    }
  }

  /** @param {Book} book */
  function enterEditMode(book) {
    el.formTitle.textContent = "编辑书籍";
    el.bookId.value = String(book.id);
    el.title.value = book.title;
    el.author.value = book.author;
    el.cover.value = book.cover || "";
    el.status.value = book.status;
    el.rating.value = String(book.rating ?? 0);
    el.btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> 保存修改`;
    el.btnCancelEdit.hidden = false;
    clearErrors();
    showForm();
    el.title.focus();
  }

  function statusToBadgeClass(status) {
    if (status === "已读") return "read";
    if (status === "在读") return "reading";
    return "want";
  }

  function renderStars(rating) {
    const r = clampInt(Number(rating), 0, 5);
    if (r <= 0) return `<span class="rating">未评分</span>`;
    let stars = "";
    for (let i = 0; i < r; i++) {
      stars += `<i class="fa-solid fa-star star" aria-hidden="true"></i>`;
    }
    return `<span class="rating" aria-label="${r} 星">${stars}</span>`;
  }

  /** @param {Book} book */
  function renderCard(book) {
    const safeTitle = escapeHtml(book.title || "");
    const safeAuthor = escapeHtml(book.author || "");
    const safeCover = escapeHtml(book.cover || "");
    const badgeClass = statusToBadgeClass(book.status);
    const badgeText = escapeHtml(book.status);

    const coverHtml = safeCover
      ? `<img src="${safeCover}" alt="${safeTitle} 封面" loading="lazy" data-cover-img />`
      : `<div class="placeholder" aria-hidden="true"><i class="fa-regular fa-image"></i></div>`;

    return `
      <article class="card" data-id="${book.id}">
        <div class="cover">
          ${coverHtml}
        </div>
        <div class="card-body">
          <div class="book-title" title="${safeTitle}">${safeTitle}</div>
          <div class="book-author">${safeAuthor}</div>
          <div class="meta">
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${renderStars(book.rating)}
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost" data-action="edit" type="button" title="编辑">
              <i class="fa-regular fa-pen-to-square"></i>
              编辑
            </button>
            <button class="btn btn-ghost" data-action="notes" type="button" title="笔记">
              <i class="fa-regular fa-note-sticky"></i>
              笔记
            </button>
            <button class="btn btn-ghost" data-action="share" type="button" title="分享">
              <i class="fa-solid fa-share-nodes"></i>
              分享
            </button>
          </div>
          <div class="card-actions-secondary">
            <button class="btn btn-danger" data-action="delete" type="button" title="删除">
              <i class="fa-regular fa-trash-can"></i>
              删除
            </button>
            <button class="btn btn-ghost" data-action="cycle" type="button" title="切换状态">
              <i class="fa-solid fa-rotate"></i>
              切换
            </button>
          </div>
        </div>
      </article>
    `.trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getFilteredBooks() {
    let result = state.books.slice();
    
    // 先应用筛选器
    const f = state.filter;
    if (f === "high") {
      result = result.filter((b) => (b.rating ?? 0) >= 4);
    } else if (f !== "all") {
      result = result.filter((b) => b.status === f);
    }
    
    // 再应用搜索
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.trim().toLowerCase();
      result = result.filter((b) => {
        const titleMatch = (b.title || "").toLowerCase().includes(query);
        const authorMatch = (b.author || "").toLowerCase().includes(query);
        return titleMatch || authorMatch;
      });
    }
    
    return result;
  }

  function updateSearchUI() {
    const hasQuery = state.searchQuery.trim().length > 0;
    el.btnClearSearch.hidden = !hasQuery;
  }

  function setSearchQuery(query) {
    state.searchQuery = query;
    updateSearchUI();
    render();
  }

  function updateStats() {
    const total = state.books.length;
    const read = state.books.filter((b) => b.status === "已读").length;
    const reading = state.books.filter((b) => b.status === "在读").length;
    el.statTotal.textContent = String(total);
    el.statRead.textContent = String(read);
    el.statReading.textContent = String(reading);
  }

  function render() {
    updateStats();

    const list = getFilteredBooks();
    el.bookGrid.innerHTML = list.map(renderCard).join("");
    
    // 显示空状态：无书籍 或 搜索/筛选无结果
    const hasBooks = state.books.length > 0;
    const hasResults = list.length > 0;
    el.emptyState.hidden = hasBooks && hasResults;
    
    // 更新空状态提示文字
    if (!hasBooks) {
      el.emptyTitle.textContent = "暂无书籍";
      el.emptyDesc.textContent = "点击上方的\"新增\"按钮添加你的第一本书吧";
    } else if (!hasResults && state.searchQuery.trim()) {
      el.emptyTitle.textContent = "未找到相关书籍";
      el.emptyDesc.textContent = `未找到包含"${escapeHtml(state.searchQuery)}"的书籍，试试其他关键词吧`;
    } else if (!hasResults) {
      el.emptyTitle.textContent = "暂无书籍";
      el.emptyDesc.textContent = "当前筛选条件下没有书籍";
    }

    // cover fallback on error
    el.bookGrid.querySelectorAll("img[data-cover-img]").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          const cover = img.closest(".cover");
          if (!cover) return;
          cover.innerHTML =
            `<div class="placeholder" aria-hidden="true"><i class="fa-regular fa-image"></i></div>`;
        },
        { once: true }
      );
    });
  }

  function setActiveFilterButton(filter) {
    el.filters.querySelectorAll(".chip").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
  }

  function setFilter(filter) {
    state.filter = filter;
    setActiveFilterButton(filter);
    render();
  }

  function upsertBookFromForm() {
    const title = el.title.value.trim();
    const author = el.author.value.trim();
    const cover = el.cover.value.trim();
    const status = /** @type {any} */ (el.status.value);
    const rating = clampInt(Number(el.rating.value), 0, 5);

    const idRaw = el.bookId.value.trim();
    const now = new Date().toISOString();

    if (!idRaw) {
      // create
      const id = getNextId();
      const book = /** @type {Book} */ ({
        id,
        title,
        author,
        cover,
        status: STATUS_ORDER.includes(status) ? status : "想读",
        rating,
        notes: "",
        addedDate: now,
      });
      state.books.unshift(book);
      saveBooks(state.books);
      bumpNextId(id + 1);
      showToast("添加成功");
      hideForm();
      enterAddMode(false);
      render();
      return;
    }

    // update
    const id = Number(idRaw);
    const idx = state.books.findIndex((b) => b.id === id);
    if (idx === -1) {
      showToast("未找到要编辑的书籍（可能已被删除）");
      hideForm();
      enterAddMode(false);
      render();
      return;
    }
    state.books[idx] = {
      ...state.books[idx],
      title,
      author,
      cover,
      status: STATUS_ORDER.includes(status) ? status : "想读",
      rating,
      notes: state.books[idx].notes || "",
    };
    saveBooks(state.books);
    showToast("保存成功");
    hideForm();
    enterAddMode(false);
    render();
  }

  function cycleStatus(book) {
    const i = STATUS_ORDER.indexOf(book.status);
    const next = STATUS_ORDER[(i + 1) % STATUS_ORDER.length] || "想读";
    return { ...book, status: next };
  }

  function handleCardAction(target) {
    const actionBtn = target.closest("button[data-action]");
    if (!actionBtn) return;
    const card = actionBtn.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const book = state.books.find((b) => b.id === id);
    if (!book) return;

    const action = actionBtn.dataset.action;
    if (action === "edit") {
      enterEditMode(book);
      return;
    }
    if (action === "delete") {
      const ok = window.confirm(`确认删除《${book.title}》吗？`);
      if (!ok) return;
      state.books = state.books.filter((b) => b.id !== id);
      saveBooks(state.books);
      showToast("已删除");
      // 若正在编辑被删除的书，退出编辑模式并隐藏表单
      if (Number(el.bookId.value) === id) {
        hideForm();
        enterAddMode(false);
      }
      render();
      return;
    }
    if (action === "cycle") {
      const idx = state.books.findIndex((b) => b.id === id);
      if (idx === -1) return;
      state.books[idx] = cycleStatus(state.books[idx]);
      saveBooks(state.books);
      render();
      return;
    }
    if (action === "notes") {
      showNotes(book);
      return;
    }
    if (action === "share") {
      shareBook(book);
      return;
    }
  }


  function shareBook(book) {
    const ratingText = book.rating > 0 ? `${book.rating} 星` : "未评分";
    const notesText = book.notes ? `\n\n📝 笔记：\n${book.notes}` : "";
    
    const shareText = `📚 《${book.title}》
👤 作者：${book.author}
📖 状态：${book.status}
⭐ 评分：${ratingText}${notesText}

—— 来自个人数字书架`;

    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast("已复制到剪贴板，可以分享给朋友了！");
      }).catch(() => {
        fallbackCopyText(shareText);
      });
    } else {
      fallbackCopyText(shareText);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("已复制到剪贴板，可以分享给朋友了！");
    } catch (err) {
      showToast("复制失败，请手动复制");
    }
    document.body.removeChild(textArea);
  }

  function wireEvents() {
    // 搜索功能
    el.searchInput.addEventListener("input", (e) => {
      setSearchQuery(e.target.value);
    });

    el.btnClearSearch.addEventListener("click", () => {
      el.searchInput.value = "";
      setSearchQuery("");
      el.searchInput.focus();
    });

    // 筛选功能
    el.filters.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      setFilter(btn.dataset.filter);
    });

    el.bookGrid.addEventListener("click", (e) => {
      handleCardAction(e.target);
    });

    el.btnAddNew.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("新增按钮被点击");
      enterAddMode();
    });

    el.btnCloseForm.addEventListener("click", () => {
      hideForm();
      enterAddMode(false);
    });

    el.btnCloseNotes.addEventListener("click", () => {
      hideForm();
      currentNotesBookId = null;
    });

    // 点击遮罩层关闭弹窗
    el.modalOverlay.addEventListener("click", (e) => {
      if (e.target === el.modalOverlay) {
        hideForm();
        enterAddMode(false);
        currentNotesBookId = null;
      }
    });

    // ESC 键关闭弹窗
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.modalOverlay.hidden) {
        hideForm();
        enterAddMode(false);
        currentNotesBookId = null;
      }
    });

    el.btnCancelEdit.addEventListener("click", () => {
      hideForm();
      enterAddMode(false);
    });

    // 笔记相关事件
    el.notesTextarea.addEventListener("input", () => {
      updateCharCount();
    });

    el.btnSaveNotes.addEventListener("click", () => {
      saveNotes();
    });

    el.btnShareBook.addEventListener("click", () => {
      if (!currentNotesBookId) {
        showToast("无法分享：未找到书籍信息");
        return;
      }
      const book = state.books.find((b) => b.id === currentNotesBookId);
      if (book) {
        shareBook(book);
      }
    });

    el.btnClearAll.addEventListener("click", () => {
      if (!state.books.length) {
        showToast("当前没有书籍可清空");
        return;
      }
      const ok = window.confirm("确认清空全部书籍吗？此操作不可撤销。");
      if (!ok) return;
      state.books = [];
      saveBooks(state.books);
      bumpNextId(1);
      hideForm();
      enterAddMode(false);
      showToast("已清空");
      render();
    });

    el.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      upsertBookFromForm();
    });
  }

  function init() {
    state.books = loadBooks();

    // Ensure nextId always >= max+1
    const maxId = state.books.reduce((m, b) => Math.max(m, b.id), 0);
    const storedNext = Number(localStorage.getItem(STORAGE_KEY_NEXT_ID) || "0");
    const next = Math.max(maxId + 1, Number.isFinite(storedNext) ? storedNext : 1);
    bumpNextId(next);

    // 检查关键元素是否存在
    if (!el.btnAddNew) {
      console.error("新增按钮元素未找到");
    }
    if (!el.modalOverlay) {
      console.error("弹窗遮罩层元素未找到");
    }
    if (!el.formCard) {
      console.error("表单卡片元素未找到");
    }

    wireEvents();
    enterAddMode(false); // 初始化时不显示表单
    hideForm(); // 确保表单隐藏
    setFilter("all");
    updateSearchUI(); // 初始化搜索UI状态
  }

  init();
})();

