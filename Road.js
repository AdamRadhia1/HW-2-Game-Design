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

    // center stripes
    stroke(255); strokeWeight(3);
    for (let y = int(this.stripeOffsetY); y < height; y += 40) {
      line(width/2, y, width/2, y + 20);
    }

    // houses (under bubbles)
    for (let h of this.houses) h.display(false);

    // collect bubbles, prevent overlaps per side
    const bubbleItems = [];
    for (let h of this.houses) if (h.showBubble) {
      const tw = textWidth(h.msg) + 16;
      const bx = h.x + h.w/2 - tw/2;
      const by = h.y - 35;
      bubbleItems.push({ house:h, x:bx, y:by, w:tw, h:24, left:h.leftSide });
    }

    // sort by y so we accept the first, skip the next if overlapping
    bubbleItems.sort((a,b)=> a.y - b.y);

    const drawnLeft  = [];
    const drawnRight = [];

    for (let item of bubbleItems) {
      const arr = item.left ? drawnLeft : drawnRight;
      let overlaps = false;
      for (let d of arr) {
        if (abs(item.y - d.y) < 28) { overlaps = true; break; }
      }
      if (!overlaps) {
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
      this.msg = chatter[int(random(chatter.length))];
      this.timer = int(random(120, 240));
    }
    if (this.showBubble) this.timer--;
    if (this.timer <= 0) this.showBubble = false;
  }

  display(bubblePass) {
    if (!bubblePass) {
      // pastel flat house
      noStroke(); fill(this.body);
      rect(this.x, this.y, this.w, this.h);
      fill(this.roof);
      triangle(this.x, this.y, this.x + this.w/2, this.y - 25, this.x + this.w, this.y);

      // windows (no flicker)
      fill(this.window); noStroke();
      const spacing = this.w/4;
      rect(this.x + spacing,     this.y + this.h/3,     15, 15, 3);
      rect(this.x + 2*spacing,   this.y + this.h/3,     15, 15, 3);
      rect(this.x + spacing,     this.y + 2*this.h/3-8, 15, 15, 3);
      rect(this.x + 2*spacing,   this.y + 2*this.h/3-8, 15, 15, 3);
    }
  }

  drawBubbleCrisp() {
    if (!this.showBubble) return;
    // clean, thin bubble
    const tw = textWidth(this.msg) + 16;
    const bx = this.x + this.w/2 - tw/2;
    const by = this.y - 35;

    stroke(0, 140); strokeWeight(1);
    fill(255, 245);
    rect(bx, by, tw, 24, 10);

    noStroke(); fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.msg, this.x + this.w/2, this.y - 23);
  }
}


