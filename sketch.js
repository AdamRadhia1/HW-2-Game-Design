/* =========================
   GHOST RUNNER — p5.js
   ========================= */

// --- GAME FLOW
let gameState = "start"; 
// start → countdown → play → gameOver
let countdown = 5;
let countdownStart = 0;
let fadeVol = 0;

// --- Existing vars
let player, road;
let obstacles = [];

let baseSpeed = 5;
let speed = baseSpeed;
let distance = 0;
let spawnRate = 60;

let gameOver = false;
let paused = false;

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
  // fullscreen desktop + fit mobile
  createCanvas(windowWidth, windowHeight);

  player = new Ball(width/2, height - 100);
  road   = new Road();

  for (let i = 0; i < 6; i++)
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));

  for (let i = 0; i < 120; i++)
    stars.push(createVector(random(width), random(height/2), random(1,3)));

  countdownStart = millis();
}

// user-initiated audio unlock
function startAudio() {
  if (getAudioContext().state !== "running") getAudioContext().resume();
}

function draw() {

  // DAY/NIGHT SKY
  const cycle = 60000, t = millis() % cycle;
  nightFade = t < 30000 ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);
  background( lerp(233,40,nightFade), lerp(215,30,nightFade), lerp(255,60,nightFade) );

  drawStars();
  drawClouds();

  // ============= START SCREEN =============
  if (gameState === "start") {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GHOST RUNNER", width/2, height/2 - 40);

    textSize(22);
    text(
      /Mobi|Android/i.test(navigator.userAgent)
        ? "Tap to Start"
        : "Press SPACE to Start",
      width/2, height/2 + 15
    );
    return;
  }

  // ============= COUNTDOWN =============
  if (gameState === "countdown") {
    let elapsed = floor((millis() - countdownStart) / 1000);
    let n = 5 - elapsed;

    fill(255);
    textAlign(CENTER,CENTER);
    textSize(64);
    if (n > 0) text(n, width/2, height/2);
    else text("GO!", width/2, height/2);

    // fade in music
    if (!bgMusic.isPlaying()) {
      startAudio();
      bgMusic.setVolume(0);
      bgMusic.loop();
    }
    if (fadeVol < 0.35) {
      fadeVol += 0.01;
      bgMusic.setVolume(fadeVol);
    }

    if (elapsed > 5) {
      gameState = "play";
    }
    return;
  }

  // ============= GAME PLAY =============
  if (!gameOver && gameState === "play") {

    if (paused) {
      drawPausedOverlay();
      return;
    }

    // shake on hit
    let sx = 0, sy = 0;
    if (shakeTimer>0){ sx=random(-5,5); sy=random(-5,5); shakeTimer--; }
    push(); translate(sx,sy);

    road.update(nightFade>0.4);
    road.display();

    distance += speed*0.1;
    speed = baseSpeed + distance/300.0;
    spawnRate = int(60 - min(distance/30.0, 40));

    if (frameCount % max(spawnRate,10) === 0) {
      obstacles.push(createVector(
        random(road.leftGutterX+6, road.rightGutterX-6),
        -20
      ));
    }

    noStroke(); fill(255);
    for (let i = obstacles.length-1; i>=0; i--) {
      let o = obstacles[i];
      o.y += speed;
      ellipse(o.x,o.y,30,30);
      if (dist(player.pos.x,player.pos.y,o.x,o.y) < player.radius/2+15) triggerMJ();
      if (o.y>height+20) obstacles.splice(i,1);
    }

    score++;
    if (score>=nextMilestone){ player.showMilestone("GOOD JOB!"); nextMilestone+=20; }

    player.update(road);
    player.display();
    drawHud();

    pop();
  }

  if (gameOver) drawGameOver();

  if (flashAlpha>0){ noStroke(); fill(255,120,0,flashAlpha); rect(0,0,width,height); flashAlpha-=10; }
}

// ============= INPUT HANDLING =============
function mousePressed(){
  if (gameState==="start"){
    startAudio();
    gameState="countdown";
    countdownStart = millis();
  }
}

function keyPressed(){
  if (key===' ') {
    if (gameState==="start"){
      startAudio();
      gameState="countdown";
      countdownStart = millis();
      return;
    }
    if (gameOver) resetGame();
    else paused=!paused;
  }
}

// ============= GAME OVER / RESET =============
function triggerMJ(){
  gameOver=true; shakeTimer=25; flashAlpha=180; fadeAlpha=0;
  if(bgMusic.isPlaying()) bgMusic.setVolume(0.12,0.3);
}

function resetGame(){
  gameOver=false; paused=false;
  gameState="start";
  countdownStart = millis();
  fadeVol = 0;

  distance=0; score=0; nextMilestone=20; obstacles.length=0;
  player.pos.set(width/2,height-100);
  player.resetBounce();
  mjStarted=false; fadeAlpha=0;
}

// ============= HUD / UI =============
function drawHud(){
  fill(255); noStroke(); textAlign(LEFT,TOP); textSize(24);
  text("Score: "+score,20,16);
}

function drawPausedOverlay(){
  fill(0,140); rect(0,0,width,height);
  fill(255); textAlign(CENTER,CENTER);
  textSize(36); text("PAUSED",width/2,height/2-10);
  textSize(18); text("Press SPACE to Resume",width/2,height/2+24);
}

// ============= CLOUDS & STARS =============
function drawStars(){
  if(nightFade>0.3){
    fill(255,map(nightFade,0.3,1,0,255)); noStroke();
    for(let s of stars) circle(s.x,s.y,s.z);
  }
}
function drawClouds(){
  if(nightFade<0.8){
    for(let c of clouds){ c.update(); c.display(); }
  }
}

// ============= MJ DEATH SCENE =============
function drawGameOver(){
  fadeAlpha=min(255,fadeAlpha+6);
  fill(0,fadeAlpha); rect(0,0,width,height);

  let a=map(fadeAlpha,80,255,0,255);
  tint(255,a);
  let w=width*0.8, h=w*(mjImg.height/mjImg.width);
  image(mjImg,(width-w)/2,(height-h)/2,w,h);
  noTint();

  if(!mjStarted){ if(laughSfx) laughSfx.play(); mjStarted=true; }

  if(!laughSfx.isPlaying() && fadeAlpha>=255){
    fill(255); textAlign(CENTER); textSize(32);
    text("Happy Halloween, try again!",width/2,height/2+40);
    textSize(20);
    text("Press SPACE to Restart",width/2,height/2+70);
  }
}

// ============= CLOUD CLASS =============
class Cloud {
  constructor(x,y,s){ this.x=x; this.y=y; this.s=s; }
  update(){ this.x+=0.3*this.s; if(this.x>width+80){ this.x=-80; this.y=random(50,250);} }
  display(){
    noStroke(); fill(255,230);
    ellipse(this.x,this.y,60,40);
    ellipse(this.x+25,this.y+5,50,30);
    ellipse(this.x-25,this.y+5,50,30);
  }
}




