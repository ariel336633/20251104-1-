let questions = []; // 存題庫
let currentQ = 0;   // 當前題目索引
let correctCount = 0; // 答對數

// 讀取CSV題庫
fetch('questions.csv')
    .then(res => res.text())
    .then(data => {
        // 解析CSV：按行拆分，去掉標題行
        const lines = data.split('\n').slice(1);
        lines.forEach(line => {
            if (!line.trim()) return; // 跳過空行
            // 拆分題目、選項、正確答案（處理引號包裹的內容）
            const [q, a, b, c, correct] = line.replace(/"/g, '').split(',');
            questions.push({
                question: q,
                options: [a, b, c],
                correct: correct // 正確選項（A/B/C）
            });
        });
        renderQuestion(); // 渲染第一題
    })
    .catch(err => alert('題庫讀取失敗：' + err));

// 渲染當前題目
function renderQuestion() {
    if (currentQ >= questions.length) {
        showResult(); // 題目做完顯示結果
        return;
    }

    const qData = questions[currentQ];
    const qText = document.getElementById('questionText');
    const optionArea = document.getElementById('optionArea');

    // 設置題目文字
    qText.textContent = `${currentQ + 1}. ${qData.question}`;
    // 清空舊選項
    optionArea.innerHTML = '';

    // 生成選項（A/B/C）
    qData.options.forEach((opt, idx) => {
        const optLetter = String.fromCharCode(65 + idx); // 65=A, 66=B...
        const optItem = document.createElement('div');
        optItem.className = 'option-item';
        optItem.innerHTML = `
            <input type="radio" name="answer" id="opt${optLetter}" value="${optLetter}">
            <label for="opt${optLetter}">${optLetter}. ${opt}</label>
        `;
        optionArea.appendChild(optItem);
    });
}

// 下一題按鈕點擊事件
document.getElementById('nextBtn').addEventListener('click', () => {
    const selectedOpt = document.querySelector('input[name="answer"]:checked');
    if (!selectedOpt) {
        alert('請選擇一個答案！');
        return;
    }

    // 檢查是否答對
    const qData = questions[currentQ];
    if (selectedOpt.value === qData.correct) {
        correctCount++;
    }

    // 切到下一題
    currentQ++;
    renderQuestion();
    // 取消已選狀態
    selectedOpt.checked = false;
});

// 顯示測驗結果
function showResult() {
    const questionArea = document.getElementById('questionArea');
    const nextBtn = document.getElementById('nextBtn');
    const resultCard = document.getElementById('resultCard');

    // 隱藏題目和按鈕，顯示結果
    questionArea.style.display = 'none';
    nextBtn.style.display = 'none';
    resultCard.style.display = 'block';

    // 計算得分（百分比）
    const total = questions.length;
    const score = Math.round((correctCount / total) * 100);

    // 填充結果數據
    document.getElementById('totalQ').textContent = total;
    document.getElementById('correctQ').textContent = correctCount;
    document.getElementById('finalScore').textContent = score;
}
const questions = [
    {
        question: "如何在 VS Code 中開啟命令選擇區?",
        options: [
            "Ctrl + Shift + P",
            "Ctrl + P",
            "Ctrl + Shift + N",
            "Alt + F4"
        ],
        correct: 0
    },
    // ...其他題目...
];

let currentQuestion = 0;
let score = 0;

// 直接顯示第一題
showQuestion(0);

function showQuestion(questionIndex) {
    const question = questions[questionIndex];
    const quizContent = `
        <div class="question">
            <h2>問題 ${questionIndex + 1}: ${question.question}</h2>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option">${option}</button>
                `).join('')}
            </div>
        </div>
        <button id="next-btn" class="btn">下一題</button>
    `;
    
    document.getElementById('quiz').innerHTML = quizContent;
    attachOptionListeners();
}

// ...其餘功能程式碼...