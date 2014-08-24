//SVG stuff
  var op = 'S'; 
function getD(pts) {
      return "M " + pts[0].x + " " + pts[0].y + ' ' + op + ' ' + pts.join(", ");
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
  
function addBC(svg,name, x, y,clr) {
  var p = document.getElementById('bc'+name) || document.createElementNS(svgNS,"circle");
  svg.appendChild(p);
  p.id = 'bc'+name;
  p.className = 'bc';
  p.setAttribute('class','bc');
  p.setAttribute('stroke',clr||'#f0f');
  p.setAttribute('stroke-width',1);
  p.setAttribute('fill','transparent');
  p.setAttribute('cx', x);
  p.setAttribute('cy', y);
  p.setAttribute('r', 3);
  return p;
}

function addTan(svg,name,x1,y1,x2,y2,clr) {
 var p = document.getElementById('tan'+name) || document.createElementNS(svgNS,"line");
  svg.appendChild(p);
  p.id = 'tan'+name;
  p.className = 'tan';
  p.setAttribute('class','tan');
  p.setAttribute('stroke',clr||'#03f');
  p.setAttribute('stroke-width',1);
  p.setAttribute('x1', x1);
  p.setAttribute('y1', y1);
  p.setAttribute('x2', x2);
  p.setAttribute('y2', y2);
  return p;
}
  
function addPath(svg,pts,name,clr) {
  if (document.getElementById(name||'path'))
    rePath(svg,pts,name);
  else {
    var p = document.createElementNS(svgNS,"path");
    svg.appendChild(p);
    p.id=name||'path';
    p.setAttribute('stroke',clr||'slategray');
    p.setAttribute('stroke-width',2);
    p.setAttribute('fill','transparent');
    p.setAttribute('d',getD(pts));

    return p;
  }
}

function rePath(svg,pts,name) {
if (!includeSvgPath) return;
  var currP = document.getElementById(name||'path');
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

function redrawWave(cpts,h,w) {
  var svg = document.getElementById('boo');
  if (includeSvgPath) { //&& useDeCasteljauPath) {
    //todo move to beginning?
    var d = "M " + cpts[0].x + ' ' + cpts[0].y ;
    d = cpts.reduce(function(p,c,i,a) {
      return p + " L " + c.x + ' ' + c.y;
    },d);
    var path = document.getElementById('path');
    if (path)
      path.setAttribute('d',d);
  }

  addPath(svg,pts,'svgPath','rgba(222,222,0,126)');

  if (drawBCs) {
      var tpts = ([pts[0]]).concat(pts); // start path w/ M pts[0] 
      var bcpts = expand(pts,pts.length); 
      var last=tpts[0];
      var lbc=bcpts[0];//tpts[0];
      var lbcm=lbc;
      var bcm=lbc;
      var bcms = expand(bcpts,bcpts.length); 
      var bcdms = expand(bcms,bcms.length); 
      var lbcdm = bcdms[0];
      
      var cpts=dc(pts,64);

      for (var i =0; i<ccpts.length;i++) {
        //if(i % (bcpts.length/64) == 0) {
          addBC(svg,i,cpts[i].x,cpts[i].y);
          /*bcm=bcms[i];//{x: (lbc.x + bcpts[i].x)/2, y: (lbc.y + bcpts[i].x)/2 };
          //addBC(svg,'bcm'+i,bcm.x,bcm.y,'orange')
          //addTan(svg,'lbcm'+i,lbcm.x,lbcm.y,bcm.x,bcm.y);

          //addBC(svg,'bcdm'+i,bcdms[i].x,bcdms[i].y,'blue')
          //addTan(svg,'lbcdm'+i,lbcdm.x,lbcdm.y,bcdms[i].x,bcdms[i].y,'limegreen');
           //addTan(svg,'lc'+i,last.x,last.y,tpts[i].x,tpts[i].y,'limegreen');
          //addTan(svg,'lbc'+i,lbc.x,lbc.y,bcpts[i].x,bcpts[i].y,'salmon');          
          //addTan(svg,'lbp'+i,lbc.x,lbc.y,tpts[i].x,tpts[i].y,'yellow');          
          last = tpts[i];
          lbc = bcpts[i];
          lbcm = bcm;
          lbcdm=bcdms[i];*/
        //}
      }

  }

}