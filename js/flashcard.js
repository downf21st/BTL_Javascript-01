let vocabList = JSON.parse(localStorage.getItem('savedWords')) || [];

let currentIndex = 0;


const flashcard = document.querySelector('.flashcard');
const cardInner = document.querySelector('.card-inner');
const wordEng = document.getElementById('flashcard-word');
const wordIpa = document.getElementById('flashcard-pron');
const wordVie = document.getElementById('flashcard-meaning');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const cardProgress = document.getElementById('card-progress');
const container = document.querySelector('.flashcard-container');

function renderCard() {
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


    const currentWord = vocabList[currentIndex];
    
    wordEng.innerText = currentWord.eng || currentWord.word || "N/A";
    wordIpa.innerText = currentWord.ipa || currentWord.phonetic || "";
    wordVie.innerText = currentWord.vie || currentWord.definition || "Chưa có định nghĩa";
    
    cardProgress.innerText = `${currentIndex + 1} / ${vocabList.length}`;

    cardInner.classList.remove('is-flipped');
    

    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === vocabList.length - 1);
}

flashcard.addEventListener('click', () => {
    if (vocabList.length > 0) {
        cardInner.classList.toggle('is-flipped');
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < vocabList.length - 1) {
        currentIndex++;
        renderCard();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderCard();
    }
});

renderCard();

window.addEventListener('storage', (e) => {
    if (e.key === 'savedWords') {
        const oldLength = vocabList.length;
        vocabList = JSON.parse(e.newValue) || [];
        
        if (vocabList.length === 0) {
            currentIndex = 0;
            renderCard();
        } else {
            if (currentIndex >= vocabList.length) {
                currentIndex = vocabList.length - 1;
            }
            renderCard();
        }
    }
});

window.addEventListener('savedWordsChanged', () => {
    const oldLength = vocabList.length;
    vocabList = JSON.parse(localStorage.getItem('savedWords')) || [];
    
    if (vocabList.length === 0) {
        currentIndex = 0;
        renderCard();
    } else {
        if (currentIndex >= vocabList.length) {
            currentIndex = vocabList.length - 1;
        }
        renderCard();
    }
});