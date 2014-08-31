//SVG stuff
  var op = 'S'; //using S w/o slice (below) gives all pts on the actual curve
  //C w/ slice(1) on pts.join below
  
function getD(pts) {

    return "M " + pts[0].x + ", " + pts[0].y + ' ' + op + ' ' + pts.join(", ");
}
var svgNS = "http://www.w3.org/2000/svg";
function addControl(svg,name, x, y) {
  var p = document.createElementNS(svgNS,"circle");
  svg.appendChild(p);
  p.id = name;
  p.className = 'control';
  p.setAttribute('strokeWidth',0);
  p.setAttribute('fill','orangered');
  p.setAttribute('cx', x);
  p.setAttribute('cy', y);
  p.setAttribute('r', 10);
  return p;
}
  
function addBC(svg,name, x, y) {
  var p = document.getElementById('bc'+name) || document.createElementNS(svgNS,"circle");
  svg.appendChild(p);
  p.id = 'bc'+name;
  p.className = 'bc';
  p.setAttribute('class','bc');
  p.setAttribute('stroke','#f0f');
  p.setAttribute('stroke-width',1);
  p.setAttribute('fill','transparent');
  p.setAttribute('cx', x);
  p.setAttribute('cy', y);
  p.setAttribute('r', 3);
  return p;
}
  
function addPath(svg,pts) {
  var p = document.createElementNS(svgNS,"path");
  svg.appendChild(p);
  p.id='path';
  p.setAttribute('stroke','slategray');
  p.setAttribute('stroke-width',2);
  p.setAttribute('fill','transparent');
  p.setAttribute('d',getD(pts));

  return p;
}

function rePath(svg,pts) {
if (!includeSvgPath) return;
  var currP = document.getElementById('path');
  if(currP) {
    var d = getD(pts);
    currP.setAttribute('d', d);
  }
}

function clearControls(svg) {
  if(pts)
    pts.forEach(function (e,i,a) {
      var el = document.getElementById('control'+i);
      if (el)
        svg.removeChild(el);
    });
}


function clearBCs(svg) {
  if(pts)
    for (var i = 0; i <= 4096; i+=64) {
      var el = document.getElementById('bc'+i);
      if (el)
        svg.removeChild(el);
    }
}

function drawControls(svg) {
  for (var i = 1; i < pts.length-1; i++) {
    addControl(svg,'control'+(i),pts[i].x, pts[i].y);      
  }
}

function graphByteFreqs(freqs) {
  if (!drawFreqs) return;
  var g = document.getElementById('graph');
  if(g.className.baseVal=='hide') return;
  
  var svg = document.getElementById('boo');
  var h = svg.height.baseVal.value;
  var w = svg.width.baseVal.value;
  var step = Math.max(1,Math.floor(freqs.length / w));
  var steps = w;
  var stepw = step;

  for (var i = 0; i < freqs.length; i+=stepw) {
    var ratio = freqs[i]; // / 256; 
    var steph = ratio; // * h;
    var y = h - steph - 1;
    var el = document.getElementById('bytefreq'+i) || document.createElementNS(svgNS,'rect')
    el.id='bytefreq'+i;
    el.setAttribute('fill','chartreuse');
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw);
    el.setAttribute('height',steph);
    if (!el.parentElement)
      g.appendChild(el);
  }
}

function graphByteTimes(times) {
  var g = document.getElementById('graph');
  if(g.className.baseVal=='hide') return;

  var svg = document.getElementById('boo');
  var h = svg.height.baseVal.value;
  var w = svg.width.baseVal.value;
  var step = Math.max(1,Math.floor(times.length / w));
  var steps = w;
  var stepw = step;

  for (var i = 0; i < times.length; i+=1) {
    var ratio = times[i]; // / 256; 
    var steph = ratio; // * h;
    var y = h - steph - 1;
    var el = document.getElementById('bytetime'+i) || document.createElementNS(svgNS,'rect')
    el.id='bytetime'+i;
    el.setAttribute('fill','#f0f');
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw*2);
    el.setAttribute('height',stepw*2);
    if (!el.parentElement)
      g.appendChild(el);
  }
}

function clearFreqs(g) {
  for (var i = 0; i <= 1024; i++) {
    var el = document.getElementById('bytefreq'+i);
    if (el)
      g.removeChild(el);
  }
}


function aPath(svg,id,pts) {
  var p = document.createElementNS(svgNS,"path");
  svg.appendChild(p);
  p.id=id;
  p.setAttribute('stroke','red');
  p.setAttribute('stroke-width',1);
  p.setAttribute('fill','transparent');
  if (pts instanceof Array && pts.length > 0)
    p.setAttribute('d',getD(pts));

  return p;
}

function aLine(svg,id,a,b) {
  var p = document.createElementNS(svgNS,"line");
  svg.appendChild(p);
  p.id=id;
  p.setAttribute('stroke','limegreen');
  p.setAttribute('stroke-width',1);
  p.setAttribute('fill','transparent');
  if (a && b) {
    p.setAttribute('x1',a.x);
    p.setAttribute('y1',a.y);
    p.setAttribute('x2',b.x);
    p.setAttribute('y2',b.y);
  }
  
  return p;
}