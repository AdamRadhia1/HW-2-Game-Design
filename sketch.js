/* =========================
   GHOST RUNNER — p5.js
========================= */

let player, road, obstacles = [];
let baseSpeed = 5, speed = baseSpeed;
let distance = 0, spawnRate = 60;

let gameOver = false, paused = false, startSequence = true;
let countdown = 5, lastSecond = 0, startTimeMs = 0;
let nightFade = 0, score = 0, nextMilestone = 20;
let flashAlpha = 0, shakeTimer = 0, fadeAlpha = 0, mjStarted = false;

let clouds = [], stars = [];
let bgMusic, laughSfx, mjImg;
let soundReadyShown = false;
const soundHintEl = () => document.getElementById('soundHint');

/* ---------- preload assets ---------- */
function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

/* ---------- setup ---------- */
function setup() {
  resizeCanvasAuto();
  player = new Ball(width/2, height - 100);
  road   = new Road();

  for (let i = 0; i < 6; i++) clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));
  for (let i = 0; i < 120; i++) stars.push(createVector(random(width), random(height/2), random(1,3)));

  document.body.addEventListener("pointerdown", tryEnableAudio);
  startTimeMs = millis();
}

/* ---------- responsive canvas ---------- */
function windowResized() { resizeCanvasAuto(); }
function resizeCanvasAuto() {
  const w = min(windowWidth, 800);
  const h = min(windowHeight, 600);
  createCanvas(w, h);
}

/* ---------- draw loop ---------- */
function draw() {
  updateDayNight();

  if (paused && !gameOver && !startSequence) return drawPauseFrame();

  push();
  cameraShake();

  if (!gameOver) {
    road.update(nightFade > 0.4);
    road.display();

    if (!startSequence) runGameLogic();
    player.update(road);
    player.display();
    drawHud();
  } else drawGameOver();

  if (startSequence) drawCountdown();
  screenFlash();

  pop();
}

/* ---------- core game logic ---------- */
function runGameLogic() {
  distance += speed * 0.1;
  speed = baseSpeed + distance / 300.0;
  spawnRate = int(60 - min(distance / 30.0, 40));

  if (frameCount % max(spawnRate, 10) === 0) {
    obstacles.push(createVector(random(road.leftGutterX+6, road.rightGutterX-6), -20));
  }

  noStroke(); fill(255);
  for (let i = obstacles.length-1; i >= 0; i--) {
    const o = obstacles[i];
    o.y += speed;
    ellipse(o.x, o.y, 30, 30);
    if (dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15) triggerMJ();
    if (o.y > height + 20) obstacles.splice(i,1);
  }

  score++;
  if (score >= nextMilestone) {
    player.showMilestone("GOOD JOB!");
    nextMilestone += 20;
  }
}

/* ---------- countdown ---------- */
function drawCountdown() {
  const secs = int((millis() - startTimeMs) / 1000);
  if (secs > lastSecond) { lastSecond = secs; countdown--; }

  fill(255); noStroke();
  textAlign(CENTER, CENTER);
  textSize(64);
  if (countdown > 0) {
    // fade in music DURING countdown
    safeStartMusic();
    bgMusic.setVolume(map(countdown,5,0,0,0.35));
    text(countdown, width/2, height/2 - 40);
  } else {
    text("GO!", width/2, height/2 - 40);
    setTimeout(()=> startSequence = false, 500);
  }
}

/* ---------- audio ---------- */
function tryEnableAudio() {
  if (getAudioContext().state !== "running") getAudioContext().resume();
  soundHintEl().style.display = "none";
}

function safeStartMusic() {
  if (!bgMusic || !bgMusic.isLoaded()) return;

  if (getAudioContext().state !== "running") {
    if (!soundReadyShown) {
      soundReadyShown = true;
      const el = soundHintEl();
      el.style.display = "inline-block";
      el.onclick = () => {
        tryEnableAudio();
        if (!bgMusic.isPlaying()) bgMusic.loop();
        el.style.display = "none";
      };
    }
    return;
  }

  if (!bgMusic.isPlaying()) {
    bgMusic.setVolume(0);
    bgMusic.loop();
  }
}

/* ---------- mobile control ---------- */
function touchMoved() {
  player.pos.x = mouseX;
  return false;
}

/* ---------- collision logic ---------- */
function triggerMJ() {
  gameOver = true;
  shakeTimer = 25;
  flashAlpha = 180;
  fadeAlpha = 0;
  if (bgMusic.isPlaying()) bgMusic.setVolume(0.12, 0.3);
}

/* ---------- reset ---------- */
function keyPressed() {
  if (key === " ") {
    if (gameOver) resetGame();
    else if (!startSequence) paused = !paused;
  }
}

function resetGame() {
  gameOver = false;
  paused = false;
  startSequence = true;
  countdown = 5; lastSecond = 0;
  distance = 0; score = 0; nextMilestone = 20;
  obstacles.length = 0;
  player.pos.set(width/2, height - 100);
  player.resetBounce(); mjStarted = false; fadeAlpha = 0;
  startTimeMs = millis(); nightFade = 0;
  if (bgMusic) bgMusic.setVolume(0.35);
}


