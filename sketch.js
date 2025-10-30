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
  mjImg = loadImage("assets/Michael Jackson Thriller.png");
  bgMusic = loadSound("assets/Tame Impala - Dracula Instrumental.mp3");
  laughSfx = loadSound("assets/Mojo jojo.mp3");
}

function setup() {
  createCanvas(800, 600);

  player = new Ball(width/2, height - 100);
  road = new Road();

  if (bgMusic) {
    bgMusic.setVolume(0.4);
    bgMusic.loop();
  }

  for (let i = 0; i < 6; i++)
    clouds.push(new Cloud(random(width), random(50, 250), random(0.3, 1)));

  for (let i = 0; i < 120; i++)
    stars.push(createVector(random(width), random(height/2), random(1,3)));

  startTimeMs = millis();
}

function draw() {
  let cycleTime = 60000.0;
  let t = (millis() - startTimeMs) % cycleTime;

  nightFade = t < 30000 ? map(t,0,30000,0,1) : map(t,30000,60000,1,0);

  let r = lerp(233, 40, nightFade);
  let g = lerp(215, 30, nightFade);
  let b = lerp(255, 60, nightFade);
  background(r,g,b);

  drawStars();
  drawClouds();

  // Pause screen
  if (paused && !gameOver && !startSequence) {
    road.display();
    obstacles.forEach(o => ellipse(o.x, o.y, 30, 30));
    player.display();
    fill(255);
    textAlign(CENTER);
    textSize(36);
    text("PAUSED", width/2, height/2);
    return;
  }

  let shakeX = 0, shakeY = 0;
  if (shakeTimer > 0) {
    shakeX = random(-5, 5);
    shakeY = random(-5, 5);
    shakeTimer--;
  }
  translate(shakeX, shakeY);

  if (!gameOver) {
    road.update(nightFade > 0.4);
    road.display();

    if (!startSequence) {
      distance += speed * 0.1;
      speed = baseSpeed + distance / 300.0;
      spawnRate = int(60 - min(distance / 30.0, 40));

      if (frameCount % max(spawnRate, 10) === 0)
        obstacles.push(createVector(random(road.leftGutterX+5, road.rightGutterX-5), -20));

      for (let i = obstacles.length-1; i >= 0; i--) {
        obstacles[i].y += speed;
        ellipse(obstacles[i].x, obstacles[i].y, 30, 30);

        if (dist(player.pos.x, player.pos.y, obstacles[i].x, obstacles[i].y) < player.radius/2+15)
          triggerMJ();

        if (obstacles[i].y > height+20)
          obstacles.splice(i,1);
      }

      score++;
      if (score >= nextMilestone) {
        player.showMilestone("GOOD JOB!");
        nextMilestone += 20;
      }
    }

    player.update();
    player.display();
    textSize(24);
    fill(255);
    if (!startSequence) text("Score: " + score, 20, 40);

  } else drawGameOver();

  if (startSequence) drawCountdown();

  if (flashAlpha > 0) {
    fill(255,120,0,flashAlpha);
    rect(0,0,width,height);
    flashAlpha -= 10;
  }
}

function drawStars() {
  if (nightFade > 0.3) {
    for (let s of stars) {
      fill(255, map(nightFade,0.3,1,0,255));
      noStroke();
      circle(s.x,s.y,s.z);
    }
  }
}

function drawClouds() {
  if (nightFade < 0.8) {
    for (let c of clouds) {
      c.update();
      c.display();
    }
  }
}

function drawCountdown() {
  let secs = int((millis() - startTimeMs)/1000);
  if (secs > lastSecond) { lastSecond = secs; countdown--; }
  fill(255);
  textAlign(CENTER);
  textSize(48);
  text(max(countdown,0), width/2, height/2);
  if (countdown <= 0) startSequence = false;
}

function triggerMJ() {
  gameOver = true;
  shakeTimer = 25;
  flashAlpha = 180;
  fadeAlpha = 0;
  mjStarted = false;
}

function drawGameOver() {
  fadeAlpha = min(255, fadeAlpha + 6);
  fill(0, fadeAlpha);
  rect(0,0,width,height);

  let mjAlpha = map(fadeAlpha,80,255,0,255);
  tint(255,mjAlpha);
  image(mjImg, width*0.1, height*0.1, width*0.8, height*0.8);
  noTint();

  if (!mjStarted) { laughSfx.play(); mjStarted = true; }

  if (!laughSfx.isPlaying() && fadeAlpha >= 255) {
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Happy Halloween, try again!", width/2, height/2 + 40);
    textSize(20);
    text("Press SPACE to Restart", width/2, height/2 + 70);
  }
}

function keyPressed() {
  if (gameOver && key === ' ') resetGame();
  else if (!gameOver && !startSequence && key === ' ')
    paused = !paused;
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
  obstacles = [];
  player.pos = createVector(width/2, height-100);
  mjStarted = false;
  fadeAlpha = 0;
  startTimeMs = millis();
  nightFade = 0;
  if (bgMusic) { bgMusic.stop(); bgMusic.loop(); }
}

