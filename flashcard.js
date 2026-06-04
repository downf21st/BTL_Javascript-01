const vocabList = [
    { eng: "Hello", ipa: "/həˈloʊ/", vie: "Xin chào" },
    { eng: "Dictionary", ipa: "/ˈdɪkʃəneri/", vie: "Từ điển" },
    { eng: "Application", ipa: "/ˌæplɪˈkeɪʃn/", vie: "Ứng dụng" },
    { eng: "Student", ipa: "/ˈstuːdnt/", vie: "Sinh viên" },
    { eng: "Database", ipa: "/ˈdeɪtəbeɪs/", vie: "Cơ sở dữ liệu" },
    { eng: "Programming", ipa: "/ˈproʊɡræmɪŋ/", vie: "Lập trình" },
    { eng: "Variable", ipa: "/ˈværiəbl/", vie: "Biến số" },
    { eng: "Function", ipa: "/ˈfʌŋkʃn/", vie: "Hàm (trong code)" },
    { eng: "Loop", ipa: "/luːp/", vie: "Vòng lặp" },
    { eng: "Developer", ipa: "/dɪˈveləpər/", vie: "Nhà phát triển phần mềm" }
];

let currentIndex = 0;

const flashcard = document.getElementById('flashcard');
const wordEng = document.getElementById('word-eng');
const wordIpa = document.getElementById('word-ipa');
const wordVie = document.getElementById('word-vie');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const cardProgress = document.getElementById('card-progress');

function renderCard() {
    wordEng.innerText = vocabList[currentIndex].eng;
    wordIpa.innerText = vocabList[currentIndex].ipa;
    wordVie.innerText = vocabList[currentIndex].vie;
    cardProgress.innerText = `${currentIndex + 1} / ${vocabList.length}`;
    flashcard.classList.remove('flipped');
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === vocabList.length - 1);
}

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
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