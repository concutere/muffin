//event handlers
var boo = document.getElementById('boo');
var ctlid = undefined;
var lastPitch = undefined;

function savePathsLocal(paths) {
  if(paths==undefined) paths || samplePaths;
  for (var i =0; i < paths.length; i++) {
    window.localStorage.setItem('samplePath'+i, paths[i]);
  }
}

function loadPathsLocal() {
  var paths = [];
  for (var i = 0; i < 10; i++) {
    var tmp = window.localStorage.getItem('samplePath'+i);
    if(tmp) {
      paths[i]=tmp.split(',');
      paths[i]=paths[i].map(function(e,i,a) { return parseInt(e); });
    }
  }
  if (paths.length > 1)
    samplePaths=paths;
  return paths;
}

function clearPathsLocal() {
  window.localStorage.removeItem('samplePaths');
}

var pts=[];
function init(e) {
  var controlpts=8;
  var svg = document.getElementById('boo');
  var w = svg.width.baseVal.value;
  var h = svg.height.baseVal.value;
  if(w == 0 || h == 0) {
    setTimeout(init,1);
    return;
  }
  var yy = h/2;
  pts=[];
  pp=[];
  //for (var i = 0; i <= 1; i+=1/(controlpts-1)) {
  for (var i = 1; i < samplePaths[4].length; i+=2) {
    var xx = samplePaths[4][i-1];//Math.round(i * w)
    yy=samplePaths[4][i];
    var pt = { x: xx, y: yy, toString: function() { return this.x + ' ' + this.y; } };
    pts.push(pt);
    pp.push(xx);
    pp.push(yy);
  }
  samplePaths = ([pp]).concat(samplePaths);
  
  if (includeSvgPath) 
    addPath(svg,pts);

  drawControls(svg,pts);
  
  //pentatonic scale 'keys'
  for (var i = 1; i <=6; i++) {
    var e=aPentatonic(svg,i,w);
  }
  
  newWave = reWave(pts,h,w);
}

var drag=false;
function down (e) {
  var el = e.srcElement || e.target;
  if(el.id.indexOf('control')==0) {
    ctlid = parseInt(el.id.substr(7));
    drag=true;
    document.addEventListener('mousemove',move);
  }
  else if(el.id=='pitch') {
    lastPitch = 0;
    document.addEventListener('mousemove',movePitch);
  }
  else if(el.id.indexOf('pentatonic')==0) {
    var i=el.id.substr(10);
    handlePentatonic(i);
  }
}

function up(e) {
  lastHz=hz;
  hz=undefined;
  ctlid = undefined;
  lastPitch=undefined;
  if (drag)
    document.removeEventListener('mousemove',move);
  else 
    document.removeEventListener('mousemove',movePitch);
  drag=false;
  }

function handlePentatonic(i) {
  //if (isNaN(hz))
  i=parseInt(i);
  hz=initHz/2 * (i+4)/5; //pentatonic harmonic series, but start lower octave or overtones from the curves could get painful
  stream();
}

function movePitch(e) {
  if (isNaN(hz)) {
    stream();
  }
  lastPitch = e.clientX;
  var centWt = 1;

  // major scale
  cents=getCents(centWt, lastPitch, boo.width.baseVal.value);
  if (cents < 100) 
    cents = 0;
  else if (cents < 300)
    cents = 200;
  else if (cents < 400)
    cents = 400;
  else if (cents < 600)
    cents = 500;
  else if (cents < 800)
    cents = 700;
  else if (cents < 1000)
    cents = 900;
  else if (cents < 1100)
    cents = 1100;
  else 
    cents = 1200;
    
  function getCents(centWt,p,w) {
    return centWt*Math.round((1200 * p/w)/centWt);
  }
  var el = document.getElementById('pitch');
  el.setAttribute('x', e.clientX-25);
}

function move(e) {
  if (ctlid == undefined || !drag)
    return;
    
  if (isNaN(hz)) {
    hz=lastHz;
    stream();
  }
  var el = e.srcElement || e.target;
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  var x = e.clientX;
  var y = e.clientY;
  var id = el.id;
  if(ctlid >0 && ctlid < pts.length-1) {
    var i = ctlid;
    var ctl = document.getElementById('control'+ctlid);
    var pt= pts[ctlid];
    pt.x = x;
    pt.y = y;
    ctl.setAttribute('cx',x);
    ctl.setAttribute('cy',y);

    rePath(boo,pts);
    newWave = reWave(pts,h,w); //h/2,w/2);
  }
}

function rept(e) {
  if(e.clientY <=10) return;
  var el = e.srcElement || e.target;
  var cx = e.clientX, cy = e.clientY;
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  if(el.id.indexOf('control')==0) {
    // remove point
    var ctlid = parseInt(el.id.slice(7));
    if (isNaN(ctlid)) ctlid = pts.length-2;
    var del = document.getElementById('control'+ctlid);
    del.parentElement.removeChild(del);

    //cleanup deCasteljau ref pts
    if (useDeCasteljauPath) {
      for (var i = 0; i < 64; i++) {
        el=document.getElementById('bc'+(i*64));
        if (el) 
          (el.parent||boo).removeChild(el);
      }
    }
    //fix control circle names for id > ctlid
    for (var i = ctlid+1;i<pts.length-1;i++) {
      var rel = document.getElementById('control'+i);
      if(rel) 
        rel.id = 'control'+(i-1);
    }

    var pre=pts.slice(0,ctlid)
    var post=pts.slice(ctlid+1);
    pts=pre.concat(post);

    //rePath(boo,pts);
  }
  else {
    var inid = pts.length-1;
    var ptd=undefined;
    var mind=0;
    var scale = 2;
    var bcpts = curve(pts,(pts.length)*scale,true); // gives midpoints
    var bci=bcpts.length-1;
    for (var i = 0; i < bcpts.length; i++) {
      var dx = Math.pow(cx-bcpts[i].x,2);
      var dy = Math.pow(cy-bcpts[i].y,2);
      var d = Math.sqrt((dx + dy)/2);
      if (mind==0 || d < mind) {
        mind = d;
        bci = i;
        inid=Math.max(1,
              Math.min(pts.length-1,
                Math.round((i+scale/2)/scale)));
        ptd={x: cx, y: cy, toString: function() { return this.x + ' ' + this.y;}};
      }
    }
    if (ptd==undefined) {
      ptd={x: pts[pts.length-1].x, y: pts[pts.length-1].y, toString: function() { return this.x + ' ' + this.y;}};
      inid=pts.length-1;
    }

    var pre = pts.slice(0,inid);
    var post = pts.slice(inid);
    pre.push(ptd);
    pts=pre.concat(post);
    var name ='control'+inid;
   //fix control circle names for id > ctlid
    for (var i = pts.length-2;inid<=i;i--) {
      var rel = document.getElementById('control'+i);
      if (rel)
        rel.id = 'control'+(i+1);
    }
    addControl(boo, name,ptd.x, ptd.y);
    //rePath(boo,pts);
  }
}

//TODO move slide related stuff to separate file
var slide = 0;
function type(e) {
  //key handler
  var k =e.keyIdentifier;
  var arrows = ['Up','Right','Left','Down'];
  if(arrows.indexOf(k)>=0) {
    var el = document.getElementById('slide'+slide);
    if (arrows.indexOf(k) % 2 != 0) {
      slide += 1; 
    }
    if (el)
      el.className='roll' + k;
  }
  else if(e.keyCode==27) { //escape
    newWave = undefined;
  }
  else if(e.keyCode==83) { // S - sine 
    wave='sine';
  }
  else if(e.keyCode==84) { // T - triangle
    wave='triangle';
  }
  else if(e.keyCode==87) { // W - sawtooth
    wave='sawtooth';
  }
  else if (e.keyCode==81) { // Q - square
    wave='square';
  }
  else if (e.keyCode==65) { // A - toggle ADSR (basic linear)
    useAdsr=!useAdsr;
  }
  else if (e.keyCode==69) { // E - echo
    addSustain=!addSustain;
  }
  else if(e.keyCode==70) { // F - toggle show freqs
    drawFreqs=!drawFreqs;
    clearFreqs(document.getElementById('graph'));
  }
  else if(e.keyCode==67) { // C - custom
    wave='custom';
  }
  else if (e.keyCode==71) { // G - toggle sound graph
    var g = document.getElementById('graph');
    if (g.className.baseVal == 'hide')
      g.className.baseVal = '';
    else 
      g.className.baseVal = 'hide';
  }
  else if (e.keyCode==77) { //M - toggle mute
    mute = !mute;
  }
  else if(e.keyCode>=48 && e.keyCode <=57) { //num key
    k = e.keyCode-48;
    if (e.shiftKey) {
      slide = k;
    }
    else if (e.altKey) { //record sound
      var pp = [];
      for (var i = 0; i < pts.length; i++) {
        pp.push(pts[i].x);
        pp.push(pts[i].y);
      }
      samplePaths[k]=pp;
    }
    else { //load sound
      var newpts=[];
      var pp = samplePaths[k];
      if (!pp || pp.constructor != Array)
        return;
      for (var i = 1; i < pp.length; i+=2) {
        newpts.push({x: pp[i-1], y: pp[i], toString: function() { return this.x + " " + this.y; }});
      }
      clearControls(boo);
      clearBCs(boo);
      pts = newpts;
      drawControls(boo);
      newWave=reWave(pts,boo.height.baseVal.value, boo.width.baseVal.value);
      if(k==0)
        newWave = undefined; 
    }
  }
}

/////////////////////

document.addEventListener('mousedown', down);
document.addEventListener('touchstart', function (e) {
  down(e.touches[0]);
});
document.addEventListener('mouseup', up);
document.addEventListener('touchend', up);

function mousemove(e) {
  if (e.which == 0) {
    // no clicky, no draggy
    return;
  }
  if(ctlid) {
    move(e);
  }
  else if(!isNaN(lastPitch)) {
    movePitch(e);
  }
}

/*document.addEventListener('touchmove',function(e) {
  move(e.touches[0]);
});*/
document.addEventListener('dblclick', rept);
document.addEventListener('keyup',type);
document.addEventListener('DOMContentLoaded', init);
