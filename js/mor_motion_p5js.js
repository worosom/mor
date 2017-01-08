/*
 * @name Mor Motion
 * @description Generative Particle System
 */

var h = "innerHeight" in window 
               ? window.innerHeight
               : document.documentElement.offsetHeight;

var w = "innerWidth" in window 
               ? window.innerWidth
               : document.documentElement.offsetHeight;

var num = 10;
var avgNum = 10;
var maxNum = 2000;

var population;

var drag = .98;
var speed = 1.;
var groupForce = .02;
var mgroupForce = .01;
var repulsion = .1;

var targetFPS = 60;
var avgFPS = 60;

function setup() {
  createCanvas(w, h, "WEBGL");
  population = new Population();
  //generateParameters();
  //setInterval(population.update, 1./30.*1000.);
}

function draw() {
  population.update();
  background(255, 127);
  stroke(0);
  strokeWeight(2.);
  population.display();
  avgNum += (num - avgNum) * .01;
  avgFPS += (frameRate() - avgFPS) * .1;
  if (avgFPS < targetFPS - 4 && num > 0) {
    num --;
  } else if (avgFPS > targetFPS && num) {
    num ++;
  }
}

function Population() {
  this.cells = [];

  for ( var i = 0; i < num; i++ ) {
    this.cells.push(new Cell());
  }

  this.update = function() {
   for(var i = 0; i < this.cells.length; i++) {
    this.cells[i].update();
    var velMagSq = this.cells[i].getVelMagSq();
    velMagSq *= 4.;
    velMagSq += 1.;
    this.cells[i].addForce(p5.Vector.random2D().mult(1/velMagSq));

    for (var j = 0; j < this.cells.length; j++) {
      if (i != j) {
        var dir = p5.Vector.sub(this.cells[i].pos, this.cells[j].pos);
        //dir.normalize();
        var dist = dir.x*dir.x+dir.y*dir.y;
        var force = cubicPulse(400, 100, dist);
        var mForce = cubicPulse(1000, 4900, dist);
        var repForce = cubicPulse(0, 400, dist);
        this.cells[i].addForce(dir.copy().mult(force * groupForce * this.cells[i].getDna().x));
        this.cells[j].addForce(dir.copy().mult(-force * groupForce) * this.cells[j].getDna().y);

        this.cells[i].addForce(
            p5.Vector.sub(this.cells[i].vel, this.cells[j].vel).mult(
              mForce * mgroupForce * this.cells[i].getDna().z));

        this.cells[i].addForce(dir.copy().mult(
              - repForce * 1/dist * repulsion));
      }
    }
    this.cells[i].update();
    if(this.cells[i].pos.x > width || this.cells[i].pos.x < 0)
      this.cells[i].pos.x = width - this.cells[i].pos.x;
    if(this.cells[i].pos.y > height || this.cells[i].pos.y < 0)
      this.cells[i].pos.y = height - this.cells[i].pos.y;
   }
  }

  this.display = function() {
   if(num > this.cells.length && random(1) > .99)
    this.cells.push(new Cell());
   else if(num < this.cells.length && random(1))
    this.cells.pop();

    for(var i = 0; i < this.cells.length; i++) {
      this.cells[i].display();
    }
  }
}

function cubicPulse(c, w, x) {
  x = abs(x-c);
  if( x > w ) return 0.0;
  x /= w;
  return 1.0 - x*x*(3.0-2.0*x);
}

function Cell(pos, vel, dna) {
  if(pos != null)
    this.pos = pos.copy();
  else {
    this.pos = createVector();
    this.pos.x = random(width);
    this.pos.y = random(height);
  }
  if(vel != null)
    this.vel = vel.copy();
  else
    this.vel = p5.Vector.random2D();

  if(dna != null)
    this.dna = dna;
  else
    this.dna = new DNA(null, 500);

  this.time = 0;

  this.addForce = function(force) {
    this.vel.add(force);
  }

  this.update = function() {
    this.vel.mult(drag);
    this.pos.add(this.vel.copy().mult(speed));
    this.time += 1;
    this.time %= this.dna.seq.length;
  }

  this.display = function() {
    line(this.pos.x, this.pos.y,
      this.pos.x+this.vel.x, this.pos.y+this.vel.y);
  }

  this.getDna = function() {
    return this.dna.get(0+(this.time));
  }

  this.getVelMagSq = function() {
    return this.vel.x * this.vel.x + this.vel.y * this.vel.y;
  }
}

function DNA(seq, length) {
  if(seq) {
    this.seq = seq;
  } else {
    this.seq = [];
    for(var i = 0; i < length; i++) {
      this.seq.push(p5.Vector.random2D().mult(random(10)));
    }
  }

  this.get = function(i) {
    return this.seq[i];
  }

  this.merge = function(partner) {
    var newSeq = [];
    for(var i = 0; i < this.seq.length; i++) {
      newSeq.push((this.seq[i]+partner.seq[i])*.5);
    }
    return newSeq;
  }
}
