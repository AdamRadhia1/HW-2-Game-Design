class Road {
  constructor() {
    this.roadWidth   = width / 3;
    this.margin      = (width - this.roadWidth) / 2;
    this.leftGutterX = this.margin;
    this.rightGutterX= this.margin + this.roadWidth;
    this.stripeOffsetY = 0;

    this.houses = [];
    let y = 0;
    for (let i = 0; i < 12; i++) {
      this.houses.push(new House(true,  y, this.roadWidth));
      this.houses.push(new House(false, y, this.roadWidth));
      y += 120;
    }
  }

  update() {
    const s = max(5, baseSpeed + distance / 300.0);
    this.stripeOffsetY = (this.stripeOffsetY + s) % 40;

    for (let h of this.houses) {
      h.y += s;
      if (h.y > height + 80) h.reset(-random(100, 200));
      h.updateBubble();
    }

    // pastel road that darkens at night
    this.roadColor = color(
      lerp(250, 50, nightFade),
      lerp(199, 50, nightFade),
      lerp(179, 40, nightFade)
    );
  }

  display() {
    // road
    noStroke(); fill(this.roadColor);
    rect(this.margin, 0, this.roadWidth, height);

    // center stripes
    stroke(255); strokeWeight(3);
    for (let y = int(this.stripeOffsetY); y < height; y += 40) {
      line(width/2, y, width/2, y + 20);
    }

    // houses (under speech bubbles)
    for (let h of this.houses) h.display(false);

    // collect bubbles and prevent overlaps per side + clamp inside side area
    const bubbles = [];
    for (let h of this.houses) if (h.showBubble) bubbles.push(h);
    bubbles.sort((a,b)=> a.y - b.y);

    const drawnLeft = [];
    const drawnRight = [];

    for (let h of bubbles) {
      const side = h.leftSide ? drawnLeft : drawnRight;
      let overlaps = side.some(y => abs(h.y - y) < 28);
      if (overlaps) continue;

      // draw crisp bubble (with clamping)
      h.drawBubbleCrisp(this.margin, this.roadWidth);
      side.push(h.y);
    }
  }
}

class House {
  constructor(leftSide, startY, roadWidth) {
    this.leftSide  = leftSide;
    this.y         = startY;
    this.roadWidth = roadWidth;

    this.showBubble = false;
    this.msg = "";
    this.timer = 0;

    this.randomize();
    this.position();
  }

  randomize() {
    this.w = random(50, 80);
    this.h = random(60, 110);
    this.body   = color(random(180,255), random(120,255), random(120,255));
    this.roof   = lerpColor(this.body, color(0), 0.35);
    this.window = color(255, 255, random(110,210));
  }

  position() {
    const pad = 10;
    const margin = (width - this.roadWidth) / 2;
    this.x = this.leftSide
      ? random(pad, margin - this.w - pad)
      : random(width - margin + pad, width - this.w - pad);
  }

  reset(newY) {
    this.y = newY;
    this.randomize();
    this.position();
    this.showBubble = false;
    this.timer = 0;
  }

  updateBubble() {
    if (!this.showBubble && random(1) < 0.002) {
      const chatter = [
        "Did you see that ghost!",
        "Someone catch that ghost!",
        "Halloween is getting too scary!",
        "No way that's a real ghost!",
        "Mommy can I go pet the ghost?",
        "Oh shoot!",
        "Not Halloween being Halloween!",
        "911, I see a ghost!",
        "That ghost has moves!",
        "Close the curtains!",
        "Who you gonna call?!",
        "I'm outta here!",
        "That's one bold ghost!"
      ];
      this.msg = random(chatter);
      this.showBubble = true;
      this.timer = int(random(120, 240));
    }
    if (this.showBubble) this.timer--;
    if (this.timer <= 0) this.showBubble = false;
  }

  display(bubblePass) {
    if (!bubblePass) {
      noStroke(); fill(this.body);
      rect(this.x, this.y, this.w, this.h);
      fill(this.roof);
      triangle(this.x, this.y, this.x + this.w/2, this.y - 25, this.x + this.w, this.y);

      // windows
      fill(this.window); noStroke();
      const s = this.w/4;
      rect(this.x + s,       this.y + this.h/3,     15, 15, 3);
      rect(this.x + 2*s,     this.y + this.h/3,     15, 15, 3);
      rect(this.x + s,       this.y + 2*this.h/3-8, 15, 15, 3);
      rect(this.x + 2*s,     this.y + 2*this.h/3-8, 15, 15, 3);
    }
  }

  // clamp bubbles to side area so they never cross the road
  drawBubbleCrisp() {
  if (!this.showBubble) return;

  const tw = textWidth(this.msg) + 16;
  let bx = this.x + this.w/2 - tw/2;
  const by = this.y - 35;

  const margin = (width - this.roadWidth) / 2;

  // Keep bubble out of the road
  if (this.leftSide) {
    bx = min(bx, margin - tw - 6);
  } else {
    bx = max(bx, width - margin + 6);
  }

  stroke(0, 140);
  strokeWeight(1);
  fill(255, 245);
  rect(bx, by, tw, 24, 10);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(this.msg, bx + tw/2, by + 12);
}
