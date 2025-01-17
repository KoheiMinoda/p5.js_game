// ===================== グローバル変数 =====================
let isSelectingDifficulty = true; 
let isCountingDown = false;
let isGameStarted = false;
let isGameOver = false;

let difficultyLevel = null;
const difficultyShapes = {
  easy: 2,
  medium: 3,
  hard: 4
};
let shapesOnScreen = 2; 

let countdownValue = 5;
let lastCountdownTime = 0;

const LIMIT_TIME = 15;
let startTime = 0;

let shapes = []; 
let score = 0; 

// 難易度のテキストの座標管理用 (キャンバス中央付近)
let difficultyOptions = [
  { level: 'easy',   label: 'Easy',   x: 400, y: 270 },
  { level: 'medium', label: 'Medium', x: 400, y: 320 },
  { level: 'hard',   label: 'Hard',   x: 400, y: 370 }
];

// 「やり直す」ボタンの位置・サイズ
let replayBtnX, replayBtnY, replayBtnW, replayBtnH;

// ゲーム表示領域のマージン(余白)
const margin = 40;

// ===================== p5.js 初期設定 =====================
function setup() {
  createCanvas(800, 600);

  textAlign(CENTER, CENTER);
  textSize(24);

  replayBtnW = 120;
  replayBtnH = 40;
}

// ===================== メインループ =====================
function draw() {
  // 全体の背景は紺色
  background(0, 0, 128); // Navy

  // 中央付近に、水色のゲーム表示領域を描画
  noStroke();
  fill(200, 230, 255); // Water color
  rect(margin, margin, width - margin * 2, height - margin * 2);

  // 難易度選択画面
  if (isSelectingDifficulty) {
    drawDifficultySelection();
    return; 
  }

  // カウントダウン
  if (isCountingDown) {
    drawCountdown();
    return; 
  }

  // ゲームプレイ中
  if (isGameStarted && !isGameOver) {
    playGame();
  }
  // ゲームオーバー
  else if (isGameOver) {
    drawGameOver();
  }
}

// ===================== 難易度選択画面の描画 =====================
function drawDifficultySelection() {
  // 難易度選択時の文字は黒
  fill(0);
  textSize(32);
  text("Select Difficulty", width / 2, height / 2 - 100);

  textSize(24);
  difficultyOptions.forEach(opt => {
    fill(0);
    text(opt.label, opt.x, opt.y);
  });
}

// ===================== カウントダウンの描画 =====================
function drawCountdown() {
  // カウントダウン時の文字も黒
  fill(0);
  textSize(48);
  text(`Game starts in: ${countdownValue}`, width / 2, height / 2);

  if (millis() - lastCountdownTime >= 1000) {
    lastCountdownTime = millis();
    countdownValue--;
    if (countdownValue < 0) {
      isCountingDown = false;
      isGameStarted = true;
      startTime = millis(); 
    }
  }
}

// ===================== ゲームオーバー画面の描画 =====================
function drawGameOver() {
  fill(0);
  textSize(32);
  text("GAME OVER!", width / 2, height / 2 - 60);
  
  textSize(24);
  text(`Your Score: ${score}`, width / 2, height / 2);

  // 「やり直す」ボタンを描画
  replayBtnX = width / 2 - replayBtnW / 2;
  replayBtnY = height / 2 + 40;
  fill(180, 220, 240); // 水色系のボタン
  rect(replayBtnX, replayBtnY, replayBtnW, replayBtnH, 5); 
  fill(0);
  text("やり直す", replayBtnX + replayBtnW / 2, replayBtnY + replayBtnH / 2);
}

// ===================== ゲームプレイ処理 =====================
function playGame() {
  let elapsedTime = (millis() - startTime) / 1000; 
  let remainingTime = LIMIT_TIME - elapsedTime;

  // スコアと時間のみ白で表示
  fill(255);
  textSize(24);
  text(`Score: ${score}`, width - 100, 30);
  text(`Time: ${max(0, remainingTime.toFixed(1))}`, 100, 30);

  // 制限時間を過ぎたらゲームオーバー
  if (remainingTime <= 0) {
    isGameOver = true;
  }

  // 画面上の図形数が指定数より少なければ追加生成
  while (shapes.length < shapesOnScreen) {
    spawnShape();
  }

  // 図形を描画し、寿命が尽きたら消去
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    drawShape(s);
    s.life--;
    if (s.life < 0) {
      shapes.splice(i, 1);
    }
  }
}

// ===================== 図形生成関数 =====================
function spawnShape() {
  let shapeType = random(["circle", "square", "triangle"]);
  let size = random(70, 120); 

  // 濃いめの色をランダム生成 (例: 30〜120の範囲でダークトーン)
  let r = random(30, 120);
  let g = random(30, 120);
  let b = random(30, 120);

  // 中央の水色領域内 (margin内側) でスポーン
  let minX = margin + size / 2;
  let maxX = width - margin - size / 2;
  let minY = margin + size / 2;
  let maxY = height - margin - size / 2;

  let shape = {
    x: random(minX, maxX),
    y: random(minY, maxY),
    size: size,
    color: color(r, g, b),
    shapeType: shapeType,
    life: 120
  };
  shapes.push(shape);
}

// ===================== 図形描画関数 =====================
function drawShape(s) {
  push();
  noStroke();
  fill(s.color);

  switch (s.shapeType) {
    case "circle":
      ellipse(s.x, s.y, s.size);
      break;
    case "square":
      rectMode(CENTER);
      rect(s.x, s.y, s.size, s.size);
      break;
    case "triangle":
      let h = s.size * sqrt(3) / 2;
      triangle(
        s.x, s.y - h / 2,
        s.x - s.size / 2, s.y + h / 2,
        s.x + s.size / 2, s.y + h / 2
      );
      break;
  }
  pop();
}

// ===================== マウスクリック時の処理 =====================
function mousePressed() {
  // 難易度選択中ならテキスト当たり判定を確認
  if (isSelectingDifficulty) {
    textSize(24);
    difficultyOptions.forEach(opt => {
      let tw = textWidth(opt.label);
      let th = textAscent() + textDescent();
      let left   = opt.x - tw / 2;
      let right  = opt.x + tw / 2;
      let top    = opt.y - th / 2;
      let bottom = opt.y + th / 2;

      if (mouseX >= left && mouseX <= right &&
          mouseY >= top  && mouseY <= bottom) {
        difficultyLevel = opt.level;
        shapesOnScreen = difficultyShapes[opt.level];
        startCountdown();
      }
    });
    return;
  }

  // ゲームオーバー画面で「やり直す」ボタンをクリックしたか判定
  if (isGameOver) {
    if (mouseX >= replayBtnX && mouseX <= replayBtnX + replayBtnW &&
        mouseY >= replayBtnY && mouseY <= replayBtnY + replayBtnH) {
      resetGame();
      return;
    }
  }

  // ゲーム中のみ図形判定を行う
  if (isGameStarted && !isGameOver) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      let s = shapes[i];
      if (hitTest(s, mouseX, mouseY)) {
        // 図形の種類によってスコア加算
        switch (s.shapeType) {
          case "circle":
            score += 3;
            break;
          case "triangle":
            score += 2;
            break;
          case "square":
            score += 1;
            break;
        }
        shapes.splice(i, 1);
        break;
      }
    }
  }
}

// ===================== キー入力(数字)で難易度選択 =====================
function keyPressed() {
  if (isSelectingDifficulty) {
    if (key === '1') {
      difficultyLevel = 'easy';
      shapesOnScreen = difficultyShapes.easy; 
      startCountdown();
    } else if (key === '2') {
      difficultyLevel = 'medium';
      shapesOnScreen = difficultyShapes.medium;
      startCountdown();
    } else if (key === '3') {
      difficultyLevel = 'hard';
      shapesOnScreen = difficultyShapes.hard; 
      startCountdown();
    }
  }
}

// ===================== カウントダウン開始関数 =====================
function startCountdown() {
  isSelectingDifficulty = false;
  isCountingDown = true;
  countdownValue = 5;
  lastCountdownTime = millis();
}

// ===================== ゲーム初期状態に戻す関数 =====================
function resetGame() {
  isSelectingDifficulty = true;
  isCountingDown = false;
  isGameStarted = false;
  isGameOver = false;

  difficultyLevel = null;
  shapesOnScreen = 2;
  shapes = [];
  score = 0;
  countdownValue = 5;
  lastCountdownTime = 0;
}

// ===================== 図形へのクリック当たり判定 =====================
function hitTest(s, mx, my) {
  switch (s.shapeType) {
    case "circle":
      return dist(mx, my, s.x, s.y) < s.size / 2;
    case "square":
      let half = s.size / 2;
      return (mx > s.x - half && mx < s.x + half &&
              my > s.y - half && my < s.y + half);
    case "triangle":
      // 正三角形の外接円による簡易判定
      let dTri = dist(mx, my, s.x, s.y);
      let circumRadius = s.size / sqrt(3);
      return dTri < circumRadius;
  }
  return false;
}
