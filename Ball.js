class Ball {
  constructor(x, y) {
    this.pos = createVector(x,y);
    this.radius = width * 0.05;
    this.bounceVel=0; this.gravity=0.5;
    this.milestoneText=""; this.milestoneTimer=0;
  }

  update(road){
    if(!isMobile()){
      this.pos.x = lerp(this.pos.x, mouseX, 0.2);
    }
    if(isMobile() && touches.length>0){
      this.pos.x = lerp(this.pos.x, touches[0].x, 0.15);
    }

    this.pos.x = constrain(this.pos.x, road.leftGutterX, road.rightGutterX);
    this.pos.y += this.bounceVel;
    this.bounceVel += this.gravity;

    let floorY = height-100;
    if(this.pos.y>floorY){
      this.pos.y=floorY;
      this.bounceVel=0;
    }
    if(this.milestoneTimer>0) this.milestoneTimer--;
  }

  display(){
    push();
    let glow = map(nightFade,0,1,0,80);
    fill(255,glow); noStroke();
    circle(this.pos.x,this.pos.y,this.radius*1.8);

    fill(255);
    let w=this.radius*1.2, h=this.radius*1.5;
    circle(this.pos.x,this.pos.y-h*0.25,w);
    rectMode(CENTER);
    rect(this.pos.x,this.pos.y+h*0.05,w,h*0.6,10);
    let teeth=5, seg=w/teeth;
    for(let i=0;i<teeth;i++){
      circle(this.pos.x-w/2+seg/2+i*seg,this.pos.y+h*0.35,seg*0.6);
    }

    fill(30);
    circle(this.pos.x-w*0.2,this.pos.y-h*0.25,w*0.15);
    circle(this.pos.x+w*0.2,this.pos.y-h*0.25,w*0.15);
    noFill(); stroke(30); strokeWeight(3);
    arc(this.pos.x,this.pos.y-h*0.05,w*0.3,w*0.2,0,PI);
    pop();

    if(this.milestoneTimer>0){
      fill(255,230,90);
      textAlign(CENTER); textSize(min(width,height)*0.04);
      text(this.milestoneText,this.pos.x,this.pos.y-this.radius*1.2);
    }
  }

  resetBounce(){ this.bounceVel=0; }
  showMilestone(msg){ this.milestoneText=msg; this.milestoneTimer=60; }
}

