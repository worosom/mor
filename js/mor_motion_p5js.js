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
var c = 900000;
var num = 100;
var avgNum = 10;
var maxNum = 2000;

var population;

var drag = .99;
var speed = 1.*((w*h)/c);
var groupForce = .2;
var mgroupForce = .15;
var repulsion = 1.;

var targetFPS = 60;
var avgFPS = 60;

var flowFieldRes = 10;
var flowField = [[], []];

function FlowVec(pos) {
  this.visc = .5;
  this.pos = pos;
  this.dir = p5.Vector.random2D();
  this.rotate = function(to) {
    var mag = to.mag();
    to.normalize();
    this.dir.add(p5.Vector.sub(to, this.dir).mult(-mag * this.visc));
    this.dir.normalize();
  }
}

function setup() {
  createCanvas(w, h, "WEBGL");
  for(var _x = 0; _x <= flowFieldRes; _x++) {
    var x = [];
    for(var y = 0; y <= flowFieldRes *(h/w); y ++) {
      var pos = createVector();
      pos.x = _x / flowFieldRes * width;
      pos.y = y / (flowFieldRes * (h/w)) * height;
      x.push(new FlowVec(pos));
    }
    flowField.push(x);
  }
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
  strokeWeight(1);
  /*
  for(var x = 0; x < flowField.length; x++) {
    for(var y = 0; y < flowField[x].length; y++) {
      push();
      translate(flowField[x][y].pos.x, flowField[x][y].pos.y);
      rotate(flowField[x][y].dir.heading());
      line(2.5, 0, -2.5, 0);
      pop();
    }
  }
   */
}

function Population() {
  this.cells = [];

  for ( var i = 0; i < num; i++ ) {
    this.cells.push(new Cell());
  }

  this.update = function() {
   for(var i = 0; i < this.cells.length; i++) {
    this.cells[i].update();
    var velMag = this.cells[i].vel.mag();
     velMag *= 100.;
     velMag += .1;
    //this.cells[i].addForce(p5.Vector.random2D().mult(1/velMag));

    for (var j = 0; j < this.cells.length; j++) {
      if (i != j) {
        var dir = p5.Vector.sub(this.cells[i].pos, this.cells[j].pos);
        var dist = dir.x*dir.x+dir.y*dir.y;
        var force = cubicPulse(400, 100, dist);
        var mForce = cubicPulse(1000, 4900, dist);
        var repForce = cubicPulse(0, 400, dist);

        var forceVec = dir.copy();
        forceVec.mult(force * groupForce * this.cells[i].getDna().x);
        this.cells[i].addForce(forceVec);
        this.cells[j].addForce(forceVec.mult(-1.));

        forceVec = p5.Vector.sub(this.cells[i].vel, this.cells[j].vel);
        forceVec.mult(mForce * mgroupForce * this.cells[i].getDna().z);
        this.cells[i].addForce(forceVec);

        forceVec = dir.copy().mult(- repForce * 1/dist * repulsion);
        this.cells[i].addForce(forceVec);
      }
    }
     
    for(var x = 0; x < flowField.length; x++) {
      for(var y = 0; y < flowField[x].length; y++) {
        var dir = p5.Vector.sub(this.cells[i].pos, flowField[x][y].pos);
        var distSq = dir.x * dir.x + dir.y * dir.y;
        var force = cubicPulse(0, 2500*2, distSq);
        this.cells[i].rotate(dir.normalize(), force);
        this.cells[i].addForce(dir.normalize().mult(force*.01));
        flowField[x][y].rotate(this.cells[i].vel.copy().mult(force));
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
    var minDist = width/flowFieldRes;
    var minDistSq = minDist * minDist;
    strokeWeight(1);
    for(var i = 0; i < this.cells.length; i++) {
      var connections = 0;
      for(var j = 0; j < this.cells.length; j++) {
        if(i != j) {
          var dir = p5.Vector.sub(this.cells[j].pos, this.cells[i].pos);
          var distSq = dir.x * dir.x + dir.y * dir.y;
          if(distSq < minDistSq && connections < 5) {
            stroke(0, map(distSq, 0, minDistSq, 127, 0));
            line(this.cells[j].pos.x, this.cells[j].pos.y, this.cells[i].pos.x, this.cells[i].pos.y);
            connections ++;
          }
        }
      }
      //this.cells[i].display();
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

  this.rotate = function(to, force) {
    var mag = to.mag();
    to.normalize();
    this.vel.add(p5.Vector.sub(to, this.dir).mult(mag * force));
  }

  this.update = function() {
    this.vel.mult(drag);
    //this.vel.add(this.getDna().x*.5, this.getDna().y*.5);
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
      this.seq.push(p5.Vector.random2D().add(1, 1).mult(random(1)));
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

  this.clone = function() {
    var temp = new DNA(this.seq, null);
    return temp;
  }
}

function Brain(dna) {
  this.dna = dna;
}
