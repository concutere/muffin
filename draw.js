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
  p.setAttribute('r', 15);
  return p;
}
  
function addBC(svg,name, x, y) {
  var p = document.getElementById('bc'+name) || document.createElementNS(svgNS,"circle");
  svg.appendChild(p);
  p.id = 'bc'+name;
  p.className = 'bc';
  p.setAttribute('class','bc');
  p.setAttribute('stroke','#c6f');
  p.setAttribute('strokeWidth',1);
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
  p.setAttribute('strokeWidth',5);
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
    pts.forEach(function (e,i,a) {
      var el = document.getElementById('bc'+i);
      if (el)
        svg.removeChild(el);
    });
}

function drawControls(svg) {
  for (var i = 1; i < pts.length-1; i++) {
    addControl(svg,'control'+(i),pts[i].x, pts[i].y);      
  }
}

function graphByteFreqs(freqs) {
  var g = document.getElementById('graph');
  if(g.className.baseVal=='hide') return;
  
  var svg = document.getElementById('boo');
  var h = svg.height.baseVal.value;
  var w = svg.width.baseVal.value;
  var step = Math.floor(freqs.length / w);
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
  var step = 1;//Math.floor(times.length / w);
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
    el.setAttribute('width', 2);
    el.setAttribute('height',2);
    if (!el.parentElement)
      g.appendChild(el);
  }
}