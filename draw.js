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
  var p = document.createElementNS(svgNS,"polyline");
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
      var el = document.getElementById('control'+i.toString());
      if (el)
        svg.removeChild(el);
    });
  /*var ctls = document.getElementsByTagNameNS(svgNS,'circle');
  for(var i = 0; i < ctls.length; i++) {
    var ctl = ctls[i];
    if (ctl.id.substr(0,7)=='control')
      svg.removeChild(ctl);
  }*/
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

function graphByteFreqs(freqs,clr,parent) {
  if (!drawFreqs) return;
  var g = document.getElementById(parent ? parent : 'graph');
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
    el.id='bytefreq'+(parent ? parent : '') + i;
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw);
    el.setAttribute('height',steph);
    if (!el.parentElement) {
      el.setAttribute('fill-opacity',0.75);
      el.setAttribute('fill',clr ? clr : 'chartreuse');
      g.appendChild(el);
    }
  }
}

function graphByteTimes(times,clr, parent) {
  var g = document.getElementById(parent ? parent : 'graph');
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
    var el = document.getElementById('bytetime'+(parent ? parent : '') + i) || document.createElementNS(svgNS,'rect')
    el.id='bytetime'+(parent ? parent : '') + i;
    el.setAttribute('x', i * stepw);
    el.setAttribute('y', y);
    el.setAttribute('width', stepw*2);
    el.setAttribute('height',h-y);
    if (!el.parentElement) {
      el.setAttribute('fill',clr ? clr : '#96b');
      g.appendChild(el);
    }
  }
}

function clearFreqs(g) {
    /* why does the following forEach only return even indexed elements?
  if (g && g.childNodes) {
    Array.prototype.forEach.call(g.childNodes, function(el) {{console.log(el.id);g.removeChild(el);} });
  }*/
  for (var i = 0; i <= 1024; i++) {
    var el = document.getElementById('bytefreq'+i);
    if (el) {
      g.removeChild(el);
    }
    el = document.getElementById('bytetime'+i);
    if (el) {
      g.removeChild(el);
    }
    el = document.getElementById('bytefreqmicgraph'+i);
    if (el) {
      g.removeChild(el);
    }
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
  if (p.points.length != pts.length+1) {
    p.points.clear();
    var last = svg.createSVGPoint();
    last.x=pts[0].x;
    last.y=pts[0].y;
    p.points.appendItem(last);
    for (var i = 0; i < pts.length; i++) {
      //todo colinearity test for better line use
      //if(Math.abs(pts[i].x - last.x) > 1 || Math.abs(pts[i].y - last.y) > 1) {
        last = pts[i];
        if(last) {
        var seg = svg.createSVGPoint();
        seg.x = last.x;
        seg.y = last.y;
        p.points.appendItem(seg);
      }
    }
  }
  else {
    for (var i = 0; i < pts.length; i++) {
      var seg = p.points.getItem(i+1);
      if(seg.x != pts[i].x) 
        seg.x=pts[i].x;
      if (seg.y != pts[i].y)  
        seg.y=pts[i].y;
    }
  }
}


///////////////////////////////////


// exponentialRampToValueAtTime calc
// v(t) = V0 * (V1 / V0) ^ ((t - T0) / (T1 - T0))
//

//TODO pts need to indicate when to use exponential / linear
function drawAdsr(pts) {
var w = 1000, h = 200;
  var g= document.getElementById('adsr');
  var p = g.parentElement;
  p.removeChild(g);
  p.appendChild(g);
  /*var b = document.getElementById('adsrb') || document.createElementNS(svgNS,'line');
  if(!b.parentElement) {
    b.id='adsrb';
    b.setAttribute('stroke','lightgray');
    b.setAttribute('x1',0);
    b.setAttribute('x2',w);
    b.setAttribute('y1',h);
    b.setAttribute('y2',h);
    g.appendChild(b);
  }*/
  var m = document.getElementById('adsrm') || document.createElementNS(svgNS,'line');
  if(!m.parentElement) {
    m.id='adsrm';
    m.setAttribute('stroke','lightgray');
    m.setAttribute('stroke-width',1.5);
    m.setAttribute('x1',0);
    m.setAttribute('x2',w);
    m.setAttribute('y1',h/2);
    m.setAttribute('y2',h/2);
    g.appendChild(m);
  }
  for (var i = 0; i < pts.length; i++) {
    if (i > 0) {
      var l = document.getElementById('adsrl'+i) || document.createElementNS(svgNS,'line');
      if (!l.parentElement) {
        l.id = 'adsrl'+i;
        l.setAttribute('stroke','black');//'lightsteelblue');
        l.setAttribute('stroke-width','0.5');
        g.appendChild(l);
      }
      l.setAttribute('x1',w-pts[i-1].x);
      l.setAttribute('y1',h-pts[i-1].y);
      l.setAttribute('x2',w-pts[i].x);
      l.setAttribute('y2',h-pts[i].y);
    }
  }
  for (var i = 0; i < pts.length; i++) {
    var el = document.getElementById('adsr'+i) || document.createElementNS(svgNS,'circle');
    if(!el.parentElement) {
      el.id = 'adsr'+i;
      el.setAttribute('r',5);
      el.setAttribute('fill','steelblue');
      g.appendChild(el);
    }
    
    el.setAttribute('cx',w-pts[i].x);
    el.setAttribute('cy',h-pts[i].y);
  }
}


function drawGraph(analyser) {
  /*var svg = document.getElementById('boo');
  var w= 1024;
  var h = 255;
*/

  if (drawFreqs) {
    drawGraphFreqs(analyser);
  }
  else {
    var times = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(times);
    graphByteTimes(times);
  }
}

function drawGraphFreqs(analyser) {
  var freqs = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqs);
  graphByteFreqs(freqs);
}

function drawGraphData(data) {
  var svg = document.getElementById('boo');
  var w= 1024;
  var h = 255;

  data=Array.prototype.map.call(data,function(e) { return 128 + e * 127; });
  //for(var i = 0; i < w && i < data.length; i++) {
   // graphByteTimes(data);
  //}
  
}


//////////////////////////////////////////////////////////////


