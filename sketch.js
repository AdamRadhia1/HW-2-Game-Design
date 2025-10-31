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

function preload() {
  mjImg   = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx= loadSound("assets/Mojo jojo.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  userStartAudio();

  player = new Ball(width/2, height - 100);
  road   = new Road();

  for (let i = 0; i < 6; i++) {
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));
  }
  for (let i = 0; i < 120; i++) {
    stars.push(createVector(random(width), random(height/2), random(1,3)));
  }

  startTimeMs = millis();
}

function draw() {
  // Day -> Night -> Day cycle ~60s
  const t = (millis() - startTimeMs) % 60000;
  nightFade = (t < 30000) ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);

  const r = lerp(233, 40, nightFade);
  const g = lerp(215, 30, nightFade);
  const b = lerp(255, 60, nightFade);
  background(r, g, b);

  drawStars();
  drawClouds();

  if (paused && !gameOver && !startSequence) {
    road.display();
    fill(255);
    for (let o of obstacles) ellipse(o.x, o.y, 30, 30);
    player.display();
    drawHUD();
    pauseOverlay();
    return;
  }

  let shakeX=0, shakeY=0;
  if (shakeTimer>0){ shakeX=random(-5,5); shakeY=random(-5,5); shakeTimer--; }
  push(); translate(shakeX, shakeY);

  if(!gameOver){
    road.update();
    road.display();

    if(!startSequence){
      distance += speed * 0.1;
      speed = baseSpeed + distance / 300.0;
      spawnRate = int(60 - min(distance/30, 40));

      if(frameCount % max(spawnRate,10)==0){
        obstacles.push(createVector(random(road.leftGutterX+6, road.rightGutterX-6), -20));
      }

      fill(255);
      for(let i=obstacles.length-1;i>=0;i--){
        let o=obstacles[i];
        o.y += speed;
        ellipse(o.x, o.y, 30, 30);
        if(dist(player.pos.x, player.pos.y, o.x, o.y) < player.radius/2 + 15){
          triggerMJ();
        }
        if(o.y > height+20) obstacles.splice(i,1);
      }

      score++;
      if(score >= nextMilestone){
        player.showMilestone("GOOD JOB!");
        nextMilestone += 20;
      }
    }

    player.update(road);
    player.display();
    drawHUD();

  } else {
    drawGameOver();
  }

  if(startSequence) drawCountdown();

  if(flashAlpha>0){
    fill(255,120,0,flashAlpha);
    rect(0,0,width,height);
    flashAlpha-=10;
  }

  pop();
}

function drawHUD(){
  if(!startSequence){
    fill(255); textSize(min(width,height)*0.04);
    textAlign(LEFT,TOP);
    text("Score: "+score, 20, 16);
  }
}

function drawCountdown(){
  let secs = int((millis()-startTimeMs)/1000);
  if(secs>lastSecond){ lastSecond=secs; countdown--; }

  fill(255);
  textAlign(CENTER,CENTER);
  textSize(min(width,height)*0.18);
  if(countdown>0){
    text(countdown, width/2, height/2 - 40);
    fadeInMusic();  // start fade-in DURING countdown
  } else {
    text("GO!", width/2, height/2 - 40);
    fadeInMusic();
    if(millis() - startTimeMs > 1000 * (lastSecond + 0.3)){
      startSequence=false;
    }
  }
}

function fadeInMusic(){
  if(!bgMusic.isPlaying()){
    bgMusic.setVolume(0);
    bgMusic.loop();
  }
  let current = bgMusic.getVolume();
  let target = 0.35;
  if(current<target) bgMusic.setVolume(current+0.01);
}

function triggerMJ(){
  gameOver=true;
  shakeTimer=25;
  flashAlpha=180;
}

function drawGameOver(){
  fadeAlpha = min(255, fadeAlpha+6);
  fill(0,fadeAlpha); rect(0,0,width,height);

  let mjAlpha = map(fadeAlpha,80,255,0,255);
  tint(255,mjAlpha);
  let w = width*0.8;
  let h = w*(mjImg.height/mjImg.width);
  image(mjImg, (width-w)/2, (height-h)/2, w, h);
  noTint();

  if(!mjStarted){
    laughSfx.play();
    mjStarted=true;
  }

  if(!laughSfx.isPlaying() && fadeAlpha>=255){
    fill(255);
    textAlign(CENTER);
    textSize(min(width,height)*0.06);
    text("Happy Halloween, try again!", width/2, height/2+40);
    textSize(min(width,height)*0.04);
    text("Press SPACE to Restart", width/2, height/2+80);
  }
}

function pauseOverlay(){
  fill(0,150); rect(0,0,width,height);
  fill(255);
  textAlign(CENTER,CENTER);
  textSize(min(width,height)*0.08);
  text("PAUSED", width/2, height/2);
}

function keyPressed(){
  if(key===' '){
    if(gameOver) resetGame();
    else if(!startSequence) paused=!paused;
  }
}

function resetGame(){
  gameOver=false; paused=false; startSequence=true;
  countdown=5; lastSecond=0;
  distance=0; score=0; nextMilestone=20;
  obstacles=[];
  player.pos.set(width/2, height-100);
  player.resetBounce();
  mjStarted=false; fadeAlpha=0;
  startTimeMs=millis(); nightFade=0;
  bgMusic.setVolume(0.35);
}

function drawStars(){
  if(nightFade>0.3){
    fill(255, map(nightFade,0.3,1,0,255));
    noStroke();
    for(let s of stars) circle(s.x,s.y,s.z);
  }
}

function drawClouds(){
  if(nightFade<0.8){
    for(let c of clouds){ c.update(); c.display(); }
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

