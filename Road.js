class Road {
  constructor() {
    this.roadWidth = width / 3;
    this.margin = (width - this.roadWidth) / 2;
    this.leftGutterX = this.margin;
    this.rightGutterX = this.margin + this.roadWidth;
    this.stripeOffsetY = 0;

    this.houses = [];
    this.clouds = [];

    let y = 0;
    for (let i = 0; i < 12; i++) {
      this.houses.push(new House(true, y, this.margin));
      this.houses.push(new House(false, y, this.margin));
      y += 120;
    }

    // add clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push(new Cloud(random(width), random(50,200), random(0.6,1.2)));
    }
  }

  update() {
    let s = max(5, baseSpeed + distance / 300);
    this.stripeOffsetY = (this.stripeOffsetY + s) % 40;

    for (let h of this.houses) {
      h.y += s;
      if (h.y > height + 80) h.reset(-random(100, 200));
      h.updateBubble();
    }

    for (let c of this.clouds) c.update();

    let d = lerp(1,0.25, nightFade);
    this.roadColor = color(250*d,199*d,179*d);
  }

  display() {
    // sky
    background(170 * (1-nightFade), 150 * (1-nightFade), 200);

    // clouds
    for (let c of this.clouds) c.display();

    // houses behind road
    for (let h of this.houses) h.display(false);

    // road
    fill(this.roadColor);
    noStroke();
    rect(this.margin, 0, this.roadWidth, height);

    stroke(255);
    strokeWeight(3);
    for (let y = int(this.stripeOffsetY); y < height; y += 40)
      line(width / 2, y, width / 2, y + 20);

    // houses bubbles on top
    for (let h of this.houses) h.display(true);
  }
}

// 🏠 House
class House {
  constructor(leftSide, startY, marginRef) {
    this.leftSide = leftSide;
    this.y = startY;
    this.marginRef = marginRef;
    this.randomize();
    this.position();
  }

  randomize() {
    this.w = random(50, 80);
    this.h = random(60, 110);
    this.body = color(random(180,255), random(120,255), random(120,255));
    this.roof = lerpColor(this.body, color(0), 0.35);
    this.window = color(255, 255, random(110,210));
  }

  position() {
    let pad = 18;
    this.x = this.leftSide
      ? random(pad, this.marginRef - this.w - pad)
      : random(width - this.marginRef + pad, width - this.w - pad);
  }

  reset(y) {
    this.y = y;
    this.randomize();
    this.position();
    this.showBubble = false;
    this.timer = 0;
  }

  updateBubble() {
    if (!this.showBubble && random() < 0.0018) {
      let chatter = [
        "Did you see that ghost!",
        "Someone catch that ghost!",
        "Not Halloween being Halloween!",
        "911, I see a ghost outside!",
        "That ghost has moves!",
        "Close the curtains!"
      ];
      this.msg = chatter[int(random(chatter.length))];
      this.showBubble = true;
      this.timer = 150;
    } else if (this.showBubble) {
      this.timer--;
      if (this.timer <= 0) this.showBubble = false;
    }
  }

  display(bubblePass) {
    if (!bubblePass) {
      fill(this.body);
      noStroke();
      rect(this.x, this.y, this.w, this.h);
      fill(this.roof);
      triangle(this.x, this.y, this.x + this.w/2, this.y-22, this.x + this.w, this.y);
      fill(this.window);
      rect(this.x + 12, this.y + 18, 15, 15, 4);
      rect(this.x + this.w - 27, this.y + 18, 15, 15, 4);
      rect(this.x + 12, this.y + this.h - 35, 15, 15, 4);
      rect(this.x + this.w - 27, this.y + this.h - 35, 15, 15, 4);
    } 
    else if (this.showBubble) {
      push();
      textSize(12);
      let tw = textWidth(this.msg) + 20;
      fill(255);
      stroke(0);
      strokeWeight(2);
      rect(this.x + this.w/2 - tw/2, this.y - 28, tw, 22, 12);
      fill(0);
      noStroke();
      textAlign(CENTER,CENTER);
      text(this.msg, this.x + this.w/2, this.y - 18);
      pop();
    }
  }
}

// ☁️ Cloud
class Cloud {
  constructor(x,y,s){
    this.x=x; this.y=y; this.s=s;
  }
  update(){
    this.x += 0.3*this.s;
    if(this.x>width+80){
      this.x=-80;
      this.y=random(50,250);
    }
  }
  display(){
    noStroke();
    fill(255,240);
    ellipse(this.x,this.y,60,40);
    ellipse(this.x+22,this.y+5,50,30);
    ellipse(this.x-22,this.y+5,50,30);
  }
}
