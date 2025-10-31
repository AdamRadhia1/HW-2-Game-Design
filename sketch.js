/* =========================
   GHOST RUNNER — p5.js
   ========================= */

let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameOver = false;
let paused = false;
let startSequence = true;

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

let soundReadyShown = false;
const soundHintEl = () => document.getElementById('soundHint');

function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

function setup() {
  createCanvas(800, 600);

  player = new Ball(width/2, height - 100);
  road   = new Road();

  // sky elements
  for (let i = 0; i < 6; i++) {
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));
  }
  for (let i = 0; i < 120; i++) {
    stars.push(createVector(random(width), random(height/2), random(1,3)));
  }

  // any click on the page can resume audio if the browser blocked it
  document.body.addEventListener('pointerdown', tryEnableAudio, { once:false });

  startTimeMs = millis();
}

function draw() {
  // 60s total cycle: 0-30 day->night, 30-60 night->day
  const cycleTime = 60000.0;
  const t = (millis() - startTimeMs) % cycleTime;
  nightFade = (t < 30000) ? map(t, 0, 30000, 0, 1) : map(t, 30000, 60000, 1, 0);

  // sky
  const r = lerp(233, 40, nightFade);
  const g = lerp(215, 30, nightFade);
  const b = lerp(255, 60, nightFade);
  background(r, g, b);

  drawStars();
  drawClouds();

  // PAUSE — freeze visual frame exactly
  if (paused && !gameOver && !startSequence) {
    road.display();
    noStroke(); fill(255);
    for (let o of obstacles) ellipse(o.x, o.y, 30, 30);
    player.display();
    drawHud();
    drawPausedOverlay();
    return;
  }

  // subtle camera shake on collision
  let shakeX = 0, shakeY = 0;
  if (shakeTimer > 0) { shakeX = random(-5,5); shakeY = random(-5,5); shakeTimer--; }
  push(); translate(shakeX, shakeY);

  if (!gameOver) {
    road.update(nightFade > 0.4);
    road.display();

    if (!startSequence) {
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
      for (let i = obstacles.length-1; i >= 0; i--) {
        const o = obstacles[i];
        o.y += speed;
        ellipse(o.x, o.y, 30, 30);
        if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15) {
          triggerMJ();
        }
        if (o.y > height + 20) obstacles.splice(i,1);
      }

      // score + milestone pop
      score++;
      if (score >= nextMilestone) {
        player.showMilestone("GOOD JOB!");
        nextMilestone += 20;
      }
    }

    player.update(road);  // constrain to road
    player.display();

    drawHud();

  } else {
    drawGameOver();
  }

  // COUNTDOWN overlay ON TOP of current frame
  if (startSequence) drawCountdown();

  // one-time screen flash on collision
  if (flashAlpha > 0) {
    noStroke(); fill(255,120,0,flashAlpha);
    rect(0, 0, width, height);
    flashAlpha -= 10;
  }

  pop(); // end shake
}

function drawHud() {
  // score (hide during countdown)
  if (!startSequence) {
    fill(255); noStroke();
    textAlign(LEFT, TOP);
    textSize(24);
    text("Score: " + score, 20, 16);
  }
}

function drawPausedOverlay() {
  fill(0, 140);
  rect(0,0,width,height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("PAUSED", width/2, height/2 - 10);
  textSize(18);
  text("Press SPACE to Resume", width/2, height/2 + 24);
}

function drawCountdown() {
  // classic big numbers 5..1..GO
  const secs = int((millis() - startTimeMs) / 1000);
  if (secs > lastSecond) { lastSecond = secs; countdown--; }

  fill(255); noStroke();
  textAlign(CENTER, CENTER);
  textSize(64);
  if (countdown > 0) {
    text(countdown, width/2, height/2 - 40);
  } else {
    text("GO!", width/2, height/2 - 40);
    // start music as soon as countdown finishes
    safeStartMusic();
    // let GO! show for ~0.5s, then clear startSequence
    if ((millis() - startTimeMs) > 1000 * (lastSecond + 0.5)) {
      startSequence = false;
    }
  }
}

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

function drawGameOver() {
  // slow fade to black
  fadeAlpha = min(255, fadeAlpha + 6);
  noStroke(); fill(0, fadeAlpha);
  rect(0,0,width,height);

  // MJ fade in
  const mjAlpha = map(fadeAlpha, 80, 255, 0, 255);
  if (mjImg) {
    tint(255, mjAlpha);
    const w = width * 0.8, h = w * (mjImg.height / mjImg.width);
    image(mjImg, (width - w)/2, (height - h)/2, w, h);
    noTint();
  }

  if (!mjStarted) {
    if (laughSfx && laughSfx.isLoaded()) laughSfx.play();
    mjStarted = true;
  }

  if ((!laughSfx || !laughSfx.isPlaying()) && fadeAlpha >= 255) {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Happy Halloween, try again!", width/2, height/2 + 40);
    textSize(20);
    text("Press SPACE to Restart", width/2, height/2 + 70);
  }
}

function triggerMJ() {
  gameOver = true;
  shakeTimer = 25;
  flashAlpha = 180;
  fadeAlpha = 0;

  // softly duck bg music to make the laugh pop
  if (bgMusic && bgMusic.isPlaying()) bgMusic.setVolume(0.12, 0.3);
}

function keyPressed() {
  if (key === ' ') {
    if (gameOver) resetGame();
    else if (!startSequence) paused = !paused;
  }
}

function resetGame() {
  gameOver = false;
  paused = false;
  startSequence = true;

  countdown = 5;
  lastSecond = 0;

  distance = 0;
  score = 0;
  nextMilestone = 20;
  obstacles.length = 0;

  player.pos.set(width/2, height - 100);
  player.resetBounce();

  mjStarted = false;
  fadeAlpha = 0;
  startTimeMs = millis();
  nightFade = 0;

  // restore bg music volume on new run (will start after countdown)
  if (bgMusic) bgMusic.setVolume(0.35);
}

/* --------- audio helpers --------- */

function tryEnableAudio() {
  // ensure audio context is running
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  // if a hint is visible, hide it after user interaction
  const el = soundHintEl();
  if (el) el.style.display = 'none';
}

function safeStartMusic() {
  if (!bgMusic || !bgMusic.isLoaded()) return;

  // Some browsers block autoplay unless user interacts first
  if (getAudioContext().state !== 'running') {
    // show unobtrusive hint
    const el = soundHintEl();
    if (el && !soundReadyShown) {
      soundReadyShown = true;
      el.style.display = 'inline-block';
      el.onclick = () => {
        tryEnableAudio();
        if (!bgMusic.isPlaying()) { bgMusic.setVolume(0.35); bgMusic.loop(); }
        el.style.display = 'none';
      };
    }
    return;
  }

  // audio context OK — start/loop music
  if (!bgMusic.isPlaying()) {
    bgMusic.setVolume(0.35);
    bgMusic.loop();
  }
}

/* --------- little cloud class --------- */
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
