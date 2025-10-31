/* =========================
   Ghost Runner — p5.js
========================= */

let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameState = "start"; // start → countdown → play → pause → gameover

// countdown
let countdownStart = 0;  // millis() when countdown begins
const COUNT_FROM = 5;

// music
let bgMusic, laughSfx, mjImg;
let musicTargetVol = 0.35; // final bg volume
let musicVol = 0;          // current animated volume

// visuals
let nightFade = 0;
let score = 0;
let milestoneStep = 50;    // show GOOD JOB! at 50, 100, 150, ...
let nextMilestone = milestoneStep;

let flashAlpha = 0;
let shakeTimer = 0;
let fadeAlpha = 0;
let mjStarted = false;

let clouds = [];
let stars = [];

function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  player = new Ball(width/2, height - 120);
  road   = new Road();

  // sky
  for (let i = 0; i < 6; i++) {
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));
  }
  for (let i = 0; i < 120; i++) {
    stars.push(createVector(random(width), random(height/2), random(1,3)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  road = new Road();                   // recompute margins and house positions
  player.pos.set(width/2, height-120); // keep player on road
}

/* ---------- MAIN DRAW ---------- */
function draw() {
  // day/night loop (60s)
  const cycle = 60000;
  const t = millis() % cycle;
  nightFade = (t < 30000) ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);

  // sky
  background(lerp(233,40,nightFade), lerp(215,30,nightFade), lerp(255,60,nightFade));
  drawStars();
  drawClouds(); // always behind road/houses

  if (gameState === "start") { drawStartScreen(); return; }
  if (gameState === "countdown") { drawWorld(); drawCountdown(); return; }
  if (gameState === "play") { playWorld(); return; }
  if (gameState === "pause") { drawWorld(true); drawPauseOverlay(); return; }
  if (gameState === "gameover") { drawWorld(true); drawGameOver(); return; }
}

/* ---------- WORLD RENDER (road, houses, obstacles, player, HUD) ---------- */
function drawWorld(freeze=false) {
  // update scrolling only if not freezing
  if (!freeze) {
    road.update();
  }
  road.display(); // road + houses + bubbles (bubbles now clamped and de-overlapped)

  // obstacles
  if (!freeze && gameState === "play") {
    distance += speed * 0.1;
    speed = baseSpeed + distance / 300.0;
    spawnRate = max(10, int(60 - distance/30));

    if (frameCount % spawnRate === 0) {
      obstacles.push(createVector(random(road.leftGutterX + 6, road.rightGutterX - 6), -20));
    }
  }

  // draw & move obstacles
  fill(255); noStroke();
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    if (!freeze) o.y += speed;
    ellipse(o.x, o.y, 30, 30);

    if (!freeze && gameState === "play") {
      if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15) {
        triggerMJ();
      }
      if (o.y > height + 20) obstacles.splice(i, 1);
    }
  }

  // player
  if (!freeze) player.update(road);
  player.display();

  // HUD (score)
  if (gameState !== "countdown") {
    fill(255); noStroke();
    textAlign(LEFT, TOP);
    textSize(24);
    text("Score: " + score, 20, 16);
  }
}

/* ---------- GAME LOOP (play state) ---------- */
function playWorld() {
  // subtle camera shake when needed
  let shakeX = 0, shakeY = 0;
  if (shakeTimer > 0) { shakeX = random(-5,5); shakeY = random(-5,5); shakeTimer--; }
  push(); translate(shakeX, shakeY);

  drawWorld(false);

  // scoring + milestone
  score++;
  if (score >= nextMilestone) {
    player.showMilestone("GOOD JOB!");
    nextMilestone += milestoneStep;
  }

  // flash effect
  if (flashAlpha > 0) {
    noStroke(); fill(255,120,0,flashAlpha);
    rect(0, 0, width, height);
    flashAlpha -= 10;
  }

  pop();
}

/* ---------- COUNTDOWN ---------- */
function drawCountdown() {
  // music fade-in during countdown
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.setVolume(0);
    bgMusic.loop();
    musicVol = 0;
  }
  if (musicVol < musicTargetVol) {
    musicVol += 0.01;
    bgMusic.setVolume(min(musicVol, musicTargetVol));
  }

  const elapsed = floor((millis() - countdownStart)/1000);
  const n = COUNT_FROM - elapsed;

  // countdown numerals
  fill(255); noStroke();
  textAlign(CENTER, CENTER);
  textSize(64);
  text(n > 0 ? n : "GO!", width/2, height/2);

  if (elapsed > COUNT_FROM) {
    gameState = "play";
  }
}

/* ---------- START SCREEN ---------- */
function drawStartScreen() {
  fill(255); noStroke();
  textAlign(CENTER, CENTER);

  textSize(40);
  text("Ghost Runner", width/2, height/2 - 80);

  textSize(18);
  const rules =
`Move left/right: mouse (desktop) or finger (mobile)
Avoid the white dots
Pause/Resume: Space (desktop) or Tap (mobile)
Restart after crash: Space (desktop) or Tap (mobile)

Press SPACE or TAP to start`;
  text(rules, width/2, height/2 + 20);
}

/* ---------- PAUSE OVERLAY ---------- */
function drawPauseOverlay() {
  fill(0, 140);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("PAUSED", width/2, height/2 - 10);
  textSize(18);
  text("Press SPACE or TAP to Resume", width/2, height/2 + 24);
}

/* ---------- GAMEOVER (MJ SEQUENCE) ---------- */
function drawGameOver() {
  // fade to black
  fadeAlpha = min(255, fadeAlpha + 6);
  noStroke(); fill(0, fadeAlpha);
  rect(0,0,width,height);

  // MJ fade in
  const a = map(fadeAlpha, 80, 255, 0, 255);
  if (mjImg) {
    tint(255, a);
    const w = width * 0.8, h = w * (mjImg.height / mjImg.width);
    image(mjImg, (width - w)/2, (height - h)/2, w, h);
    noTint();
  }

  // laugh (once)
  if (!mjStarted) { if (laughSfx) laughSfx.play(); mjStarted = true; }

  // show prompt earlier (don’t wait to the very end)
  if (fadeAlpha >= 120) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Happy Halloween, try again!", width/2, height/2 + 40);
    textSize(20);
    text("Press SPACE or TAP", width/2, height/2 + 80);
  }
}

/* ---------- EVENTS ---------- */
function triggerMJ() {
  gameState = "gameover";
  fadeAlpha = 0;
  mjStarted = false;
  shakeTimer = 25;
  flashAlpha = 180;
  if (bgMusic && bgMusic.isPlaying()) bgMusic.setVolume(0.12, 0.3); // soft duck
}

function startCountdown() {
  // start/resume audio context on user gesture (mobile)
  try { userStartAudio(); } catch(e) {}
  countdownStart = millis();
  musicVol = 0;
  gameState = "countdown";
}

function resetGameToStart() {
  // restore world
  distance = 0;
  speed = baseSpeed;
  score = 0;
  nextMilestone = milestoneStep;
  obstacles.length = 0;
  player.pos.set(width/2, height - 120);
  player.resetBounce();

  // reset fades
  fadeAlpha = 0;
  flashAlpha = 0;
  mjStarted = false;

  // back to rules screen
  gameState = "start";
}

function keyPressed() {
  if (key === ' ') {
    if (gameState === "start") startCountdown();
    else if (gameState === "countdown") { /* ignore */ }
    else if (gameState === "play") gameState = "pause";
    else if (gameState === "pause") gameState = "play";
    else if (gameState === "gameover") resetGameToStart(), startCountdown();
  }
}

function touchStarted() {
  // treat tap as same as SPACE behavior
  if (gameState === "start") startCountdown();
  else if (gameState === "countdown") { /* ignore during countdown */ }
  else if (gameState === "play") gameState = "pause";
  else if (gameState === "pause") gameState = "play";
  else if (gameState === "gameover") resetGameToStart(), startCountdown();
  return false; // prevent default
}

/* ---------- STARS & CLOUDS ---------- */
function drawStars() {
  if (nightFade > 0.3) {
    const a = map(nightFade, 0.3, 1, 0, 255);
    noStroke(); fill(255, a);
    for (let s of stars) circle(s.x, s.y, s.z);
  }
}
function drawClouds() {
  if (nightFade < 0.8) {
    for (let c of clouds) { c.update(); c.display(); }
  }
}

/* little cloud */
class Cloud {
  constructor(x, y, s) { this.x=x; this.y=y; this.s=s; }
  update() {
    this.x += 0.3 * this.s;
    if (this.x > width + 80) { this.x = -80; this.y = random(50, 250); }
  }
  display() {
    noStroke(); fill(255, 230);
    ellipse(this.x, this.y, 60, 40);
    ellipse(this.x + 25, this.y + 5, 50, 30);
    ellipse(this.x - 25, this.y + 5, 50, 30);
  }
}









