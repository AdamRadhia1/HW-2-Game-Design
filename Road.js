class Road {
  constructor(){
    this.roadWidth = width*0.5;
    this.margin=(width-this.roadWidth)/2;
    this.leftGutterX=this.margin;
    this.rightGutterX=this.margin+this.roadWidth;
    this.stripeOffsetY=0;

    this.houses=[];
    let y=0;
    for(let i=0;i<12;i++){
      this.houses.push(new House(true,y,this.roadWidth));
      this.houses.push(new House(false,y,this.roadWidth));
      y+=120;
    }
  }

  update(){
    let s=max(5, baseSpeed+distance/300);
    this.stripeOffsetY=(this.stripeOffsetY+s)%40;

    for(let h of this.houses){
      h.y+=s;
      if(h.y>height+80) h.reset(-random(100,200));
      h.updateBubble();
    }

    let darkness=lerp(1,0.2,nightFade);
    this.roadColor=color(250*darkness,199*darkness,179*darkness);
  }

  display(){
    noStroke(); fill(this.roadColor);
    rect(this.margin,0,this.roadWidth,height);

    stroke(255); strokeWeight(3);
    for(let y=int(this.stripeOffsetY);y<height;y+=40){
      line(width/2,y,width/2,y+20);
    }

    for(let h of this.houses) h.display(false);

    const arrLeft=[], arrRight=[];
    let bubbles=[];
    for(let h of this.houses) if(h.showBubble){
      let tw=textWidth(h.msg)+16;
      let bx=h.x+h.w/2-tw/2;
      let by=h.y-35;
      bubbles.push({house:h,x:bx,y:by,left:h.leftSide});
    }

    bubbles.sort((a,b)=>a.y-b.y);
    for(let b of bubbles){
      let arr = b.left ? arrLeft : arrRight;
      let overlap = arr.some(d=>abs(b.y-d.y)<28);
      if(!overlap){ b.house.drawBubble(); arr.push({y:b.y}); }
    }
  }
}

class House {
  constructor(left,startY,roadW){
    this.leftSide=left; this.y=startY; this.roadWidth=roadW;
    this.showBubble=false; this.msg=""; this.timer=0;
    this.randomize(); this.position();
  }

  randomize(){
    this.w=random(50,80);
    this.h=random(60,110);
    this.body=color(random(180,255),random(120,255),random(120,255));
    this.roof=lerpColor(this.body,color(0),0.35);
    this.window=color(255,255,random(120,210));
  }

  position(){
    let pad=10, margin=(width-this.roadWidth)/2;
    this.x=this.leftSide ? random(pad,margin-this.w-pad)
                         : random(width-margin+pad,width-this.w-pad);
  }

  reset(y){ this.y=y; this.randomize(); this.position(); this.showBubble=false; this.timer=0; }

  updateBubble(){
    if(!this.showBubble && random(1)<0.002){
      let lines=[
        "Did you see that ghost!",
        "Someone catch that ghost!",
        "Halloween is getting too scary!",
        "No way that's a real ghost!",
        "Mommy can I pet the ghost?",
        "Oh shoot!",
        "Not Halloween being Halloween!",
        "911 I see a ghost!",
        "That ghost has moves!",
        "Close the curtains!",
        "Who you gonna call?!",
        "I'm out!",
        "That ghost bold!"
      ];
      this.msg=lines[int(random(lines.length))];
      this.timer=int(random(120,240));
      this.showBubble=true;
    }
    if(this.showBubble) this.timer--;
    if(this.timer<=0) this.showBubble=false;
  }

  display(pass){
    if(!pass){
      noStroke(); fill(this.body);
      rect(this.x,this.y,this.w,this.h);
      fill(this.roof);
      triangle(this.x,this.y,this.x+this.w/2,this.y-25,this.x+this.w,this.y);
      fill(this.window);
      let s=this.w/4;
      rect(this.x+s, this.y+this.h/3,15,15,3);
      rect(this.x+2*s,this.y+this.h/3,15,15,3);
      rect(this.x+s, this.y+2*this.h/3-8,15,15,3);
      rect(this.x+2*s,this.y+2*this.h/3-8,15,15,3);
    }
  }

  drawBubble(){
    if(!this.showBubble) return;
    let tw=textWidth(this.msg)+16;
    let bx=this.x+this.w/2-tw/2;
    let by=this.y-35;
    stroke(0,130); strokeWeight(1);
    fill(255,240);
    rect(bx,by,tw,24,10);
    noStroke(); fill(0);
    textAlign(CENTER,CENTER); textSize(12);
    text(this.msg,this.x+this.w/2,this.y-23);
  }
}

