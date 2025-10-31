/* =========================
   Ghost Runner — p5.js
========================= */

let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameState = "start"; // start → countdown → play → gameover

let countdownStart = 0;
let fadeVol = 0;

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
  createCanvas(windowWidth, windowHeight);

  player = new Ball(width/2, height - 120);
  road = new Road();

  for (let i = 0; i < 6; i++) {
    clouds.push(new Cloud(random(width), random(50,250), random(0.3,1)));
  }
  for (let i = 0; i < 120; i++) {
    stars.push(createVector(random(width), random(height/2), random(1,3)));
  }
}

function draw() {
  const cycle = 60000;
  const t = millis() % cycle;
  nightFade = (t < 30000) ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);

  background(lerp(233,40,nightFade), lerp(215,30,nightFade), lerp(255,60,nightFade));

  drawStars();
  drawClouds();

  if (gameState === "start") return drawStartScreen();
  if (gameState === "countdown") return drawCountdown();
  if (gameState === "play") return gameLoop();
  if (gameState === "gameover") return drawGameOver();
}

/* ========== START SCREEN ========== */
function drawStartScreen() {
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(40);
  text("Ghost Runner 👻", width/2, height/2 - 60);
  textSize(20);
  text("Move mouse (desktop) or tilt/slide finger (mobile)\nAvoid the dots\n\nPress SPACE or TAP to start", width/2, height/2 + 20);
}

/* ========== COUNTDOWN ========== */
function drawCountdown() {
  let elapsed = floor((millis() - countdownStart)/1000);
  let n = 5 - elapsed;

  road.update(nightFade > 0.4);
  road.display();
  player.update(road);
  player.display();
  drawStars();
  drawClouds();

  if (!bgMusic.isPlaying()) {
    bgMusic.setVolume(0);
    bgMusic.loop();
  }
  if (fadeVol < 0.35) {
    fadeVol += 0.01;
    bgMusic.setVolume(fadeVol);
  }

  fill(255);
  textAlign(CENTER,CENTER);
  textSize(64);
  text(n > 0 ? n : "GO!", width/2, height/2);

  if (elapsed > 5) {
    gameState = "play";
  }
}

/* ========== GAME LOOP ========== */
function gameLoop() {
  distance += speed * 0.1;
  speed = baseSpeed + distance / 300.0;
  spawnRate = max(10, int(60 - distance/30));

  road.update(nightFade > 0.4);
  road.display();

  if (frameCount % spawnRate === 0) {
    obstacles.push(createVector(random(road.leftGutterX+6,road.rightGutterX-6), -20));
  }

  fill(255);
  for (let i = obstacles.length-1; i >= 0; i--) {
    let o = obstacles[i];
    o.y += speed;
    ellipse(o.x, o.y, 30,30);
    if (dist(player.pos.x,player.pos.y,o.x,o.y) < player.radius/2+15) triggerMJ();
    if (o.y > height+20) obstacles.splice(i,1);
  }

  player.update(road);
  player.display();

  fill(255);
  textSize(24);
  text("Score: " + score, 20, 20);
  score++;

  if (score >= nextMilestone) {
    player.showMilestone("GOOD JOB!");
    nextMilestone += 20;
  }
}

/* ========== MJ GAMEOVER ========== */
function drawGameOver() {
  fadeAlpha = min(255, fadeAlpha+6);
  fill(0, fadeAlpha); rect(0,0,width,height);

  let a = map(fadeAlpha,80,255,0,255);
  tint(255, a);
  let w = width*0.8, h = w*(mjImg.height/mjImg.width);
  image(mjImg, (width-w)/2, (height-h)/2, w,h); noTint();

  if (!mjStarted) { laughSfx.play(); mjStarted=true; }

  if (!laughSfx.isPlaying() && fadeAlpha>=255) {
    fill(255); textAlign(CENTER,CENTER);
    textSize(32); text("Happy Halloween, try again!", width/2, height/2 + 40);
    textSize(20); text("Press SPACE or TAP", width/2, height/2 + 80);
  }
}

/* ========== EVENTS ========== */
function triggerMJ() {
  gameState="gameover";
  fadeAlpha=0;
  mjStarted=false;
  bgMusic.setVolume(0.12,0.3);
}

function resetGame() {
  countdownStart = millis();
  fadeVol = 0;
  score = 0;
  nextMilestone = 20;
  obstacles = [];
  player.pos.set(width/2,height-120);
  gameState = "countdown";
}

function keyPressed() {
  if (key === ' ') {
    if (gameState==="start") resetGame();
    else if (gameState==="play") togglePause();
    else resetGame();
  }
}

function touchStarted() {
  if (gameState==="start") resetGame();
  else if (gameState==="play") togglePause();
  else resetGame();
}

function togglePause() {
  if (gameState!=="play") return;
  noLoop();
  gameState="pause";
}

function touchEnded() {
  if (gameState==="pause") { gameState="play"; loop(); }
}

/* ========== DRAW ELEMENTS ========== */
function drawStars() {
  if (nightFade>0.3) {
    fill(255, map(nightFade,0.3,1,0,255));
    noStroke();
    for (let s of stars) circle(s.x,s.y,s.z);
  }
}
function drawClouds() {
  if (nightFade<0.8) {
    for (let c of clouds) c.update(), c.display();
  }
}

/* CLOUD CLASS */
class Cloud {
  constructor(x,y,s){this.x=x;this.y=y;this.s=s;}
  update(){this.x+=0.3*this.s;if(this.x>width+80){this.x=-80;this.y=random(50,250);}}
  display(){noStroke();fill(255,230);ellipse(this.x,this.y,60,40);ellipse(this.x+25,this.y+5,50,30);ellipse(this.x-25,this.y+5,50,30);}
}








