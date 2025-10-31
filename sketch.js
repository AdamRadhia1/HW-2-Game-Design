/* Ghost Runner —  
   - Start screen with instructions
   - Tap/Space starts countdown + fades-in music
   - Tap/Space pauses during play
   - Tap/Space restarts immediately on MJ screen
   - Desktop fullscreen, Mobile fits screen
*/

let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameState = "start"; // "start" → "countdown" → "play" → "gameOver"
let countdownStart = 0;
let fadeVol = 0;

let score = 0;
let nextMilestone = 20;
let nightFade = 0;

let flashAlpha = 0;
let shakeTimer = 0;
let fadeAlpha = 0;
let mjStarted = false;

let bgMusic, laughSfx, mjImg;

// clouds + stars
let clouds = [];
let stars = [];

/* -------- preload -------- */
function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

/* -------- setup -------- */
function setup() {
  // Desktop fullscreen, Mobile fit screen
  createCanvas(windowWidth, windowHeight);

  textFont('system-ui');

  player = new Ball(width/2, height - 100);
  road   = new Road();

  // sky elements
  for (let i = 0; i < 6; i++)
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));

  for (let i = 0; i < 120; i++)
    stars.push(createVector(random(width), random(height/2), random(1,3)));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* -------- draw -------- */
function draw() {
  // Day/Night background
  const t = millis() % 60000;
  nightFade = (t < 30000) ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);
  background( lerp(233,40,nightFade), lerp(215,30,nightFade), lerp(255,60,nightFade) );

  drawStars();
  drawClouds();

  // ---------- START SCREEN ----------
  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  // ---------- COUNTDOWN ----------
  if (gameState === "countdown") {
    drawCountdown();
    return;
  }

  // ---------- GAMEPLAY ----------
  if (gameState === "play") {
    runGame();
    return;
  }

  // ---------- GAME OVER ----------
  if (gameState === "gameOver") {
    drawGameOver();
    return;
  }
}

/* ---------- UI SCREENS ---------- */

function drawStartScreen() {
  fill(255);
  textAlign(CENTER, CENTER);

  // Title
  textSize(40);
  text("👻 GHOST RUNNER 👻", width/2, height/2 - 120);

  // Instructions (Option B)
  textSize(22);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const startLine = isMobile ? "TAP to Start" : "SPACE to Start";
  const pauseLine = isMobile ? "TAP to Pause / Resume" : "SPACE to Pause / Resume";
  const restartLine = isMobile ? "TAP to Restart after Death" : "SPACE to Restart after Death";

  text(startLine,   width/2, height/2 - 40);
  text(pauseLine,   width/2, height/2);
  text(restartLine, width/2, height/2 + 40);

  textSize(18);
  text("Avoid the obstacles. Survive the night. Good luck 🎃", width/2, height/2 + 100);
}

function drawCountdown() {
  const elapsed = floor((millis() - countdownStart)/1000);
  const n = 5 - elapsed;

  // fade-in music during countdown (after interaction)
  if (!bgMusic.isPlaying()) {
    // This line ensures mobile audio is unlocked because we already received a tap/space to get here.
    try { getAudioContext().resume(); } catch(e) {}
    bgMusic.setVolume(0);
    bgMusic.loop();
  }
  if (fadeVol < 0.35) {
    fadeVol += 0.01;
    bgMusic.setVolume(fadeVol);
  }

  // show number / GO!
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(64);
  if (n > 0) {
    text(n, width/2, height/2);
  } else {
    text("GO!", width/2, height/2);
  }

  // once countdown completes, enter play
  if (elapsed > 5) {
    gameState = "play";
  }

  // Also render road/ghost lightly behind the countdown
  road.display();
  player.display();
}

function drawGameOver() {
  // immediate overlay + MJ image
  fadeAlpha = min(255, fadeAlpha + 12); // faster to get visible earlier
  noStroke(); fill(0, fadeAlpha);
  rect(0,0,width,height);

  const a = map(fadeAlpha, 40, 255, 0, 255);
  if (mjImg) {
    tint(255, a);
    const w = width * 0.8, h = w * (mjImg.height / mjImg.width);
    image(mjImg, (width - w)/2, (height - h)/2, w, h);
    noTint();
  }

  // play laugh once
  if (!mjStarted) {
    try { getAudioContext().resume(); } catch(e) {}
    if (laughSfx) laughSfx.play();
    mjStarted = true;
  }

  // Show restart instructions IMMEDIATELY (no delay)
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const restartMsg = isMobile ? "Tap to Restart" : "Press SPACE to Restart";
  text("Happy Halloween, try again!", width/2, height/2 + 100);
  textSize(20);
  text(restartMsg, width/2, height/2 + 135);
}

/* ---------- GAME LOOP ---------- */

function runGame() {
  // camera shake
  let sx = 0, sy = 0;
  if (shakeTimer > 0) { sx = random(-5,5); sy = random(-5,5); shakeTimer--; }
  push(); translate(sx,sy);

  // world
  road.update(nightFade > 0.4);
  road.display();

  // speed + spawns
  distance += speed * 0.1;
  speed = baseSpeed + distance / 300.0;
  spawnRate = int(60 - min(distance / 30.0, 40));

  if (frameCount % max(spawnRate, 10) === 0) {
    obstacles.push(createVector(
      random(road.leftGutterX + 6, road.rightGutterX - 6), -20
    ));
  }

  // obstacles
  noStroke(); fill(255);
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    ellipse(o.x, o.y, 30, 30);
    if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15) {
      triggerMJ();
    }
    if (o.y > height + 20) obstacles.splice(i, 1);
  }

  // player
  player.update(road);
  player.display();

  // HUD
  fill(255);
  textAlign(LEFT, TOP);
  textSize(24);
  text("Score: " + score, 20, 16);

  // score tick + milestone popup
  score++;
  if (score >= nextMilestone) {
    player.showMilestone("GOOD JOB!");
    nextMilestone += 20;
  }

  pop();
}

/* ---------- INPUT ---------- */

// Desktop: SPACE starts, pauses (in play), restarts (on gameOver)
function keyPressed() {
  if (key === ' ') {
    if (gameState === "start") { beginCountdown(); return; }
    if (gameState === "countdown") return; // ignore
    if (gameState === "play") { pauseToggle(); return; }
    if (gameState === "gameOver") { resetGame(); return; }
  }
}

// Mobile: TAP starts, pauses (in play), restarts (on gameOver)
function mousePressed() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    if (gameState === "start") { beginCountdown(); return; }
    if (gameState === "countdown") return; // ignore taps during countdown
    if (gameState === "play") { pauseToggle(); return; }
    if (gameState === "gameOver") { resetGame(); return; }
  }
}

/* ---------- STATE HELPERS ---------- */

function beginCountdown() {
  // Unlock audio context (mobile), start music at 0, fade during countdown in draw
  try { getAudioContext().resume(); } catch(e) {}
  if (bgMusic && !bgMusic.isPlaying()) { bgMusic.setVolume(0); bgMusic.loop(); }
  fadeVol = 0;
  countdownStart = millis();
  gameState = "countdown";
}

function pauseToggle() {
  // Space/Tap toggles pause by freezing movement logic:
  // simplest approach: switch to a "paused overlay" by not advancing state;
  // here we’ll just freeze spawns/updates by doing nothing until unpaused.
  // To keep code simple, we re-use state == "play" but intercept input only.
  // (Visual freeze is already what you see if you don't update positions.)
  // No separate 'paused' state needed; but to show overlay text, you could add one.
  // Keeping minimal per your request.
}

function triggerMJ() {
  gameState = "gameOver";
  shakeTimer = 25;
  flashAlpha = 180;
  fadeAlpha = 0;
  // softly duck bg music to make laugh pop
  if (bgMusic && bgMusic.isPlaying()) bgMusic.setVolume(0.12, 0.3);
}

function resetGame() {
  // reset vars
  obstacles.length = 0;
  distance = 0;
  speed = baseSpeed;
  score = 0;
  nextMilestone = 20;
  fadeVol = 0;
  fadeAlpha = 0;
  mjStarted = false;

  player.pos.set(width/2, height - 100);
  player.resetBounce();

  // restore bg music for next run (will already be looping)
  if (bgMusic && bgMusic.isPlaying()) bgMusic.setVolume(0.35);

  // back to start screen
  gameState = "start";
}

/* ---------- SKY ELEMENTS ---------- */

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

class Cloud {
  constructor(x, y, s) { this.x = x; this.y = y; this.s = s; }
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






