/* ============================================================
   saved.js — Logic cho trang Saved Words
   Đặt tại: js/saved.js
   Load ở cuối saved.html: <script src="js/saved.js"></script>

   Cách hoạt động:
   - Dữ liệu lưu trong localStorage với key "savedWords"
   - Mỗi từ là một object: { word, phonetic, definition, lang, savedAt }
   - Trang này đọc, hiển thị, lọc, sắp xếp và xóa các từ đó

   Tích hợp với index.html:
   - Dán hàm saveWord() vào file JS của trang tra từ
   - Gắn sự kiện click vào nút Bookmark để gọi saveWord()
   - Xem hướng dẫn chi tiết ở cuối file này
============================================================ */

/* ---- Hằng số ---- */
var STORAGE_KEY = 'savedWords';

/* ---- Dữ liệu mẫu để demo (nạp vào nếu localStorage trống) ---- */
var DEMO_DATA = [
  {
    word: 'Hello',
    phonetic: '/he\u02C8l\u0259\u028A/',
    definition: 'Xin ch\u00E0o, bi\u1EC3u l\u1ED9 s\u1EF1 ng\u1EA1c nhi\u00EAn',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 0
  },
  {
    word: 'Ephemeral',
    phonetic: '/\u026A\u02C8fem(\u0259)r(\u0259)l/',
    definition: 'Ch\u1EC9 t\u1ED3n t\u1EA1i trong th\u1EDDi gian ng\u1EAFn; ph\u00F9 du',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 1
  },
  {
    word: 'Serendipity',
    phonetic: '/\u02CCser\u0259n\u02C8d\u026Ap\u026Ati/',
    definition: 'S\u1EF1 t\u00ECnh c\u1EDD may m\u1EAFn; kh\u00E1m ph\u00E1 kh\u00F4ng ch\u1EE7 \u00FD',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 2
  },
  {
    word: 'Melancholy',
    phonetic: '/\u02C8mel\u0259nk\u0252li/',
    definition: 'N\u1ED7i bu\u1ED3n s\u00E2u s\u1EAFc, u s\u1EA7u k\u00E9o d\u00E0i',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 3
  },
  {
    word: 'Resilience',
    phonetic: '/r\u026A\u02C8z\u026Bl\u026A\u0259ns/',
    definition: 'Kh\u1EA3 n\u0103ng ph\u1EE5c h\u1ED3i sau kh\u00F3 kh\u0103n; s\u1EE9c b\u1EADt',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 4
  },
  {
    word: 'Ambiguous',
    phonetic: '/\u00E6m\u02C8b\u026A\u0261ju\u0259s/',
    definition: 'M\u01A1 h\u1ED3, c\u00F3 th\u1EC3 hi\u1EC3u theo nhi\u1EC1u ngh\u0129a kh\u00E1c nhau',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 5
  },
  {
    word: 'Eloquent',
    phonetic: '/\u02C8el\u0259kw\u0259nt/',
    definition: 'H\u00F9ng h\u1ED3n, di\u1EC5n \u0111\u1EA1t tr\u00F4i ch\u1EA3y v\u00E0 thuy\u1EBFt ph\u1EE5c',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 6
  },
  {
    word: 'Nostalgia',
    phonetic: '/n\u0252\u02C8st\u00E6ld\u0292\u0259/',
    definition: 'N\u1ED7i nh\u1EDB nhung v\u1EC1 qu\u00E1 kh\u1EE9; ho\u00E0i ni\u1EC7m',
    lang: 'ENG-VI',
    savedAt: Date.now() - 86400000 * 7
  }
];

/* ============================================================
   ĐỌC / GHI localStorage
============================================================ */

function loadWords() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveWords(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Không thể ghi vào localStorage:', e);
  }
}

/*
 * Đọc từ localStorage:
 *  null  → chưa từng dùng → nạp DEMO_DATA
 *  []    → đã Clear all   → giữ rỗng, hiện empty state
 *  [...] → có từ thật     → hiển thị bình thường
 *
 * Reset về demo: bấm "Load demo data" ở empty state
 * hoặc gõ resetSavedWords() trong DevTools Console.
 */
var words = loadWords();
if (words === null) {
  words = DEMO_DATA;
  saveWords(words);
}
if (!Array.isArray(words)) { words = []; }

/* ============================================================
   LẤY CÁC PHẦN TỬ DOM
============================================================ */

var grid         = document.getElementById('saved-grid');
var emptyState   = document.getElementById('saved-empty');
var countEl      = document.getElementById('word-count');
var filterInput  = document.getElementById('filter-input');
var sortSelect   = document.getElementById('sort-select');
var clearAllBtn  = document.getElementById('clear-all-btn');
var toast        = document.getElementById('toast');
var modalOverlay = document.getElementById('modal-overlay');
var modalCount   = document.getElementById('modal-count');
var modalCancel  = document.getElementById('modal-cancel');
var modalConfirm = document.getElementById('modal-confirm');

/* ============================================================
   HÀM TIỆN ÍCH
============================================================ */

/* Hiển thị toast thông báo ngắn */
var toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

/* Format timestamp -> dd/mm/yyyy */
function formatDate(ts) {
  var d  = new Date(ts);
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

/* Escape HTML để tránh XSS khi dùng innerHTML */
function esc(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ============================================================
   LỌC + SẮP XẾP
   - Lọc: so khớp từ khóa với word và definition
   - Sắp xếp: newest / oldest / a-z / z-a
============================================================ */

function getFilteredAndSorted() {
  var query = filterInput.value.trim().toLowerCase();
  var sort  = sortSelect.value;

  /* 1. Lọc */
  var list = words.filter(function (w) {
    return (
      w.word.toLowerCase().indexOf(query) !== -1 ||
      w.definition.toLowerCase().indexOf(query) !== -1
    );
  });

  /* 2. Sắp xếp */
  list.sort(function (a, b) {
    if (sort === 'newest') return b.savedAt - a.savedAt;
    if (sort === 'oldest') return a.savedAt - b.savedAt;
    if (sort === 'az')     return a.word.localeCompare(b.word);
    if (sort === 'za')     return b.word.localeCompare(a.word);
    return 0;
  });

  return list;
}

/* ============================================================
   XÓA MỘT TỪ
============================================================ */

function removeWord(wordText) {
  words = words.filter(function (w) { return w.word !== wordText; });
  saveWords(words);
  render();
  showToast('\u0110\u00E3 x\u00F3a "' + wordText + '"');
}

/* ============================================================
   RENDER — vẽ lại toàn bộ grid
   Gọi lại mỗi khi: lọc, sắp xếp, xóa, xóa tất cả
============================================================ */

function render() {
  var list = getFilteredAndSorted();

  /* Cập nhật số đếm tổng (không phải sau lọc) */
  countEl.textContent = words.length > 0 ? '(' + words.length + ')' : '';

  /* Xóa nội dung cũ */
  grid.innerHTML = '';

  /* Nếu không có gì để hiện → trạng thái rỗng */
  if (list.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  /* Tạo card cho từng từ */
  list.forEach(function (item, index) {
    var card = document.createElement('article');
    card.className = 'word-card';
    card.setAttribute('role', 'listitem');

    /* Delay nhỏ để có hiệu ứng cascade khi render */
    card.style.animationDelay = (index * 35) + 'ms';

    card.innerHTML =
      '<button class="word-card__remove" data-word="' + esc(item.word) + '" title="X\u00F3a">' +
        '<i class="ti ti-x" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="word-card__word">'       + esc(item.word)       + '</div>' +
      '<div class="word-card__phonetic">'   + esc(item.phonetic || '') + '</div>' +
      '<div class="word-card__definition">' + esc(item.definition) + '</div>' +
      '<div class="word-card__footer">' +
        '<span class="word-card__date">' + formatDate(item.savedAt) + '</span>' +
        '<span class="word-card__lang">' + esc(item.lang) + '</span>' +
      '</div>';

    /*
     * Click vào card → lưu từ cần xem vào sessionStorage
     * rồi chuyển về index.html để trang đó tự load từ đó.
     * Nếu click vào nút X thì bỏ qua (xử lý riêng bên dưới).
     */
    card.addEventListener('click', function (e) {
      if (e.target.closest('.word-card__remove')) return;
      sessionStorage.setItem('lookupWord', item.word);
      window.location.href = 'index.html';
    });

    grid.appendChild(card);
  });

  /* Gắn sự kiện xóa cho tất cả nút X trong grid */
  grid.querySelectorAll('.word-card__remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      removeWord(btn.getAttribute('data-word'));
    });
  });
}

/* ============================================================
   SỰ KIỆN TOOLBAR
============================================================ */

/* Lọc real-time khi gõ vào ô filter */
filterInput.addEventListener('input', render);

/* Sắp xếp lại khi đổi dropdown */
sortSelect.addEventListener('change', render);

/* Mở modal xác nhận khi nhấn Clear all */
clearAllBtn.addEventListener('click', function () {
  if (words.length === 0) {
    showToast('Danh s\u00E1ch \u0111\u00E3 tr\u1ED1ng!');
    return;
  }
  modalCount.textContent = words.length + ' t\u1EEB';
  modalOverlay.classList.add('show');
  modalConfirm.focus();
});

/* ============================================================
   SỰ KIỆN MODAL
============================================================ */

modalCancel.addEventListener('click', function () {
  modalOverlay.classList.remove('show');
});

modalConfirm.addEventListener('click', function () {
  words = [];
  saveWords(words);
  modalOverlay.classList.remove('show');
  render();
  showToast('\u0110\u00E3 x\u00F3a t\u1EA5t c\u1EA3 t\u1EEB \u0111\u00E3 l\u01B0u');
});

/* Đóng modal khi click ra vùng tối xung quanh */
modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('show');
  }
});

/* Đóng modal bằng phím Escape */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    modalOverlay.classList.remove('show');
  }
});

/* ============================================================
   KHỞI CHẠY LẦN ĐẦU
============================================================ */

render();


/* ============================================================
   TIỆN ÍCH CHO DEVELOPMENT
   Mở DevTools Console và chạy:
     resetSavedWords()   → xóa localStorage, nạp lại demo data
     clearSavedWords()   → xóa sạch toàn bộ
============================================================ */

function resetSavedWords() {
  words = DEMO_DATA;
  saveWords(words);
  render();
  showToast('Đã reset về dữ liệu demo');
}

function clearSavedWords() {
  words = [];
  saveWords(words);
  render();
  showToast('Đã xóa toàn bộ');
}


/* ============================================================
   HƯỚNG DẪN TÍCH HỢP VỚI index.html
   ============================================================
   Dán đoạn code dưới đây vào file JS của trang tra từ (index.html).
   Khi người dùng click nút Bookmark, từ hiện tại sẽ được lưu
   vào localStorage và hiện lên tại trang saved.html.

   -----------------------------------------------------------

   var STORAGE_KEY = 'savedWords';

   function saveWord(entry) {
     var words = [];
     try {
       words = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
     } catch (e) {}

     // Kiểm tra xem từ đã được lưu chưa
     var alreadySaved = words.some(function (w) {
       return w.word === entry.word;
     });

     if (alreadySaved) {
       showToast('"' + entry.word + '" đã được lưu rồi!');
       return;
     }

     // Thêm vào đầu danh sách (mới nhất lên trên)
     words.unshift(Object.assign({}, entry, { savedAt: Date.now() }));
     localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
     showToast('Đã lưu "' + entry.word + '"');
   }

   // Gắn sự kiện cho nút Bookmark trong index.html:
   document.querySelector('[aria-label="Bookmark"]').addEventListener('click', function () {
     saveWord({
       word:       document.getElementById('entry__word').textContent.trim(),
       phonetic:   document.querySelector('.entry__phonetic').textContent.trim(),
       definition: document.getElementById('word-define').textContent.trim(),
       lang:       'ENG-VI'
     });
   });

   -----------------------------------------------------------
   Lưu ý: hàm showToast() cần được định nghĩa trước,
   hoặc thay bằng alert() nếu chưa có.
============================================================ */