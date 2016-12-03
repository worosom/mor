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

var num = 100;
var avgNum = 100;
var maxNum = 2000;
var range = 1;

var ax = [];
var ay = [];
var vax = [];
var vay = [];

var drag = .999;
var speed = .5;
var groupForce = .002;
var mgroupForce = .0001;
var repulsion = .1;

var targetFPS = 40;
var avgFPS = 30;

function setup() {
  createCanvas(w, h, "WEBGL");
  for ( var i = 0; i < maxNum; i++ ) {
    ax[i] = random(width);
    ay[i] = random(height);
    vax[i] = random(-1,1);
    vay[i] = random(-1,1);
  }
  //generateParameters();
}

function draw() {
  background(255, 127);
  update();
  stroke(0);
  strokeWeight(2.);
  // Draw a line connecting the points
  for ( var j = 0; j < avgNum; j++ ) {
    line(ax[j], ay[j], ax[j]+vax[j], ay[j]+vay[j]);
  }
  avgNum += (num - avgNum) * .01;
}

function mousePressed() {
  for ( var i = 0; i < maxNum; i++ ) {
    ax[i] = random(width);
    ay[i] = random(height);
  }
}

function update() {
  // Shift all elements 1 place to the left

  // Put a new value at the end of the array
  if(random(1) > .7) {
    vax[num-1] += random(-range, range);
    vay[num-1] += random(-range, range);
  }

  for ( var i = 0; i < num; i++ ) {
    ax[i] += vax[i] * speed;
    ay[i] += vay[i] * speed;
    vax[i] *= drag;
    vay[i] *= drag;
    var mDist = [mouseX - ax[i], mouseY - ay[i]];
    var mLen = mDist[0] * mDist[0] + mDist[1] * mDist[1];
    mLen += .5;
    
    var mDir = [mouseX - pmouseX, mouseY - pmouseY];
    vax[i] += mDir[0] * (1./(mLen / 8.))*2.;
    vay[i] += mDir[1] * (1./(mLen / 8.))*2.;
    
    var velMagSq = vax[i]*vax[i]+vay[i]*vay[i];
    velMagSq *= 4.;
    velMagSq += 1.;
    vax[i] += random(-.5, .5) * 1/velMagSq;
    vay[i] += random(-.5, .5) * 1/velMagSq;
    
    for (var j = 0; j < num; j++) {
      if (i != j) {
        var dir = [ax[j]-ax[i], ay[j]-ay[i]];
        var dist = sqrt(dir[0]*dir[0]+dir[1]*dir[1]);
        
        var force = cubicPulse(20, 10, dist);
        var mForce = cubicPulse(100, 70, dist);
        var repForce = cubicPulse(0, 20, dist);
        vax[i] += (dir[0]) * force * groupForce;
        vay[i] += (dir[1]) * force * groupForce;
        vax[j] -= (dir[0]) * force * groupForce;
        vay[j] -= (dir[1]) * force * groupForce;

        //dist *= dist;
        //dist += .5;
        
        vax[i] += (vax[j]-vax[i]) * mForce * mgroupForce;
        vay[i] += (vay[j]-vay[i]) * mForce * mgroupForce;
        
        vax[i] -= dir[1] * repForce * 1/dist * repulsion;
        vay[i] -= dir[0] * repForce * 1/dist * repulsion;
      }
    } 

    if (ax[i] < 0) {
      ax[i] = width;
    } else if (ax[i] > width) {
      ax[i] = 0;
    }
    if (ay[i] < 0) {
      ay[i] = height;
    } else if (ay[i] > height) {
      ay[i] = 0;
    }
  }
  avgFPS += (frameRate() - avgFPS) * .05;
  if (avgFPS < targetFPS - 5 && num > 0) {
    num --;
  } else if (avgFPS > targetFPS && num < maxNum) {
    if (num <= maxNum) {
      num ++;
    }
  }
}

function generateParameters() {
  drag = random(.99, 1.);
  speed = random(.01, 1.);
  range = random(.25, 1.);
  groupForce = random(0.00001, .01);
  mgroupForce = random(.001, 10.01);
}

function cubicPulse(c, w, x) {
  x = abs(x-c);
  if( x > w ) return 0.0;
  x /= w;
  return 1.0 - x*x*(3.0-2.0*x);
}