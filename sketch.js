/* =========================
   GHOST RUNNER — SAFE FINAL VERSION
========================= */

let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameOver = false;
let paused = false;

// ✅ NEW: start screen before countdown
let gameStartPending = true; 
let startSequence = false;

let countdown = 5;
let lastSecond = 0;
let startTimeMs = 0;

let nightFade = 0;
let score = 0;
let nextMilestone = 20;
let flashAlpha = 0;
let shakeTimer = 0;
let fadeAlpha = 0;
let mjStarted = false;

let clouds = [];
let stars = [];

let bgMusic, laughSfx, mjImg;

function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

function setup() {
  if (!/Mobi|Android/i.test(navigator.userAgent)) fullscreen(true);

  createCanvas(windowWidth, windowHeight);

  player = new Ball(width/2, height - 100);
  road   = new Road();

  for (let i = 0; i < 6; i++) clouds.push(new Cloud(random(width), random(50, 250), random(.3, 1)));
  for (let i = 0; i < 120; i++) stars.push(createVector(random(width), random(height/2), random(1,3)));

  startTimeMs = millis();
}

function draw() {
  updateDayNight();

  // START SCREEN
  if (gameStartPending) {
    drawStartScreen();
    return;
  }

  // COUNTDOWN
  if (startSequence) {
    drawCountdownScreen();
    return;
  }

  if (paused && !gameOver) return drawPauseFrame();

  push();
  cameraShake();

  if (!gameOver) {
    gameLoop();
  } else {
    drawGameOver();
  }

  // Flash on collision
  if (flashAlpha > 0) {
    noStroke(); fill(255,120,0,flashAlpha);
    rect(0,0,width,height);
    flashAlpha -= 10;
  }

  pop();
}

/** ✅ START SCREEN **/
function drawStartScreen() {
  background(20);
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(36);

  if (/Mobi|Android/i.test(navigator.userAgent))
    text("Tap to Start", width/2, height/2);
  else
    text("Press SPACE to Start", width/2, height/2);
}

/** ✅ START GAME TRIGGER **/
function beginGame() {
  if (bgMusic && !bgMusic.isPlaying()) {
    if (getAudioContext().state !== "running") getAudioContext().resume();
    bgMusic.setVolume(0);
    bgMusic.loop();
  }
  gameStartPending = false;
  startSequence = true;
  startTimeMs = millis();
}

function touchStarted() { if (gameStartPending) beginGame(); }
function keyPressed() {
  if (gameStartPending && key === " ") beginGame();
  else if (gameOver && key === " ") resetGame();
  else if (!startSequence && key === " ") paused = !paused;
}

/** ✅ COUNTDOWN **/
function drawCountdownScreen() {
  updateDayNight();
  background(lerp(233,40,nightFade), lerp(215,30,nightFade), lerp(255,60,nightFade));

  drawStars(); drawClouds();
  road.display();
  player.display();

  let secs = int((millis() - startTimeMs) / 1000);
  if (secs > lastSecond) { lastSecond = secs; countdown--; }

  // fade in music
  if (bgMusic && bgMusic.isPlaying()) {
    bgMusic.setVolume(min(bgMusic.getVolume() + 0.015, 0.35));
  }

  fill(255);
  textAlign(CENTER,CENTER);
  textSize(64);
  if (countdown > 0) text(countdown, width/2, height/2);
  else {
    text("GO!", width/2, height/2);
    if (millis() - startTimeMs > (lastSecond + .5) * 1000) {
      startSequence = false;
    }
  }
}

/** ✅ ACTUAL GAME **/
function gameLoop() {
  road.update(nightFade > 0.4);
  road.display();

  distance += speed * .1;
  speed = baseSpeed + distance/300;
  spawnRate = int(60 - min(distance/30,40));

  if (frameCount % max(spawnRate,10) === 0)
    obstacles.push(createVector(random(road.leftGutterX+6, road.rightGutterX-6), -20));

  noStroke(); fill(255);
  for (let i = obstacles.length-1; i >= 0; i--) {
    let o = obstacles[i];
    o.y += speed;
    ellipse(o.x, o.y, 30,30);
    if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15) triggerMJ();
    if (o.y > height+20) obstacles.splice(i,1);
  }

  score++;
  if (score >= nextMilestone) {
    player.showMilestone("GOOD JOB!");
    nextMilestone += 20;
  }

  player.update(road);
  player.display();

  drawHud();
}

/** ✅ RESET **/
function resetGame() {
  gameOver=false; paused=false;
  countdown=5; lastSecond=0;
  distance=0; score=0; nextMilestone=20;
  obstacles.length=0;
  player.pos.set(width/2,height-100);
  player.resetBounce();
  mjStarted=false; fadeAlpha=0;

  gameStartPending=true; startSequence=false;
}




