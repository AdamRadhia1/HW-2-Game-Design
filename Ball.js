class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 34;
    this.bounceVel = 0;
    this.gravity = 0.5;

    this.milestoneText = "";
    this.milestoneTimer = 0;
  }

  update(road) {
    // follow mouse horizontally
    this.pos.x = lerp(this.pos.x, mouseX, 0.2);

    // constrain to road
    this.pos.x = constrain(this.pos.x, road.leftGutterX, road.rightGutterX);

    // gentle vertical bounce resolution (as in your Processing)
    this.pos.y += this.bounceVel;
    this.bounceVel += this.gravity;

    const floorY = height - 100;
    if (this.pos.y > floorY) {
      this.pos.y = floorY;
      this.bounceVel = 0;
    }

    if (this.milestoneTimer > 0) this.milestoneTimer--;
  }

  display() {
    push();

    // night glow aura
    const glow = map(nightFade, 0, 1, 0, 80);
    noStroke(); fill(255, glow);
    circle(this.pos.x, this.pos.y, this.radius * 1.9);

    // ghost body (same silhouette as your PDE)
    fill(255);
    const w = this.radius * 1.2;
    const h = this.radius * 1.5;

    circle(this.pos.x, this.pos.y - h * 0.25, w); // head
    rectMode(CENTER);
    rect(this.pos.x, this.pos.y + h * 0.05, w, h * 0.6, 10); // torso

    // teeth / frill
    const teeth = 5;
    const seg = w / teeth;
    for (let i = 0; i < teeth; i++) {
      circle(this.pos.x - w/2 + seg/2 + i*seg, this.pos.y + h*0.35, seg*0.6);
    }

    // eyes + mouth
    fill(30);
    circle(this.pos.x - w*0.2, this.pos.y - h*0.25, w*0.15);
    circle(this.pos.x + w*0.2, this.pos.y - h*0.25, w*0.15);

    noFill(); stroke(30); strokeWeight(3);
    arc(this.pos.x, this.pos.y - h*0.05, w*0.3, w*0.2, 0, PI);

    pop();

    // milestone popup
    if (this.milestoneTimer > 0) {
      fill(255, 230, 90);
      noStroke();
      textAlign(CENTER);
      textSize(20);
      text(this.milestoneText, this.pos.x, this.pos.y - this.radius - 18);
    }
  }

  bounce() { this.bounceVel = -10; }
  resetBounce() { this.bounceVel = 0; }

  showMilestone(msg) {
    this.milestoneText = msg;
    this.milestoneTimer = 60;
  }
}
