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

  update(darkMode) {
    const s = max(5, baseSpeed + distance / 300.0);
    this.stripeOffsetY = (this.stripeOffsetY + s) % 40;

    for (let h of this.houses) {
      h.y += s;
      if (h.y > height + 80) h.reset(-random(100, 200));
      h.updateBubble();
    }

    const darkness = lerp(1, 0.2, nightFade);
    this.roadColor = color(250 * darkness, 199 * darkness, 179 * darkness);
  }

  display() {
    // road
    noStroke(); fill(this.roadColor);
    rect(this.margin, 0, this.roadWidth, height);

    // stripes
    stroke(255); strokeWeight(3);
    for (let y = int(this.stripeOffsetY); y < height; y += 40) {
      line(width/2, y, width/2, y + 20);
    }

    // houses beneath bubbles
    for (let h of this.houses) h.display(false);

    // bubble placement logic
    const bubbleItems = [];
    for (let h of this.houses) {
      if (h.showBubble) {
        const tw = textWidth(h.msg) + 16;
        let bx = h.x + h.w/2 - tw/2;
        const by = h.y - 35;

        bubbleItems.push({ house:h, x:bx, y:by, w:tw, h:24, left:h.leftSide });
      }
    }

    bubbleItems.sort((a,b)=> a.y - b.y);

    const leftDraw  = [];
    const rightDraw = [];

    for (let item of bubbleItems) {
      const arr = item.left ? leftDraw : rightDraw;
      let overlap = false;
      for (let d of arr) {
        if (abs(item.y - d.y) < 30) { overlap = true; break; }
      }
      if (!overlap) {
        item.house.drawBubbleCrisp();
        arr.push({ y:item.y });
      }
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
      this.showBubble = true;
      const chatter = [
        "Did you see that ghost!",
        "Someone catch that ghost!",
        "No way that's a real ghost!",
        "Halloween is getting wild!",
        "Mom, there's a ghost!",
        "Oh shoot!",
        "Not Halloween being Halloween!",
        "911 I see a ghost!",
        "That ghost has moves!",
        "Close the curtains!",
        "Who you gonna call?!",
        "I'm outta here!",
        "That's one bold ghost!"
      ];
      this.msg = chatter[int(random(chatter.length))];
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
      fill(this.window);
      const spacing = this.w/4;
      rect(this.x + spacing,     this.y + this.h/3,     15, 15, 3);
      rect(this.x + 2*spacing,   this.y + this.h/3,     15, 15, 3);
      rect(this.x + spacing,     this.y + 2*this.h/3-8, 15, 15, 3);
      rect(this.x + 2*spacing,   this.y + 2*this.h/3-8, 15, 15, 3);
    }
  }

  drawBubbleCrisp() {
    if (!this.showBubble) return;

    const tw = textWidth(this.msg) + 16;
    let bx = this.x + this.w/2 - tw/2;
    const by = this.y - 35;

    const margin = (width - this.roadWidth) / 2;

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
}

