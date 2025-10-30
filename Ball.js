class Ball {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 34;
    this.bounceVel = 0;
    this.gravity = 0.5;
    this.milestoneText = "";
    this.milestoneTimer = 0;
  }

  update() {
    this.pos.x = lerp(this.pos.x, mouseX, 0.2);
    this.pos.y += this.bounceVel;
    this.bounceVel += this.gravity;

    if (this.pos.y > height - 100) {
      this.pos.y = height - 100;
      this.bounceVel = 0;
    }

    if (this.milestoneTimer > 0) this.milestoneTimer--;
  }

  display() {
    push();

    let glow = map(nightFade,0,1,0,80);
    fill(255, glow);
    noStroke();
    circle(this.pos.x, this.pos.y, this.radius*1.9);

    fill(255);
    let w = this.radius*1.2, h = this.radius*1.5;
    circle(this.pos.x, this.pos.y-h*0.25, w);
    rectMode(CENTER);
    rect(this.pos.x,this.pos.y+h*0.05,w,h*0.6,10);

    let seg = w/5;
    for (let i=0;i<5;i++)
      circle(this.pos.x-w/2+seg/2+i*seg,this.pos.y+h*0.35,seg*0.6);

    fill(30);
    circle(this.pos.x-w*0.2,this.pos.y-h*0.25,w*0.15);
    circle(this.pos.x+w*0.2,this.pos.y-h*0.25,w*0.15);

    noFill(); stroke(30); strokeWeight(3);
    arc(this.pos.x,this.pos.y-h*0.05,w*0.3,w*0.2,0,PI);

    pop();

    if (this.milestoneTimer > 0) {
      fill(255,230,90);
      textAlign(CENTER);
      textSize(20);
      text(this.milestoneText,this.pos.x,this.pos.y-this.radius-18);
    }
  }

  showMilestone(msg) {
    this.milestoneText = msg;
    this.milestoneTimer = 60;
  }
}

