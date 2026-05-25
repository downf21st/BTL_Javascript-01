/**
 * app.js — Từ Điển Anh Việt
 * ==========================
 * Tổ chức theo thứ tự:
 *   1. Dữ liệu từ điển (DICTIONARY)
 *   2. State toàn cục
 *   3. Module Tra Từ  — switchView, doSearch, showWord, speak
 *   4. Module Flashcard — initFlash, showCard, flipCard, answer, showDone
 *   5. Khởi tạo — gắn sự kiện khi DOM sẵn sàng
 */


/* ═══════════════════════════════════════════════════════════════════
   1. DỮ LIỆU TỪ ĐIỂN
   ═══════════════════════════════════════════════════════════════════
   Mỗi entry có cấu trúc:
   {
     pos:      string            — từ loại (danh từ / tính từ / …)
     phonetic: string            — phiên âm IPA
     meanings: Array<{
       vi:   string,             — nghĩa tiếng Việt
       desc: string,             — mô tả ngắn
       exEn: string,             — ví dụ tiếng Anh
       exVi: string              — dịch ví dụ
     }>
     related:  Array<string>     — danh sách từ liên quan
   }
*/
const DICTIONARY = {
  beautiful: {
    pos: "tính từ",
    phonetic: "/ˈbjuː.tɪ.fəl/",
    meanings: [
      {
        vi:   "đẹp, xinh đẹp",
        desc: "Có vẻ ngoài hấp dẫn và dễ chịu về mặt thị giác.",
        exEn: "The sunset over the mountains was absolutely beautiful.",
        exVi: "Hoàng hôn trên núi thật sự rất đẹp.",
      },
      {
        vi:   "tuyệt vời, xuất sắc",
        desc: "Rất tốt hoặc dễ chịu; gây ấn tượng mạnh.",
        exEn: "She gave a beautiful performance on stage.",
        exVi: "Cô ấy đã có một màn trình diễn tuyệt vời.",
      },
    ],
    related: ["pretty", "gorgeous", "stunning", "lovely", "attractive", "elegant"],
  },

  innovation: {
    pos: "danh từ",
    phonetic: "/ˌɪn.əˈveɪ.ʃən/",
    meanings: [
      {
        vi:   "đổi mới, sự cải tiến",
        desc: "Hành động giới thiệu ý tưởng, phương pháp hoặc sản phẩm mới.",
        exEn: "Innovation is at the heart of every great company.",
        exVi: "Đổi mới là trọng tâm của mọi công ty vĩ đại.",
      },
      {
        vi:   "sáng kiến, phát minh",
        desc: "Một ý tưởng hoặc sản phẩm mới được tạo ra.",
        exEn: "The smartphone was one of the greatest innovations of the century.",
        exVi: "Điện thoại thông minh là một trong những phát minh vĩ đại nhất.",
      },
    ],
    related: ["invention", "creativity", "progress", "technology", "breakthrough"],
  },

  perseverance: {
    pos: "danh từ",
    phonetic: "/ˌpɜː.sɪˈvɪər.əns/",
    meanings: [
      {
        vi:   "sự kiên trì, bền bỉ",
        desc: "Tiếp tục làm gì đó dù có khó khăn hay chậm chạp.",
        exEn: "Her perseverance paid off after years of hard work.",
        exVi: "Sự kiên trì của cô ấy đã được đền đáp sau nhiều năm.",
      },
    ],
    related: ["persistence", "determination", "resilience", "tenacity", "endurance"],
  },

  serendipity: {
    pos: "danh từ",
    phonetic: "/ˌser.ənˈdɪp.ɪ.ti/",
    meanings: [
      {
        vi:   "sự tình cờ may mắn",
        desc: "Tình cờ tìm thấy điều thú vị mà không tìm kiếm.",
        exEn: "It was pure serendipity that they met at the airport.",
        exVi: "Thật tình cờ may mắn khi họ gặp nhau tại sân bay.",
      },
    ],
    related: ["luck", "fortune", "chance", "coincidence", "fate"],
  },

  ambition: {
    pos: "danh từ",
    phonetic: "/æmˈbɪʃ.ən/",
    meanings: [
      {
        vi:   "tham vọng, hoài bão",
        desc: "Khao khát mạnh mẽ muốn thành công hoặc đạt được quyền lực.",
        exEn: "His ambition drove him to work harder than anyone else.",
        exVi: "Tham vọng đã thúc đẩy anh ấy làm việc chăm chỉ hơn.",
      },
      {
        vi:   "mục tiêu, nguyện vọng",
        desc: "Điều cụ thể mà một người muốn đạt được.",
        exEn: "Her ambition is to become a successful entrepreneur.",
        exVi: "Mục tiêu của cô ấy là trở thành doanh nhân thành công.",
      },
    ],
    related: ["aspiration", "goal", "drive", "motivation", "determination"],
  },
};


/* ═══════════════════════════════════════════════════════════════════
   2. STATE TOÀN CỤC
   ═══════════════════════════════════════════════════════════════════ */

// Tra từ
let currentWord = "";           // từ đang được hiển thị (dùng cho speak())

// Flashcard
let mode       = "en-vi";       // "en-vi" | "vi-en"
let cards      = [];            // mảng { word, entry } đã xáo trộn
let cardIndex  = 0;             // vị trí thẻ hiện tại
let isFlipped  = false;         // thẻ đang lật chưa?
let rightCount = 0;             // số thẻ đã nhớ
let wrongCount = 0;             // số thẻ chưa nhớ


/* ═══════════════════════════════════════════════════════════════════
   3. MODULE TRA TỪ
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Chuyển đổi giữa tab "Tra từ" và "Luyện tập".
 * @param {"dict"|"flash"} viewName
 */
function switchView(viewName) {
  const isDictView = viewName === "dict";

  document.getElementById("dictView").className  = "dict-view"  + (isDictView ? " show" : "");
  document.getElementById("flashView").className = "flash-view" + (isDictView ? "" : " show");

  // Cập nhật tab active: tab 0 = Tra từ, tab 1 = Luyện tập
  document.querySelectorAll(".nav-tab").forEach((tab, index) => {
    tab.className = "nav-tab" + ((isDictView ? 0 : 1) === index ? " active" : "");
  });

  // Tự động khởi tạo flashcard khi chuyển sang tab luyện tập
  if (!isDictView) initFlash();
}

/**
 * Đọc giá trị ô input và gọi showWord().
 */
function doSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (query) showWord(query);
}

/**
 * Điền sẵn từ vào input rồi tra ngay.
 * @param {string} word
 */
function quickSearch(word) {
  document.getElementById("searchInput").value = word;
  showWord(word);
}

/**
 * Hiển thị kết quả tra từ lên giao diện.
 * Nếu không tìm thấy → hiện thông báo empty state.
 * @param {string} word
 */
function showWord(word) {
  currentWord = word;

  const entry       = DICTIONARY[word];
  const resultArea  = document.getElementById("resultArea");
  const emptyState  = document.getElementById("emptyState");
  const relSection  = document.getElementById("relSection");

  // Không tìm thấy từ
  if (!entry) {
    resultArea.classList.remove("show");
    relSection.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector(".empty-text").textContent =
      `Không tìm thấy "${word}". Hãy thử từ khác.`;
    return;
  }

  // Điền thông tin từ
  document.getElementById("wordEn").textContent    = word;
  document.getElementById("wordPos").textContent   = entry.pos;
  document.getElementById("wordPhone").textContent = entry.phonetic;

  // Render danh sách nghĩa
  document.getElementById("meaningsEl").innerHTML = entry.meanings
    .map((meaning, index) => `
      <div class="meaning-item">
        <div class="meaning-vi">${index + 1}. ${meaning.vi}</div>
        <div class="meaning-desc">${meaning.desc}</div>
        <div class="ex-box">
          <div class="ex-en">"${meaning.exEn}"</div>
          <div class="ex-vi">→ ${meaning.exVi}</div>
        </div>
      </div>
    `)
    .join("");

  // Render từ liên quan
  document.getElementById("relWrap").innerHTML = entry.related
    .map(r => `<button class="rel-chip" onclick="quickSearch('${r}')">${r}</button>`)
    .join("");

  // Hiện kết quả, ẩn empty state
  emptyState.style.display = "none";
  resultArea.classList.add("show");
  relSection.style.display = "block";
}

/**
 * Phát âm từ hiện tại bằng Web Speech API.
 */
function speak() {
  if (!currentWord || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(currentWord);
  utterance.lang  = "en-US";
  utterance.rate  = 0.9;
  speechSynthesis.speak(utterance);
}


