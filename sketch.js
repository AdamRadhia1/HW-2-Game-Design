// =====================
// 🎃 GHOST RUNNER GAME
// =====================

// Audio
let bgMusic, laughSfx;

// Game objects
let player;
let road;
let obstacles = [];

// Game state
let gameStarted = false;
let countdown = 5;
let gameOver = false;
let paused = false;

// Progress
let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let score = 0;

// Darkness cycle
let nightFade = 0;
let nightTimer = 0;

// MJ jumpscare
let mjImg;
let fadeAlpha = 0;
let mjStarted = false;

// Touch control memory
let touchXPos = null;

function preload() {
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx = loadSound("assets/Mojo jojo.mp3");
  mjImg = loadImage("assets/Michael Jackson Thriller.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  road = new Road();
  player = new Ball(width/2, height - 120);

  textFont("Arial");

  setInterval(() => {
    if (!gameStarted && countdown > 0) countdown--;
  }, 1000);
}

function startGameMusic() {
  if (!bgMusic.isPlaying()) {
    bgMusic.setVolume(0);
    bgMusic.loop();
    let v = 0;
    let fade = setInterval(() => {
      v += 0.03;
      bgMusic.setVolume(v);
      if (v >= 1) clearInterval(fade);
    }, 80);
  }
}

function draw() {

  // ==============
  // COUNTDOWN SCREEN
  // ==============
  if (!gameStarted) {
    background(50);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(60);
    if (countdown > 0) {
      text(countdown, width/2, height/2);
    } else {
      text("GO!", width/2, height/2);
      startGameMusic();
      setTimeout(() => { gameStarted = true; }, 600);
    }
    return;
  }

  // Pause
  if (paused && !gameOver) {
    drawPausedScreen();
    return;
  }

  // Game Background + Night Cycle
  nightTimer += deltaTime / 1000;
  nightFade = (sin(nightTimer * 0.4) + 1) / 2; // smooth fade in/out
  background(170 * (1-nightFade), 150 * (1-nightFade), 200);

  road.update();
  road.display();

  updateObstacles();
  drawObstacles();

  player.update();
  glowGhost();
  player.display();

  drawHUD();

  if (gameOver) drawGameOverScreen();
}

function drawHUD() {
  fill(255);
  textSize(22);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);

  // GOOD JOB milestone every +20 points
  if (score > 0 && score % 20 === 0) {
    textAlign(CENTER);
    fill(255, 215, 0);
    textSize(28);
    text("GOOD JOB!", width/2, player.pos.y - 80);
  }
}

function updateObstacles() {
  if (gameOver) return;

  distance += speed * 0.1;
  speed = baseSpeed + distance / 300;
  let spawnRate = max(12, 60 - distance / 30);

  if (frameCount % int(spawnRate) === 0) {
    obstacles.push(createVector(random(road.leftGutterX + 10, road.rightGutterX - 10), -20));
  }
}

function drawObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.y += speed;

    fill(0);
    ellipse(o.x, o.y, 30, 30);

    if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius*0.6 + 15) {
      triggerMJ();
    }

    if (o.y > height + 40) obstacles.splice(i, 1);
  }
}

function glowGhost() {
  if (nightFade > 0.6) {
    push();
    noStroke();
    fill(255, 255, 255, 120 * nightFade);
    ellipse(player.pos.x, player.pos.y, player.radius*2);
    pop();
  }
}

// =============
// PAUSE
// =============

function drawPausedScreen() {
  road.display();
  drawObstacles();
  player.display();
  fill(255);
  textSize(40);
  textAlign(CENTER,CENTER);
  text("PAUSED", width/2, height/2 - 20);
  textSize(20);
  text("Press SPACE to Resume", width/2, height/2 + 20);
}

// =============
// MJ JUMPSCARE
// =============

function triggerMJ() {
  if (gameOver) return;
  gameOver = true;
  obstacles = [];
  fadeAlpha = 0;
  mjStarted = false;
}

function drawGameOverScreen() {

  fadeAlpha += 5;
  fill(0, fadeAlpha);
  rect(0,0,width,height);

  if (!mjStarted) {
    laughSfx.play();
    mjStarted = true;
  }

  if (mjImg) {
    push();
    tint(255, map(fadeAlpha, 80, 255, 0, 255, true));
    let w = width * 0.8;
    let h = w * (mjImg.height / mjImg.width);
    image(mjImg, width/2 - w/2, height/2 - h/2, w, h);
    pop();
  }

  if (fadeAlpha > 255) {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Happy Halloween, Try Again!", width/2, height/2 + 40);
    textSize(20);
    text("Press SPACE to Restart", width/2, height/2 + 80);
  }
}

// =============
// CONTROLS
// =============

function keyPressed() {
  if (key === ' ') {
    if (gameOver) resetGame();
    else paused = !paused;
  }
}

function touchStarted() {
  if (!gameStarted && countdown <= 0) startGameMusic();
  if (gameOver) { resetGame(); return; }
  paused = !paused;
}

function mouseMoved() { touchXPos = mouseX; }
function touchMoved() {
  if (touches.length > 0) player.pos.x = touches[0].x;
}

// =============
// RESET
// =============

function resetGame() {
  gameOver = false;
  paused = false;
  score = 0;
  distance = 0;
  speed = baseSpeed;
  obstacles = [];
  fadeAlpha = 0;
  nightTimer = 0;
  mjStarted = false;
  player.pos = createVector(width/2, height - 120);
}
