const STORAGE_KEY = 'savedWords';
function loadWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

let words = loadWords();
if (!Array.isArray(words)) { words = []; }


const grid         = document.getElementById('saved-grid');
const emptyState   = document.getElementById('saved-empty');
const countEl      = document.getElementById('word-count');
const filterInput  = document.getElementById('filter-input');
const sortSelect   = document.getElementById('sort-select');
const clearAllBtn  = document.getElementById('clear-all-btn');
const toast        = document.getElementById('toast');
const modalOverlay = document.getElementById('modal-overlay');
const modalCount   = document.getElementById('modal-count');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');


let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

function formatDate(ts) {
  const d  = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function getFilteredAndSorted() {
  const query = filterInput.value.trim().toLowerCase();
  const sort  = sortSelect.value;

  const list = words.filter(function (w) {
    return (
      w.eng.toLowerCase().indexOf(query) !== -1 ||
      w.vie.toLowerCase().indexOf(query) !== -1
    );
  });

  list.sort(function (a, b) {
    if (sort === 'newest') return b.savedAt - a.savedAt;
    if (sort === 'oldest') return a.savedAt - b.savedAt;
    if (sort === 'az')     return a.eng.localeCompare(b.eng);
    if (sort === 'za')     return b.eng.localeCompare(a.eng);
    return 0;
  });

  return list;
}

function removeWord(wordEng) {
  words = words.filter(function (w) { return w.eng !== wordEng; });
  saveWords(words);
  render();
  showToast('Đã xóa "' + wordEng + '"');
}

function render() {
  const list = getFilteredAndSorted();

  countEl.textContent = words.length > 0 ? '(' + words.length + ')' : '';

  grid.innerHTML = '';

  if (list.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  list.forEach(function (item, index) {
    const card = document.createElement('article');
    card.className = 'word-card';
    card.setAttribute('role', 'listitem');

    card.style.animationDelay = (index * 35) + 'ms';

    card.innerHTML =
      '<button class="word-card__remove" data-word="' + esc(item.eng) + '" title="Xóa">' +
        '<i class="ti ti-x" aria-hidden="true"></i>' +
      '</button>' +
      '<div class="word-card__word">'       + esc(item.eng)       + '</div>' +
      '<div class="word-card__phonetic">'   + esc(item.ipa || '') + '</div>' +
      '<div class="word-card__definition">' + esc(item.vie) + '</div>' +
      '<div class="word-card__footer">' +
        '<span class="word-card__date">' + formatDate(item.savedAt) + '</span>' +
      '</div>';

    card.addEventListener('click', function (e) {
      if (e.target.closest('.word-card__remove')) return;
      sessionStorage.setItem('lookupWordData', JSON.stringify(item));
      window.location.href = 'index.html';
    });

    grid.appendChild(card);
  });

  grid.querySelectorAll('.word-card__remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      removeWord(btn.getAttribute('data-word'));
    });
  });
}

filterInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);
clearAllBtn.addEventListener('click', function () {
  if (words.length === 0) {
    showToast('Danh s\u00E1ch \u0111\u00E3 tr\u1ED1ng!');
    return;
  }
  modalCount.textContent = words.length + ' t\u1EEB';
  modalOverlay.classList.add('show');
  modalConfirm.focus();
});


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

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('show');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    modalOverlay.classList.remove('show');
  }
});


render();

function clearSavedWords() {
  words = [];
  saveWords(words);
  render();
  showToast('Đã xóa toàn bộ');
}