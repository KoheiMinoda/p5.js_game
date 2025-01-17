// ===================== ゲーム状態 =====================
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

// ===================== カウントダウン管理用変数 =====================
let countdownValue = 5;
let lastCountdownTime = 0;

// ===================== ゲームプレイ管理用変数 =====================
const LIMIT_TIME = 15;
let startTime = 0;

// ===================== スコア・図形管理用変数 =====================
let shapes = []; 
let score = 0; 

// ===================== p5.js の初期設定 =====================
function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(24);
}

// ===================== メインループ =====================
function draw() {
  background(220);

  if (isSelectingDifficulty) {
    fill(0);
    textSize(24);
    text("Select Difficulty\n1: Easy\n2: Medium\n3: Hard", width / 2, height / 2);
    return; 
  }

  if (isCountingDown) {
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
    return; 
  }

  if (isGameStarted && !isGameOver) {
    let elapsedTime = (millis() - startTime) / 1000; 
    let remainingTime = LIMIT_TIME - elapsedTime;

    fill(0);
    textSize(24);
    text(`Score: ${score}`, width - 100, 30);

    text(`Time: ${max(0, remainingTime.toFixed(1))}`, 100, 30);

    if (remainingTime <= 0) {
      isGameOver = true;
    }

    while (shapes.length < shapesOnScreen) {
      spawnShape();
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
      let s = shapes[i];
      drawShape(s);

      s.life--;
      if (s.life < 0) {
        shapes.splice(i, 1);
      }
    }
  }
  else if (isGameOver) {
    fill(0);
    textSize(32);
    text("GAME OVER!", width / 2, height / 2 - 30);
    textSize(24);
    text(`Your Score: ${score}`, width / 2, height / 2 + 10);
  }
}

// ===================== キーボード入力で難易度選択 =====================
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

// ===================== マウスを押したときの処理 =====================
function mousePressed() {
  if (isGameStarted && !isGameOver) {
    for (let i = shapes.length - 1; i >= 0; i--) {
      let s = shapes[i];
      if (hitTest(s, mouseX, mouseY)) {
        // 図形の種類によってスコア加算
        switch (s.shapeType) {
          case "circle":
            score += 3; // 円は3点
            break;
          case "triangle":
            score += 2; // 三角は2点
            break;
          case "square":
            score += 1; // 四角は1点
            break;
        }

        shapes.splice(i, 1);
        break;
      }
    }
  }
}

// ===================== 図形生成関数 =====================
function spawnShape() {
  let shapeType = random(["circle", "square", "triangle"]);
  let size = random(40, 60); 

  let shape = {
    x: random(50, width - 50),
    y: random(50, height - 50),
    size: size,
    color: color(random(255), random(255), random(255)),
    shapeType: shapeType,
    life: 120 
  };
  shapes.push(shape);
}

// ===================== 図形を描画する関数 =====================
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
