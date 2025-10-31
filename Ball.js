class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 34;
    this.bounceVel = 0;
    this.gravity = 0.5;
  }

  update() {
    this.pos.x = lerp(this.pos.x, mouseX, 0.2);
    this.pos.x = constrain(this.pos.x, road.leftGutterX, road.rightGutterX);

    this.pos.y += this.bounceVel;
    this.bounceVel += this.gravity;

    let floorY = height - 100;
    if (this.pos.y > floorY) {
      this.pos.y = floorY;
      this.bounceVel = 0;
    }
  }

  display() {
    push();
    noStroke();
    fill(255);
    
    // ghost body
    ellipse(this.pos.x, this.pos.y - 15, this.radius, this.radius * 1.3);
    rectMode(CENTER);
    rect(this.pos.x, this.pos.y + 5, this.radius * 0.9, this.radius * 0.9, 10);
    
    // ghost eyes
    fill(30);
    ellipse(this.pos.x - 6, this.pos.y - 18, 6, 6);
    ellipse(this.pos.x + 6, this.pos.y - 18, 6, 6);
    
    // ghost mouth
    noFill();
    stroke(30);
    strokeWeight(2);
    arc(this.pos.x, this.pos.y - 5, 12, 8, 0, PI);
    
    pop();
  }

  bounce() { this.bounceVel = -10; }
  resetBounce() { this.bounceVel = 0; }
}
