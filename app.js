(() => {
  "use strict";

  const STATUS_ORDER = ["想读", "在读", "已读"];

  // 检查 Supabase 是否可用（延迟检查，因为可能在脚本加载时还未初始化）
  function checkSupabase() {
    try {
      return typeof window.supabase !== "undefined" && window.supabase !== null;
    } catch (e) {
      return false;
    }
  }
  
  // 动态检查函数，在每次使用时调用
  function getUseSupabase() {
    return checkSupabase();
  }
  
  // 初始值（可能在初始化时更新）
  let useSupabase = false;

  /** @typedef {{id:number,title:string,author:string,cover:string,status:"想读"|"在读"|"已读",rating:number,notes?:string,addedDate?:string}} Book */

  const el = {
    statTotal: document.getElementById("statTotal"),
    statRead: document.getElementById("statRead"),
    statReading: document.getElementById("statReading"),
    statStorage: document.getElementById("statStorage"),
    statStorageValue: document.getElementById("statStorageValue"),

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

  /** @returns {Promise<Book[]>} */
  async function loadBooks() {
    if (getUseSupabase()) {
      try {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("加载书籍失败:", error);
          showToast("加载数据失败，请检查网络连接");
          return [];
        }

        return (data || [])
          .map(normalizeBook)
          .filter((b) => b && typeof b.id === "number");
      } catch (err) {
        console.error("加载书籍异常:", err);
        showToast("加载数据失败");
        return [];
      }
    } else {
      // 降级到 localStorage
      const raw = localStorage.getItem("booklist.books");
      const parsed = safeParseJson(raw ?? "[]", []);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(normalizeBook)
        .filter((b) => b && typeof b.id === "number");
    }
  }

  async function saveBook(book) {
    if (getUseSupabase()) {
      try {
        const bookData = {
          title: book.title,
          author: book.author,
          cover: book.cover || null,
          status: book.status,
          rating: book.rating,
          notes: book.notes || null,
        };

        if (book.id) {
          // 更新
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(bookData)
            .eq("id", book.id)
            .select()
            .single();

          if (error) {
            console.error("更新书籍失败:", error);
            showToast("保存失败，请重试");
            return null;
          }
          return normalizeBook(data);
        } else {
          // 插入
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(bookData)
            .select()
            .single();

          if (error) {
            console.error("添加书籍失败:", error);
            showToast("添加失败，请重试");
            return null;
          }
          return normalizeBook(data);
        }
      } catch (err) {
        console.error("保存书籍异常:", err);
        showToast("保存失败");
        return null;
      }
    } else {
      // 降级到 localStorage
      const books = await loadBooks();
      if (book.id) {
        const idx = books.findIndex((b) => b.id === book.id);
        if (idx !== -1) {
          books[idx] = book;
        }
      } else {
        const maxId = books.reduce((m, b) => Math.max(m, b.id), 0);
        book.id = maxId + 1;
        books.unshift(book);
      }
      localStorage.setItem("booklist.books", JSON.stringify(books));
      return book;
    }
  }

  async function deleteBook(id) {
    if (getUseSupabase()) {
      try {
        const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

        if (error) {
          console.error("删除书籍失败:", error);
          showToast("删除失败，请重试");
          return false;
        }
        return true;
      } catch (err) {
        console.error("删除书籍异常:", err);
        showToast("删除失败");
        return false;
      }
    } else {
      // 降级到 localStorage
      const books = await loadBooks();
      const filtered = books.filter((b) => b.id !== id);
      localStorage.setItem("booklist.books", JSON.stringify(filtered));
      return true;
    }
  }

  async function deleteAllBooks() {
    if (getUseSupabase()) {
      try {
        const { error } = await supabase.from(TABLE_NAME).delete().neq("id", 0);

        if (error) {
          console.error("清空书籍失败:", error);
          showToast("清空失败，请重试");
          return false;
        }
        return true;
      } catch (err) {
        console.error("清空书籍异常:", err);
        showToast("清空失败");
        return false;
      }
    } else {
      // 降级到 localStorage
      localStorage.setItem("booklist.books", "[]");
      return true;
    }
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
    // Supabase 使用 created_at，localStorage 使用 addedDate
    const addedDate =
      typeof b.created_at === "string"
        ? b.created_at
        : typeof b.addedDate === "string"
        ? b.addedDate
        : undefined;
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
    if (!el.modalOverlay) {
      console.error("❌ 弹窗遮罩层未找到");
      showToast("弹窗元素未找到，请刷新页面");
      return;
    }
    if (!el.formCard) {
      console.error("❌ 表单卡片未找到");
      showToast("表单元素未找到，请刷新页面");
      return;
    }
    
    try {
      el.formCard.hidden = false;
      if (el.notesCard) el.notesCard.hidden = true;
      el.modalOverlay.hidden = false;
      // 防止背景滚动
      document.body.style.overflow = "hidden";
      // 聚焦到第一个输入框
      setTimeout(() => {
        if (el.title) {
          el.title.focus();
        }
      }, 100);
      console.log("✅ 表单弹窗已显示");
    } catch (err) {
      console.error("❌ 显示表单时出错:", err);
      showToast("打开表单失败");
    }
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

  async function saveNotes() {
    if (!currentNotesBookId) {
      showToast("无法保存：未找到书籍信息");
      return;
    }
    const book = state.books.find((b) => b.id === currentNotesBookId);
    if (!book) {
      showToast("未找到要保存的书籍");
      return;
    }
    const notes = el.notesTextarea.value.trim();
    const updatedBook = { ...book, notes };
    const savedBook = await saveBook(updatedBook);
    if (!savedBook) {
      return; // 错误已在 saveBook 中处理
    }

    // 重新加载数据
    state.books = await loadBooks();
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
      : `<div class="placeholder" aria-hidden="true"><i class="fa-solid fa-book"></i></div>`;

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

  function updateStorageStatus() {
    if (getUseSupabase()) {
      el.statStorageValue.textContent = "云端";
      el.statStorageValue.style.color = "#28a745";
      el.statStorage.title = "使用 Supabase 云端数据库";
    } else {
      el.statStorageValue.textContent = "本地";
      el.statStorageValue.style.color = "#ffc107";
      el.statStorage.title = "使用浏览器 localStorage（本地存储）";
    }
  }

  async function testSupabaseConnection() {
    if (!getUseSupabase()) return;
    try {
      const { data, error } = await supabase.from(TABLE_NAME).select("id").limit(1);
      if (error) {
        console.error("❌ Supabase 连接测试失败:", error.message);
        console.error("请检查：");
        console.error("1. config.js 中的 URL 和 Key 是否正确");
        console.error("2. Supabase 项目是否正常运行");
        console.error("3. 数据库表 'books' 是否已创建");
        console.error("4. RLS 策略是否正确配置");
      } else {
        console.log("✅ Supabase 连接成功");
      }
    } catch (err) {
      console.error("❌ Supabase 连接异常:", err);
    }
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
            `<div class="placeholder" aria-hidden="true"><i class="fa-solid fa-book"></i></div>`;
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

  async function upsertBookFromForm() {
    const title = el.title.value.trim();
    const author = el.author.value.trim();
    const cover = el.cover.value.trim();
    const status = /** @type {any} */ (el.status.value);
    const rating = clampInt(Number(el.rating.value), 0, 5);

    const idRaw = el.bookId.value.trim();

    const book = /** @type {Book} */ ({
      id: idRaw ? Number(idRaw) : undefined,
      title,
      author,
      cover,
      status: STATUS_ORDER.includes(status) ? status : "想读",
      rating,
      notes: idRaw
        ? state.books.find((b) => b.id === Number(idRaw))?.notes || ""
        : "",
    });

    const savedBook = await saveBook(book);
    if (!savedBook) {
      return; // 错误已在 saveBook 中处理
    }

    // 重新加载数据
    state.books = await loadBooks();
    showToast(idRaw ? "保存成功" : "添加成功");
    hideForm();
    enterAddMode(false);
    render();
  }

  function cycleStatus(book) {
    const i = STATUS_ORDER.indexOf(book.status);
    const next = STATUS_ORDER[(i + 1) % STATUS_ORDER.length] || "想读";
    return { ...book, status: next };
  }

  async function handleDeleteBook(id) {
    const success = await deleteBook(id);
    if (!success) {
      return; // 错误已在 deleteBook 中处理
    }
    // 重新加载数据
    state.books = await loadBooks();
    showToast("已删除");
    // 若正在编辑被删除的书，退出编辑模式并隐藏表单
    if (Number(el.bookId.value) === id) {
      hideForm();
      enterAddMode(false);
    }
    render();
  }

  async function handleCycleStatus(book) {
    const updatedBook = cycleStatus(book);
    const savedBook = await saveBook(updatedBook);
    if (!savedBook) {
      return; // 错误已在 saveBook 中处理
    }
    // 重新加载数据
    state.books = await loadBooks();
    render();
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
      handleDeleteBook(id);
      return;
    }
    if (action === "cycle") {
      handleCycleStatus(book);
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
      console.log("✅ 新增按钮被点击");
      try {
        enterAddMode();
      } catch (err) {
        console.error("❌ 点击新增按钮时出错:", err);
        showToast("打开表单失败，请刷新页面重试");
      }
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

    el.btnClearAll.addEventListener("click", async () => {
      if (!state.books.length) {
        showToast("当前没有书籍可清空");
        return;
      }
      const ok = window.confirm("确认清空全部书籍吗？此操作不可撤销。");
      if (!ok) return;
      const success = await deleteAllBooks();
      if (!success) {
        return; // 错误已在 deleteAllBooks 中处理
      }
      // 重新加载数据
      state.books = await loadBooks();
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

  async function init() {
    console.log("🚀 开始初始化应用...");
    
    // 检查关键元素是否存在
    const missingElements = [];
    if (!el.btnAddNew) {
      console.error("❌ 新增按钮元素未找到 (btnAddNew)");
      missingElements.push("btnAddNew");
    }
    if (!el.modalOverlay) {
      console.error("❌ 弹窗遮罩层元素未找到 (modalOverlay)");
      missingElements.push("modalOverlay");
    }
    if (!el.formCard) {
      console.error("❌ 表单卡片元素未找到 (formCard)");
      missingElements.push("formCard");
    }
    if (!el.searchInput) {
      console.error("❌ 搜索输入框元素未找到 (searchInput)");
      missingElements.push("searchInput");
    }
    
    if (missingElements.length > 0) {
      console.error("❌ 缺少关键元素，应用可能无法正常工作:", missingElements);
      console.error("📋 当前 DOM 状态:", {
        btnAddNew: !!el.btnAddNew,
        modalOverlay: !!el.modalOverlay,
        formCard: !!el.formCard,
        searchInput: !!el.searchInput
      });
      showToast("页面加载错误，请刷新页面重试");
      // 即使缺少元素也继续初始化，避免完全无法使用
    }

    // 重新检查 Supabase（可能在初始化时还未加载）
    useSupabase = getUseSupabase();
    
    // 检查 Supabase 配置并显示状态
    updateStorageStatus();
    
    if (getUseSupabase()) {
      console.log("✅ 使用 Supabase 数据库");
      if (typeof SUPABASE_CONFIG !== "undefined" && SUPABASE_CONFIG) {
        console.log("📊 Supabase URL:", SUPABASE_CONFIG.url);
      }
      // 测试连接
      testSupabaseConnection();
    } else {
      console.warn("⚠️ Supabase 未配置，将使用 localStorage 作为降级方案");
      console.log("💾 数据将保存在浏览器本地存储");
    }

    // 加载书籍数据
    state.books = await loadBooks();

    wireEvents();
    enterAddMode(false); // 初始化时不显示表单
    hideForm(); // 确保表单隐藏
    setFilter("all");
    updateSearchUI(); // 初始化搜索UI状态
    
    console.log("✅ 应用初始化完成");
    console.log("📋 关键元素状态:", {
      btnAddNew: !!el.btnAddNew,
      modalOverlay: !!el.modalOverlay,
      formCard: !!el.formCard
    });
  }

  // 等待 DOM 完全加载后再初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM 已经加载完成
    init();
  }
})();

