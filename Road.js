class Road {
  constructor() {
    this.roadWidth = width/3;
    this.margin = (width - this.roadWidth)/2;
    this.leftGutterX = this.margin;
    this.rightGutterX = this.margin + this.roadWidth;
    this.stripeOffsetY = 0;

    this.houses = [];
    let y = 0;
    for (let i = 0; i < 12; i++) {
      this.houses.push(new House(true, y));
      this.houses.push(new House(false, y));
      y += 120;
    }
  }

  update(darkMode) {
    let s = max(5, baseSpeed + distance / 300.0);
    this.stripeOffsetY = (this.stripeOffsetY + s) % 40;

    for (let h of this.houses) {
      h.y += s;
      if (h.y > height+80) h.reset(-random(100,200));
      h.updateBubble();
    }

    let darkness = lerp(1,0.2,nightFade);
    this.roadColor = color(250*darkness,199*darkness,179*darkness);
  }

  display() {
    noStroke();
    fill(this.roadColor);
    rect(this.margin,0,this.roadWidth,height);

    stroke(255);
    strokeWeight(3);
    for (let y=int(this.stripeOffsetY);y<height;y+=40)
      line(width/2,y,width/2,y+20);

    for (let h of this.houses) h.display(false);
    for (let h of this.houses) h.display(true);
  }
}

class House {
  constructor(leftSide,startY) {
    this.leftSide = leftSide;
    this.y = startY;
    this.randomize();
    this.position();
  }

  randomize() {
    this.w = random(50,80);
    this.h = random(60,110);
    this.body = color(random(180,255),random(120,255),random(120,255));
    this.roof = lerpColor(this.body,color(0),0.35);
    this.window = color(255,255,random(110,210));
  }

  position() {
    let pad = 10;
    this.x = this.leftSide ? random(pad,road.margin-this.w-pad) : random(width-road.margin+pad,width-this.w-pad);
  }

  reset(newY) {
    this.y = newY;
    this.randomize();
    this.position();
    this.showBubble = false;
    this.timer = 0;
  }

  updateBubble() {
    if (!this.showBubble && random(1)<0.002) {
      this.showBubble = true;
      let chatter=[
        "Did you see that ghost!",
        "Someone catch that ghost!",
        "Halloween too scary!",
        "That ghost real?!",
        "Mom can I pet it?",
        "Oh shit!",
        "Not Halloween being Halloween!",
        "911 I see a ghost!",
        "That ghost got moves!",
        "Close the curtains!",
        "Who you gonna call?!",
        "I'm out!",
        "That ghost bold!"
      ];
      this.msg = chatter[int(random(chatter.length))];
      this.timer = int(random(120,240));
    }
    if (this.showBubble) this.timer--;
    if (this.timer<=0) this.showBubble=false;
  }

  display(bubblePass) {
    if (!bubblePass) {
      fill(this.body);
      rect(this.x,this.y,this.w,this.h);
      fill(this.roof);
      triangle(this.x,this.y,this.x+this.w/2,this.y-25,this.x+this.w,this.y);
      fill(this.window);
      let spacing = this.w/4;
      rect(this.x+spacing,this.y+this.h/3,15,15);
      rect(this.x+2*spacing,this.y+this.h/3,15,15);
      rect(this.x+spacing,this.y+2*this.h/3,15,15);
      rect(this.x+2*spacing,this.y+2*this.h/3,15,15);
    } else if (this.showBubble) {
      fill(255);
      stroke(0);
      let tw = textWidth(this.msg)+16;
      let bx=this.x+this.w/2-tw/2, by=this.y-35;
      rect(bx,by,tw,24,12);
      fill(0);
      textSize(12);
      textAlign(CENTER);
      text(this.msg,this.x+this.w/2,this.y-20);
    }
  }
}

class Cloud {
  constructor(x,y,s){this.x=x;this.y=y;this.s=s;}
  update(){this.x+=0.3*this.s;if(this.x>width+80){this.x=-80;this.y=random(50,250);}}
  display(){
    fill(255,240);
    noStroke();
    ellipse(this.x,this.y,60,40);
    ellipse(this.x+25,this.y+5,50,30);
    ellipse(this.x-25,this.y+5,50,30);
  }
}

