let questionTable;
let allQuestions = [];
let quizQuestions = []; // 儲存本次測驗的3個題目
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // 遊戲狀態: START, QUESTION, FEEDBACK, RESULT

// 按鈕物件
let answerButtons = [];
let startButton, restartButton;

// 互動效果
let particles = [];
let feedbackMessage = '';
let feedbackColor;
let feedbackTimer = 0;

// 在開頭加入雲朵相關變數
let clouds = [];

// 在檔案開頭添加海浪相關變數
let waves = [];
const WAVE_COUNT = 5;

function preload() {
  // 載入 CSV 檔案，指定 'csv' 格式且沒有標頭
  questionTable = loadTable('questions.csv', 'csv');
}

function setup() {
  createCanvas(800, 600);
  processData();
  setupButtons();
  setupParticles();
  setupWaves();  // 新增這行
  startGame();
}

// 加入雲朵設定函數
function setupClouds() {
  // 創建 5 朵雲
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(100, 250),
      w: random(100, 200),
      speed: random(0.2, 0.5),
      opacity: random(180, 220)
    });
  }
}

// 在 setup 函數中添加海浪初始化
function setupWaves() {
  for (let i = 0; i < WAVE_COUNT; i++) {
    waves.push({
      y: height * 0.3 + i * 80,
      offset: random(1000),
      speed: random(0.02, 0.04),
      amplitude: random(20, 40)
    });
  }
}

function draw() {
  // 漸層藍天背景
  let skyGradient = drawingContext.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, color(135, 206, 235)); // 天空藍
  skyGradient.addColorStop(1, color(176, 226, 255)); // 較淺的藍
  drawingContext.fillStyle = skyGradient;
  rect(0, 0, width, height);
  
  // 繪製雲朵
  drawClouds();
  
  // 其他原有的繪製...
  drawParticles();

  // 根據不同的遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUESTION':
      drawQuestionScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }
}

// 加入雲朵繪製函數
function drawClouds() {
  noStroke();
  for (let cloud of clouds) {
    fill(255, cloud.opacity);
    // 繪製一朵由多個圓形組成的雲
    ellipse(cloud.x, cloud.y, cloud.w * 0.8, cloud.w * 0.5);
    ellipse(cloud.x - cloud.w * 0.2, cloud.y, cloud.w * 0.6, cloud.w * 0.4);
    ellipse(cloud.x + cloud.w * 0.2, cloud.y, cloud.w * 0.6, cloud.w * 0.4);
    
    // 移動雲朵
    cloud.x += cloud.speed;
    
    // 如果雲朵移出畫面，從另一側重新進入
    if (cloud.x > width + cloud.w) {
      cloud.x = -cloud.w;
      cloud.y = random(100, 250);
    }
  }
}

// 新增繪製海浪函數
function drawWaves() {
  noStroke();
  for (let wave of waves) {
    fill(100, 150, 255, 100);  // 淺藍色半透明
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x += 20) {
      let y = wave.y + sin(x * 0.02 + wave.offset) * wave.amplitude;
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);
    wave.offset += wave.speed;
  }
}

// ---------------------------------
// 遊戲流程函數
// ---------------------------------

// 1. 處理CSV資料
function processData() {
  // 遍歷 CSV 的每一行
  for (let row of questionTable.getRows()) {
    allQuestions.push({
      question: row.getString(0),
      opA: row.getString(1),
      opB: row.getString(2),
      opC: row.getString(3),
      opD: row.getString(4),
      correct: row.getString(5) // 儲存 'A', 'B', 'C', or 'D'
    });
  }
}

// 2. 設定按鈕位置
function setupButtons() {
  // 開始按鈕
  startButton = { x: width / 2 - 100, y: height / 2 + 50, w: 200, h: 60, text: '開始測驗' };
  // 重新開始按鈕
  restartButton = { x: width / 2 - 100, y: height / 2 + 150, w: 200, h: 60, text: '重新開始' };

  // 四個答案按鈕
  let btnW = 350;
  let btnH = 80;
  let gap = 20;
  answerButtons.push({ x: 40, y: 250, w: btnW, h: btnH, option: 'A' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250, w: btnW, h: btnH, option: 'B' });
  answerButtons.push({ x: 40, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'C' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'D' });
}

// 3. 開始或重新開始遊戲
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  // 隨機排序所有問題，並取出3題
  quizQuestions = shuffle(allQuestions).slice(0, 3); // 這裡維持3題不變，因為題庫總共就3題
  gameState = 'START';
}

// 4. 檢查答案
function checkAnswer(selectedOption) {
  let currentQuestion = quizQuestions[currentQuestionIndex];
  let isCorrect = selectedOption === currentQuestion.answer;
  
  feedbackMessage = isCorrect ? '答對了！' : '答錯了！';
  feedbackColor = isCorrect ? color(76, 175, 80) : color(244, 67, 54);
  
  if (isCorrect) {
    score++;
  }
  
  gameState = 'FEEDBACK';
  feedbackTimer = 30; // 設定為 30 幀（約 0.5 秒）
}

// 5. 進入下一題
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizQuestions.length) {
    gameState = 'RESULT';
  } else {
    gameState = 'QUESTION';
  }
}

// 6. 取得回饋用語
function getFeedbackText() {
  if (score === 3) return '太厲害了!全部答對！';
  if (score >= 1) return '加油!再試一次吧！';
  return '沒事的!再試一次吧！';
}

// ---------------------------------
// 畫面繪製函數
// ---------------------------------

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(20, 40, 80); // 深藍色文字
  textSize(48);
  text('p5.js 題庫測驗', width / 2, height / 2 - 50);
  
  // 繪製開始按鈕
  drawButton(startButton);
}

function drawQuestionScreen() {
  if (quizQuestions.length === 0) return;
  
  let q = quizQuestions[currentQuestionIndex];
  
  // 繪製問題
  textAlign(LEFT, TOP);
  fill(255);
  textSize(28);
  text(`第 ${currentQuestionIndex + 1} 題 / 3 題`, 40, 40);
  text(q.question, 40, 100, width - 80, 150); // 自動換行
  
  // 更新並繪製答案按鈕
  answerButtons[0].text = 'A. ' + q.opA;
  answerButtons[1].text = 'B. ' + q.opB;
  answerButtons[2].text = 'C. ' + q.opC;
  answerButtons[3].text = 'D. ' + q.opD;
  
  for (let btn of answerButtons) {
    drawButton(btn);
  }
}

function drawFeedbackScreen() {
  // 淺藍色背景
  background(176, 226, 255);

  // 在中心位置繪製答對/答錯符號
  let centerX = width / 2;
  let centerY = height / 2;
  let size = 150;
  
  if (feedbackMessage.includes('答對')) {
    push();
    noFill();
    stroke(76, 175, 80);
    strokeWeight(15);
    ellipse(centerX, centerY, size);
    pop();
  } else {
    push();
    stroke(244, 67, 54);
    strokeWeight(15);
    line(centerX - size/2, centerY - size/2, centerX + size/2, centerY + size/2);
    line(centerX + size/2, centerY - size/2, centerX - size/2, centerY + size/2);
    pop();
  }
  
  // 顯示回饋文字
  textAlign(CENTER, CENTER);
  fill(50);
  textSize(36);
  text(feedbackMessage, width / 2, height / 2 + 100);
  
  // 計時器倒數並切換到下一題
  feedbackTimer--;
  if (feedbackTimer <= 0) {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      gameState = 'QUESTION';
    } else {
      gameState = 'RESULT';
    }
  }
}

function drawResultScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  
  textSize(50);
  text('測驗結束！', width / 2, 150);
  
  textSize(36);
  text(`你的成績: ${score} / 3`, width / 2, 250);
  
  textSize(24);
  fill(147, 112, 219); // 改為紫色 (使用淺紫色)
  text(getFeedbackText(), width / 2, 350);
  
  // 繪製重新開始按鈕
  drawButton(restartButton);
}

// ---------------------------------
// 互動與輔助函數
// ---------------------------------

// 繪製按鈕 (含 hover 效果)
function drawButton(btn) {
  let isHover = isMouseOver(btn);
  
  push(); // 保存繪圖狀態
  if (isHover) {
    fill(100, 180, 255); // hover 亮藍色
    stroke(255);
    strokeWeight(2);
    cursor(HAND); // 改變滑鼠游標
  } else {
    fill(50, 100, 200, 200); // 預設藍色
    noStroke();
  }
  rect(btn.x, btn.y, btn.w, btn.h, 10); // 圓角矩形
  
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(btn.text, btn.x, btn.y, btn.w, btn.h); // 按鈕文字
  pop(); // 恢復繪圖狀態
}

// 檢查滑鼠是否在按鈕上
function isMouseOver(btn) {
  return (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h);
}

// 滑鼠點擊事件
function mousePressed() {
  // 重設游標
  cursor(ARROW);

  if (gameState === 'START') {
    if (isMouseOver(startButton)) {
      gameState = 'QUESTION';
    }
  } else if (gameState === 'QUESTION') {
    for (let btn of answerButtons) {
      if (isMouseOver(btn)) {
        checkAnswer(btn.option);
        break; // 點擊後就停止檢查
      }
    }
  } else if (gameState === 'RESULT') {
    if (isMouseOver(restartButton)) {
      startGame();
    }
  }
}

// ---------------------------------
// 互動視覺效果 (背景粒子)
// ---------------------------------

function setupParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      r: random(2, 5),
      alpha: random(50, 150)
    });
  }
}

function drawParticles() {
  for (let p of particles) {
    // 更新位置
    p.x += p.vx;
    p.y += p.vy;
    
    // 邊界環繞
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // 繪製
    noStroke();
    fill(255, p.alpha);
    ellipse(p.x, p.y, p.r);
  }
}