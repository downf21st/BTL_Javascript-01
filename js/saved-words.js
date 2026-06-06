// ================================================
// saved-words.js
// Xử lý tính năng "Saved Words" cho Online Dictionary
// Tác giả: [Tên bạn] - phụ trách phần Saved Words
// Lưu dữ liệu bằng localStorage (tồn tại sau khi F5)
// ================================================


// -----------------------------------------------
// BƯỚC 1: HIỂU CẤU TRÚC DỮ LIỆU
// -----------------------------------------------
// Mình lưu danh sách từ vào localStorage dưới dạng JSON.
// Mỗi từ là một object có dạng:
//
//   {
//     word:       "hello",           // từ tiếng Anh
//     definition: "Xin chào",        // nghĩa / định nghĩa
//     savedAt:    "2024-06-01 10:30" // thời gian lưu
//   }
//
// Tất cả được lưu trong một mảng, ví dụ:
//   [ {...}, {...}, {...} ]
//
// Dùng key "savedWords" để lưu/lấy từ localStorage.

var STORAGE_KEY = "savedWords";


// -----------------------------------------------
// HÀM TIỆN ÍCH: Lấy danh sách từ localStorage
// -----------------------------------------------
// localStorage chỉ lưu được chuỗi (string),
// nên khi lấy ra phải dùng JSON.parse để chuyển
// chuỗi → mảng object.
function getSavedWords() {
  var data = localStorage.getItem(STORAGE_KEY);

  if (data === null) {
    // Chưa có gì trong localStorage → trả về mảng rỗng
    return [];
  }

  return JSON.parse(data); // Chuyển chuỗi JSON → mảng
}


// -----------------------------------------------
// HÀM TIỆN ÍCH: Ghi mảng từ vào localStorage
// -----------------------------------------------
// JSON.stringify: chuyển mảng object → chuỗi JSON
// vì localStorage chỉ nhận string.
function setSavedWords(wordsArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wordsArray));
}


// -----------------------------------------------
// HÀM CHÍNH 1: Lưu một từ mới
// -----------------------------------------------
// Gọi hàm này từ trang tra từ chính khi người dùng
// nhấn nút "Lưu từ này".
//
// Ví dụ gọi:
//   saveWord("apple", "quả táo")
//
// @param {string} word       - từ tiếng Anh
// @param {string} definition - nghĩa hoặc định nghĩa
function saveWord(word, definition) {
  // Trim: xóa khoảng trắng thừa hai đầu
  word = word.trim();
  definition = definition.trim();

  // Không làm gì nếu từ rỗng
  if (word === "") return;

  var words = getSavedWords();

  // Kiểm tra xem từ đã được lưu chưa (tránh trùng)
  // toLowerCase: so sánh không phân biệt hoa thường
  for (var i = 0; i < words.length; i++) {
    if (words[i].word.toLowerCase() === word.toLowerCase()) {
      alert('Từ "' + word + '" đã có trong danh sách lưu rồi!');
      return;
    }
  }

  // Tạo object từ mới
  var newWord = {
    word: word,
    definition: definition,
    savedAt: getCurrentTime() // lấy thời gian hiện tại
  };

  // Thêm vào đầu mảng (từ mới nhất hiện đầu)
  words.unshift(newWord);

  // Ghi lại vào localStorage
  setSavedWords(words);

  // Cập nhật giao diện ngay lập tức
  renderSavedWords();

  alert('✅ Đã lưu từ "' + word + '"!');
}


// -----------------------------------------------
// HÀM CHÍNH 2: Xóa một từ
// -----------------------------------------------
// @param {number} index - vị trí của từ trong mảng
function deleteWord(index) {
  var words = getSavedWords();

  // Hỏi xác nhận trước khi xóa
  var confirmDelete = confirm('Xóa từ "' + words[index].word + '" khỏi danh sách?');
  if (!confirmDelete) return;

  // splice(index, 1): xóa 1 phần tử tại vị trí index
  words.splice(index, 1);

  // Ghi lại mảng đã xóa vào localStorage
  setSavedWords(words);

  // Cập nhật giao diện
  renderSavedWords();
}


// -----------------------------------------------
// HÀM CHÍNH 3: Hiển thị danh sách lên giao diện
// -----------------------------------------------
function renderSavedWords() {
  var words = getSavedWords();
  var list = document.getElementById("swList");
  var emptyMsg = document.getElementById("swEmptyMsg");

  // Xóa nội dung cũ trong danh sách
  list.innerHTML = "";

  // Nếu không có từ nào → hiện thông báo trống
  if (words.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  // Có từ → ẩn thông báo trống
  emptyMsg.style.display = "none";

  // Lặp qua từng từ, tạo thẻ <li> cho mỗi từ
  for (var i = 0; i < words.length; i++) {
    var item = words[i];

    // Tạo phần tử <li>
    var li = document.createElement("li");
    li.className = "sw-card";

    // Dùng data-index để biết vị trí từ trong mảng
    // (cần cho hàm filter khi tìm kiếm)
    li.setAttribute("data-index", i);
    li.setAttribute("data-word", item.word.toLowerCase());

    // Tạo nội dung HTML bên trong thẻ <li>
    // Lưu ý: dùng var i trong onclick — cần truyền
    // trực tiếp giá trị i vào chuỗi HTML
    li.innerHTML =
      '<div class="sw-card-content">' +
        '<p class="sw-word">' + item.word + '</p>' +
        '<p class="sw-definition">' + item.definition + '</p>' +
        '<span class="sw-saved-time">🕐 Lưu lúc: ' + item.savedAt + '</span>' +
      '</div>' +
      '<button class="sw-btn-delete" onclick="deleteWord(' + i + ')">🗑 Xóa</button>';

    list.appendChild(li);
  }
}


// -----------------------------------------------
// HÀM CHÍNH 4: Lọc (filter) theo từ khóa tìm kiếm
// -----------------------------------------------
// Được gọi mỗi khi người dùng gõ vào ô tìm kiếm.
function filterSavedWords() {
  var input = document.getElementById("swSearchInput");
  var keyword = input.value.trim().toLowerCase();

  var cards = document.querySelectorAll(".sw-card");
  var visibleCount = 0;

  for (var i = 0; i < cards.length; i++) {
    var wordAttr = cards[i].getAttribute("data-word");

    // Nếu từ chứa keyword → hiện, ngược lại → ẩn
    if (wordAttr.indexOf(keyword) !== -1) {
      cards[i].classList.remove("hidden");
      visibleCount++;
    } else {
      cards[i].classList.add("hidden");
    }
  }

  // Nếu không có kết quả nào khớp → hiện thông báo
  var emptyMsg = document.getElementById("swEmptyMsg");
  if (visibleCount === 0) {
    emptyMsg.style.display = "block";
    emptyMsg.innerHTML = '<p>Không tìm thấy từ nào khớp với "' + input.value + '"</p>';
  } else {
    emptyMsg.style.display = "none";
  }
}


// -----------------------------------------------
// HÀM TIỆN ÍCH: Lấy thời gian hiện tại dạng chuỗi
// -----------------------------------------------
// Trả về chuỗi như: "01/06/2024 10:30"
function getCurrentTime() {
  var now = new Date();

  var day   = String(now.getDate()).padStart(2, "0");
  var month = String(now.getMonth() + 1).padStart(2, "0"); // tháng 0-11 nên +1
  var year  = now.getFullYear();
  var hour  = String(now.getHours()).padStart(2, "0");
  var min   = String(now.getMinutes()).padStart(2, "0");

  return day + "/" + month + "/" + year + " " + hour + ":" + min;
}


// -----------------------------------------------
// KHỞI ĐỘNG: Render danh sách ngay khi trang load
// -----------------------------------------------
renderSavedWords();


// ================================================
// HƯỚNG DẪN TÍCH HỢP VỚI PHẦN TRA TỪ CỦA NHÓM
// ================================================
//
// Ở phần hiển thị kết quả tra từ (của người khác làm),
// sau khi có kết quả, họ gọi:
//
//   saveWord("từ tra", "nghĩa của từ");
//
// Ví dụ cụ thể:
//
//   // Giả sử nhóm lưu kết quả tra từ vào biến:
//   var resultWord = "apple";
//   var resultDefinition = "quả táo, cây táo";
//
//   // Nút lưu trong HTML của họ:
//   <button onclick="saveWord(resultWord, resultDefinition)">
//     💾 Lưu từ này
//   </button>
//
// Hàm saveWord() đã được export ra global (window),
// nên gọi từ bất kỳ file JS nào cũng được.
// ================================================