//SVG stuff
  var op = 'S'; //using S w/o slice (below) gives all pts on the actual curve
  //C w/ slice(1) on pts.join below
function getD(pts) {

    return "M " + pts[0].x + ", " + pts[0].y + ' ' + op + ' ' + pts.join(", ");
}
var svgNS = "http://www.w3.org/2000/svg";
function addControl(svg,name, x, y) {
  var p = document.getElementById(name) || document.createElementNS(svgNS,"circle");
  p.id = name;
  p.setAttribute('cx',x);
  p.setAttribute('cy',y);
  if (!p.parentElement) {
    p.className = 'control';
    p.setAttribute('strokeWidth',0);
    p.setAttribute('fill','orangered');
    p.setAttribute('r', 5);
    svg.appendChild(p);
  }
  return p;
}
  
function addBC(svg,name, x, y) {
  var p = document.getElementById('bc'+name) || document.createElementNS(svgNS,"circle");
  p.id = 'bc'+name;
  p.setAttribute('cx', x);
  p.setAttribute('cy', y);
  if (!p.parentElement) {
    p.className = 'bc';
    p.setAttribute('class','bc');
    p.setAttribute('stroke','#f0f');
    p.setAttribute('stroke-width',1);
    p.setAttribute('fill','transparent');
    p.setAttribute('r', 3);
    svg.appendChild(p);
  }
  return p;
}
  
function addPath(svg,pts) {
  var p = document.createElementNS(svgNS,"path");
  svg.appendChild(p);
  p.id='path';
  p.setAttribute('stroke','slategray');
  p.setAttribute('stroke-width',2);
  p.setAttribute('fill','transparent');
  //p.setAttribute('d',getD(pts));

  return p;
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
    for (var i = 0; i <= bezSize; i+=64) {
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
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw);
    el.setAttribute('height',steph);
    if (!el.parentElement) {
      el.setAttribute('fill','chartreuse');
      g.appendChild(el);
    }
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
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw*2);
    el.setAttribute('height',stepw*2);
    if (!el.parentElement) {
      el.setAttribute('fill','#f0f');
      g.appendChild(el);
    }
  }
}

function clearFreqs(g) {
  for (var i = 0; i <= 1024; i++) {
    var el = document.getElementById('bytefreq'+i);
    if (el)
      g.removeChild(el);
  }
}



/////////////////////



function aPentatonic(svg,i,w) {
  var q = document.getElementById('pentatonic'+i) || document.createElementNS(svgNS,'rect');
  var step = w/6;
  var x = step * (i-1);
  var color = 'rgb(' + Math.round(240 - 7*i) + ',' + Math.round(240 - 7*i) + ',' + Math.round(244 + 2*i) + ')';

     
  if (!q.parentElement) {
    q.id = 'pentatonic'+i;
    
    q.setAttribute('class','pentatonic');
    q.setAttribute('fill',color);
    q.setAttribute('stroke','transparent');
    q.setAttribute('x',x);
    q.setAttribute('width',step);
    q.setAttribute('height',10);
    q.setAttribute('y',0);
    
    svg.appendChild(q);
  }
  
  return q;
}


/////////////////////////////


function drawWave(pts) {
  var svg = document.getElementById('boo');
  
  var p = document.getElementById('path');
  if (p.pathSegList.length != pts.length+1) {
    p.pathSegList.clear();
    var last = p.createSVGPathSegMovetoAbs(pts[0].x,pts[0].y);
    p.pathSegList.appendItem(last);
    for (var i = 0; i < pts.length; i++) {
      //todo colinearity test for better line use
      //if(Math.abs(pts[i].x - last.x) > 1 || Math.abs(pts[i].y - last.y) > 1) {
        last = pts[i];
        var seg = p.createSVGPathSegLinetoAbs(last.x,last.y);
        p.pathSegList.appendItem(seg);
      //}
    }
  }
  else {
    for (var i = 0; i < pts.length; i++) {
      var seg = p.pathSegList.getItem(i+1);
      if(seg.x != pts[i].x) seg.x=pts[i].x;
      if (seg.y != pts[i].y) seg.y=pts[i].y;
    }
  }
}