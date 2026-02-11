(() => {
  "use strict";

  const STORAGE_KEY_BOOKS = "booklist.books";
  const STORAGE_KEY_NEXT_ID = "booklist.nextId";

  const STATUS_ORDER = ["想读", "在读", "已读"];

  /** @typedef {{id:number,title:string,author:string,cover:string,status:"想读"|"在读"|"已读",rating:number,addedDate?:string}} Book */

  const el = {
    statTotal: document.getElementById("statTotal"),
    statRead: document.getElementById("statRead"),
    statReading: document.getElementById("statReading"),

    filters: document.querySelector(".filters"),
    bookGrid: document.getElementById("bookGrid"),
    emptyState: document.getElementById("emptyState"),

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
    btnClearAll: document.getElementById("btnClearAll"),

    toast: document.getElementById("toast"),
  };

  /** @type {{books: Book[], filter: string}} */
  const state = {
    books: [],
    filter: "all",
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
    const addedDate = typeof b.addedDate === "string" ? b.addedDate : undefined;
    if (!Number.isFinite(id)) return null;
    return { id, title, author, cover, status, rating, addedDate };
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

  function enterAddMode() {
    el.formTitle.textContent = "添加书籍";
    el.bookId.value = "";
    el.btnSubmit.innerHTML = `<i class="fa-solid fa-plus"></i> 添加`;
    el.btnCancelEdit.hidden = true;
    el.form.reset();
    el.status.value = "想读";
    el.rating.value = "0";
    clearErrors();
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
    const f = state.filter;
    if (f === "all") return state.books.slice();
    if (f === "high") return state.books.filter((b) => (b.rating ?? 0) >= 4);
    return state.books.filter((b) => b.status === f);
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
    el.emptyState.hidden = state.books.length !== 0;

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
        addedDate: now,
      });
      state.books.unshift(book);
      saveBooks(state.books);
      bumpNextId(id + 1);
      showToast("添加成功");
      enterAddMode();
      render();
      return;
    }

    // update
    const id = Number(idRaw);
    const idx = state.books.findIndex((b) => b.id === id);
    if (idx === -1) {
      showToast("未找到要编辑的书籍（可能已被删除）");
      enterAddMode();
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
    };
    saveBooks(state.books);
    showToast("保存成功");
    enterAddMode();
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
      // 若正在编辑被删除的书，退出编辑模式
      if (Number(el.bookId.value) === id) enterAddMode();
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
  }

  function wireEvents() {
    el.filters.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      setFilter(btn.dataset.filter);
    });

    el.bookGrid.addEventListener("click", (e) => {
      handleCardAction(e.target);
    });

    el.btnCancelEdit.addEventListener("click", () => {
      enterAddMode();
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
      enterAddMode();
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

    wireEvents();
    enterAddMode();
    setFilter("all");
  }

  init();
})();

