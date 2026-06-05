let vocabList = JSON.parse(localStorage.getItem('savedWords')) || [];

let currentIndex = 0;

// Lấy các phần tử từ HTML ra
const flashcard = document.querySelector('.flashcard');
const cardInner = document.querySelector('.card-inner');
const wordEng = document.getElementById('flashcard-word');
const wordIpa = document.getElementById('flashcard-pron');
const wordVie = document.getElementById('flashcard-meaning');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const cardProgress = document.getElementById('card-progress');
const container = document.querySelector('.flashcard-container');

// 2. Hàm hiển thị dữ liệu lên thẻ
function renderCard() {
    // Trường hợp kiểm tra: Nếu mảng rỗng (người dùng chưa lưu từ nào)
    if (vocabList.length === 0) {
        container.innerHTML = `
            <h1>Thẻ Ghi Nhớ Từ Vựng</h1>
            <div style="margin: 40px 0; color: #666; font-family: sans-serif;">
                <i class="ti ti-bookmark-off" style="font-size: 3rem; color: #ccc; display: block; margin-bottom: 10px;"></i>
                <p>Danh sách Từ đã lưu (Saved Words) của bạn đang trống.</p>
                <p style="font-size: 14px; color: #999;">Hãy quay lại trang tra từ và lưu một số từ vựng để luyện tập nhé!</p>
            </div>
        `;
        return;
    }

    // Các thuộc tính lấy ra dưới đây phụ thuộc vào cấu trúc Object từ vựng mà người làm trang Từ điển lưu xuống
    // Ở đây mình map theo thuộc tính phổ biến hoặc bạn có thể đổi lại (ví dụ: item.word, item.phonetic, item.definition)
    const currentWord = vocabList[currentIndex];
    
    wordEng.innerText = currentWord.eng || currentWord.word || "N/A";
    wordIpa.innerText = currentWord.ipa || currentWord.phonetic || "";
    wordVie.innerText = currentWord.vie || currentWord.definition || "Chưa có định nghĩa";
    
    // Cập nhật số thứ tự tiến trình
    cardProgress.innerText = `${currentIndex + 1} / ${vocabList.length}`;
    
    // Reset mặt thẻ về mặt trước khi chuyển từ mới
    cardInner.classList.remove('is-flipped');
    
    // Khóa/Mở các nút bấm điều hướng
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === vocabList.length - 1);
}

// 3. Sự kiện lật thẻ xoay 3D
flashcard.addEventListener('click', () => {
    if (vocabList.length > 0) {
        cardInner.classList.toggle('is-flipped');
    }
});

// 4. Nút chuyển từ tiếp theo
nextBtn.addEventListener('click', () => {
    if (currentIndex < vocabList.length - 1) {
        currentIndex++;
        renderCard();
    }
});

// 5. Nút quay lại từ trước đó
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderCard();
    }
});

// Chạy hàm lần đầu khi vừa mở trang
renderCard();