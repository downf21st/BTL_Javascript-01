
const searchInput  = document.getElementById('search-query');
const searchBtn    = document.querySelector('.site-header__search-btn');
const searchForm   = document.querySelector('.site-header__search');

const wordEl       = document.getElementById('entry__word');
const phoneticEl   = document.querySelector('.entry__phonetic');
const defineEl     = document.getElementById('word-define');
const examplesEl   = document.querySelector('.entry__examples');
const synonymsEl   = document.querySelector('.entry__synonyms');

const btnBack    = document.querySelectorAll('.entry__history-btn')[0];
const btnForward = document.querySelectorAll('.entry__history-btn')[1];
const copyBtn    = document.querySelector('[aria-label="Copyboard"]');
const bookmarkBtn = document.querySelector('[aria-label="Bookmark"]');
const refreshBtn  = document.querySelector('.btn--primary');

let navHistory   = [];   
let historyIndex = -1;

function updateHistoryBtns() {
  btnBack.disabled    = historyIndex <= 0;
  btnForward.disabled = historyIndex >= navHistory.length - 1;
}

btnBack.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    renderEntry(navHistory[historyIndex]);
    updateHistoryBtns();
  }
});

btnForward.addEventListener('click', () => {
  if (historyIndex < navHistory.length - 1) {
    historyIndex++;
    renderEntry(navHistory[historyIndex]);
    updateHistoryBtns();
  }
});

function getSavedWords() {
  return JSON.parse(localStorage.getItem('savedWords') || '[]');
}

function isBookmarked(word) {
  return getSavedWords().includes(word);
}

function toggleBookmark(word) {
  const saved = getSavedWords();
  const idx   = saved.indexOf(word);
  if (idx === -1) {
    saved.push(word);
  } else {
    saved.splice(idx, 1);
  }
  localStorage.setItem('savedWords', JSON.stringify(saved));
  updateBookmarkBtn(word);
}

function updateBookmarkBtn(word) {
  if (!bookmarkBtn) return;
  const bookmarked = isBookmarked(word);
  const icon  = bookmarkBtn.querySelector('i');
  const label = bookmarkBtn.querySelector('.entry__icon-label');


  icon.className  = bookmarked ? 'ti ti-bookmark-filled' : 'ti ti-bookmark';
  label.textContent = bookmarked ? 'Đã lưu' : 'Bookmark';
  bookmarkBtn.style.color = bookmarked ? 'var(--text)' : '';
}

if (bookmarkBtn) {
  bookmarkBtn.addEventListener('click', () => {
    const word = wordEl.textContent.trim();
    if (!word || word === 'Không tìm thấy') return;
    toggleBookmark(word);
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const word = wordEl.textContent.trim();
    navigator.clipboard.writeText(word).then(() => {
      const label = copyBtn.querySelector('.entry__icon-label');
      const original = label.textContent;
      label.textContent = 'Đã copy!';
      setTimeout(() => { label.textContent = original; }, 1500);
    });
  });
} 
async function fetchWord(word) {
  const url = `https://dict.minhqnd.com/api/v1/lookup?word=${encodeURIComponent(word)}`;
  try {
    setLoadingState(true);
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(loading) {
  wordEl.style.opacity  = loading ? '0.35' : '1';
  wordEl.style.transition = 'opacity 0.2s';
  searchBtn.disabled    = loading;
}

function renderEntry(data) {
  if (!data || !data.exists) {
    showError();
    return;
  }

  const result = data.results?.[0];

  wordEl.textContent = data.word ?? '—';

  const pronunciations = result?.pronunciations ?? [];
  if (pronunciations.length > 0) {
    const parts = pronunciations
      .map(p => `${p.ipa}<span class="phonetic__region">${p.region}</span>`)
      .join('  ·  ');
    phoneticEl.innerHTML = `<span class="visually-hidden">Phát âm: </span>${parts}`;
  } else {
    phoneticEl.innerHTML = '';
  }

  const meanings = result?.meanings ?? [];
  if (meanings.length === 0) {
    defineEl.innerHTML = '<em>Không có định nghĩa.</em>';
  } else {
    defineEl.innerHTML = meanings.map(m => {
      const posLabel = m.pos ? `<span class="pos-badge">${m.pos}</span>` : '';
      const source   = m.source ? `<span class="meaning-source">${m.source}</span>` : '';
      const example  = m.example
        ? `<span class="meaning-example">${m.example}</span>`
        : '';
      return `
        <div class="meaning-item">
          <div class="meaning-meta">${posLabel}${source}</div>
          <p class="meaning-def">${m.definition}</p>
          ${example}
        </div>`;
    }).join('');
  }

  examplesEl.innerHTML = '';
  const hasExamples = meanings.some(m => m.example);
  if (!hasExamples) {
    examplesEl.innerHTML = '<li><em>Không có ví dụ.</em></li>';
  } else {
    meanings.forEach(m => {
      if (!m.example) return;
      const li = document.createElement('li');
      // In đậm từ chính trong câu ví dụ
      const highlighted = m.example.replace(
        new RegExp(`(${escapeRegex(data.word)})`, 'gi'),
        '<strong>$1</strong>'
      );
      li.innerHTML = highlighted;
      examplesEl.appendChild(li);
    });
  }

  synonymsEl.innerHTML = '';
  const relations = result?.relations ?? [];
  const translations = result?.translations ?? [];

  if (relations.length === 0 && translations.length === 0) {
    synonymsEl.innerHTML =
      '<li><em style="color:var(--text-muted);font-size:13px">Không có từ liên quan.</em></li>';
  } else {
    relations.forEach(r => {
      synonymsEl.appendChild(makeTagItem(r.related_word, r.relation_type));
    });
    translations.forEach(t => {
      synonymsEl.appendChild(makeTagItem(t.translation, t.lang_name));
    });
  }

  updateBookmarkBtn(data.word);

  document.title = `${data.word} — Online Dictionary`;
}

function makeTagItem(text, tooltip) {
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href        = '#';
  a.className   = 'tag';
  a.textContent = text;
  if (tooltip) a.title = tooltip;
  a.addEventListener('click', e => {
    e.preventDefault();
    searchInput.value = text;
    handleSearch();
  });
  li.appendChild(a);
  return li;
}

function showError() {
  wordEl.textContent   = 'Không tìm thấy';
  phoneticEl.innerHTML = '';
  defineEl.innerHTML   =
    '<em>Từ này chưa có trong từ điển. Hãy thử từ khác.</em>';
  examplesEl.innerHTML = '';
  synonymsEl.innerHTML = '';
  document.title       = 'Online Dictionary';
  updateBookmarkBtn('');
}

async function handleSearch() {
  const word = searchInput.value.trim();
  if (!word) return;

  const data = await fetchWord(word);

  if (data?.exists) {
    // Xoá forward stack khi tìm mới
    navHistory   = navHistory.slice(0, historyIndex + 1);
    navHistory.push(data);
    historyIndex = navHistory.length - 1;
    updateHistoryBtns();
  }

  renderEntry(data);
}

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  handleSearch();
});

searchBtn.addEventListener('click', e => {
  e.preventDefault();
  handleSearch();
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSearch();
  }
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    const current = navHistory[historyIndex];
    if (current) renderEntry(current);
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

updateHistoryBtns();