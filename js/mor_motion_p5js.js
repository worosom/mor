/*
 * @name Mor Motion
 * @description Recording random movement as a continuous line.
 */

var num = 100;
var maxNum = 2000;
var range = 1;

var ax = [];
var ay = [];
var vax = [];
var vay = [];
var drag = .98;
var speed = 1.;
var groupForce = 20;
var mgroupForce = .00001;

var targetFPS = 40;
var avgFPS = 30;

function setup() {
  createCanvas(document.body.clientWidth, document.body.clientHeight, "WEBGL");
  for ( var i = 0; i < maxNum; i++ ) {
    ax[i] = random(width);
    ay[i] = random(height);
    vax[i] = random(-1,1);
    vay[i] = random(-1,1);
  }
  generateParameters();
}

function draw() {
  background(255, 255);
  update();
  stroke(0);
  strokeWeight(2.);
  // Draw a line connecting the points
  for ( var j = 0; j < num; j++ ) {
    line(ax[j], ay[j], ax[j]+vax[j], ay[j]+vay[j]);
  }
}

function update() {
  // Shift all elements 1 place to the left
  for ( var i = 1; i < num; i++ ) {
    ax[i - 1] = ax[i];
    ay[i - 1] = ay[i];
    vax[i - 1] = vax[i];
    vay[i - 1] = vay[i];
  }

  // Put a new value at the end of the array
  vax[num - 1] += random(-range, range);
  vay[num - 1] += random(-range, range);

  for( var i = 0; i < num; i++ ) {
    ax[i] += vax[i] * speed;
    ay[i] += vay[i] * speed;
    vax[i] *= drag;
    vay[i] *= drag;
    var dir = [mouseX - ax[i], mouseY - ay[i]];
    vax[i] += dir[0];
    vay[i] += dir[1];
    for(var j = 0; j < num; j++) {
      if(i != j) {
        var dir = [ax[j]-ax[i], ay[j]-ay[i]];
        var distSq = dir[0]*dir[0]+dir[1]*dir[1];
        
        vax[i] += dir[0] * (1./distSq) / num * groupForce;
        vay[i] += dir[1] * (1./distSq) / num * groupForce;
        
        vax[i] -= dir[0] * (1./distSq) / num * mgroupForce;
        vay[i] -= dir[1] * (1./distSq) / num * mgroupForce;
      }
    } 
    
    if(ax[i] < 0) {
      ax[i] = width;
    } else if(ax[i] > width) {
      ax[i] = 0;
    }if(ay[i] < 0) {
      ay[i] = height;  
    } else if(ay[i] > height) {
      ay[i] = 0;
    }
  }
  avgFPS += (frameRate() - avgFPS) * .1;
  if(avgFPS < targetFPS - 5) {
    num --;
  } else if (avgFPS > targetFPS) {
    num ++;
  }
}

function generateParameters() {
  drag = random(.9,1.);
  speed = random(.1,3.);
  range = random(.5,2.);
  groupForce = random(2,5);
  mgroupForce = random(.0001, .001); 
}

function mousePressed() {
  generateParameters();
}