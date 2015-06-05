//event handlers
var boo = document.getElementById('boo');
var ctlid = undefined;
var hasMidiInput = false;

function hideEl(el, baseClass) {
  var g;
  if (typeof el == 'string')
    g = document.getElementById(el);
  else 
    g = el;
  if (g.className.baseVal == 'hide')
    g.className.baseVal = baseClass ? baseClass : '';
  else 
    g.className.baseVal = 'hide';
}
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

var m=null;
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
  else if (recording) {
    initRecord();
    return;
  }
  var yy = h/2;
  pts=[];
  pp=[];
  for (var i = 0; i <= 1; i+=1/(controlpts-1)) {
  //for (var i = 1; i < samplePaths[4].length; i+=2) {
    var xx = /*samplePaths[4][i-1];*/Math.round(i * w)
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
  /*for (var i = 1; i <=6; i++) {
    var e=aPentatonic(svg,i,w);
  }
  */
  
  newWave = reWave(pts,h,w);
  if (canMidi())
    navigator.requestMIDIAccess().then(gotMIDI,function (e) { console.log('error!\n'+e);});

  

}

function canMidi() {
  return (navigator.requestMIDIAccess) instanceof Function;
  //MIDI doesn't seem to be optional in chrome://flags anymore, need better test/switch
}

function hasMidi() {
  return hasMidiInput && canMidi();
}

var adsrid=undefined;
var drag=false;
var deftone=undefined;
function down (e) {
  var el = e.srcElement || e.target;
  if(el.id.indexOf('control')==0) {
    ctlid = parseInt(el.id.substr(7));
    drag=true;
    document.addEventListener('mousemove',move);
    if (!hasMidi())
      deftone = play(initHz,1);
  }
  /*else if(el.id=='pitch') {
    lastPitch = 0;
    document.addEventListener('mousemove',movePitch);
  }
  else if(el.id.indexOf('pentatonic')==0) {
    var i=el.id.substr(10);
    handlePentatonic(i);
  }*/
  else if (el.id.indexOf('adsr')==0) {
    adsrid = el.id.substr(4);
    adsrPts = joe.goggles(1000,100);
    document.addEventListener('mousemove',moveAdsr);
  }
}

function up(e) {
  ctlid = undefined;
  lastPitch=undefined;
  if(deftone) {
    deftone['stop']=true;
    deftone=undefined;
  }
  if(adsrid)
    document.removeEventListener('mousemove',moveAdsr);
  else if (drag)
    document.removeEventListener('mousemove',move);
  /*else 
    document.removeEventListener('mousemove',movePitch);
  */drag=false;
  adsrid = undefined;
  }

function handlePentatonic(i) {
  //if (isNaN(hz))
  i=parseInt(i);
  var hz=initHz/2 * (i+4)/5; //pentatonic harmonic series, but start lower octave or overtones from the curves could get painful
  play(hz);
}

/*function movePitch(e) {
  if (isNaN(hz)) {
    play();
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
*/

function move(e) {
  if (ctlid == undefined || !drag)
    return;
    
  /*if (isNaN(hz)) {
    //hz=lastHz;
    play(lastHz);
  }*/
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
    
    pt.y = y;
    ctl.setAttribute('cy',y);
    if (!fixX) {
      pt.x = x;
      ctl.setAttribute('cx',x);
    }

    newWave = reWave(pts,h,w);
  }
}

function moveAdsr(e) {
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  var x = e.clientX;
  var y = e.clientY;
  var el = e.srcElement || e.target;
  var i  = adsrid;
  //TODO refactor fixed adsr w/h away
  adsrPts[i]=newPt(Math.min(1000,Math.max(0,1000-x)),Math.min(200,Math.max(0,200-y)));
  (joe.spill())[i]=newPt((1000-adsrPts[i].x)/1000,adsrPts[i].y/100);
  drawAdsr(adsrPts);
}

/////////////////////////////////////////////////

var awave;
var awaveid=0;

function rept(e) {
  if(e.clientY <=10) return;
  var el = e.srcElement || e.target;
  var cx = e.clientX, cy = e.clientY;
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  if (el.id.indexOf('adsr')==0) {
    var idx=el.id.substr(4);
    if(!isNaN(idx)) {
      idx=parseInt(idx);
      
      var wave = joe.awave(idx);
      awave = wave;
      var prevel = document.getElementById('adsr'+awaveid);
      prevel.className.baseVal = '';
      awaveid = idx;
      el.className.baseVal='sel';
      if (wave) {
        pts=wave.slice(0);
        newWave=reWave(pts,h);
      }
    }
    else if(idx.indexOf('adsrl')==0) {
      var i = el.id.substr(5);
      var pt=newPt(1000-cx,200-cy);
      var pre=adsrPts.slice(0,i)
      var post=adsrPts.slice(i);
      adsrPts=pre.concat([pt],post);

      joe = new Joe(adsrPts.map(function (e) { return newPt((1000-e.x)/1000,e.y/100); }));
      drawAdsr(adsrPts);
    }
  }
  else if(el.id.indexOf('control')==0) {
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
    
    if (fixX) {
      fixXs();
      drawControls(boo);
    }
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
        ptd={x: (fixX ? i * w/(pts.length): cx), y: cy, toString: function() { return this.x + ' ' + this.y;}};
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
    if (fixX) {
      fixXs(boo);
      drawControls(boo);
    }
    else
      addControl(boo, name,ptd.x, ptd.y);
  }
  reWave(pts,h,w);
  
}
function fixXs() {
  var seglen = boo.width.baseVal.value / (pts.length-1);
  for (var i = 0;i < pts.length; i++) {
    pts[i].x = seglen * i;
  }
}

var loopd;
//TODO move slide related stuff to separate file
var slide = 0;
var lastframe = lastbuf = 0;
function type(e) {
var framestep = bufstep = 0;
  //key handler
  var k =e.keyIdentifier;
  var arrows = ['Up','Right','Down','Left'];
  var idx = arrows.indexOf(k);
  if(idx>=0) {
    if(mic.isrecording()) {
      mic.pause();
      lastframe = mic.framesize() -1;
    }
    if (idx % 2 == 0) {
      framestep = idx * 2 - 1;
      bufstep=lastbuf=0;
    }
    else {
      bufstep = -8 * ((idx - 2));
      lastbuf+=bufstep;
      if (lastbuf < -1023) {
        framestep=-1;
        bufstep=lastbuf=0;//+=1024;
      }
      else if (bufstep > 1023) {
        framestep = 1;
        bufstep=lastbuf=0;//-= 1024;
      }
      else
        framestep=0;
    }
    lastframe = Math.min(mic.framesize()-1, Math.max(0, lastframe+framestep));
    var frame = mic.frame(lastframe);
    if (lastbuf < 0 && lastframe > 0) {
      var pre = mic.frame(lastframe-1).slice(1024+lastbuf)
      frame = pre.concat(frame.slice(0,1024+lastbuf));
    }
    else if (lastbuf > 0 && lastframe < mic.framesize()-1) {
      var post = mic.frame(lastframe+1).slice(0,lastbuf);
      frame=frame.slice(lastbuf).concat(post);
    }
      
    requestAnimationFrame(function() {drawGraphData(frame)});
  }
  
  //TODO why doesn't Chrome ever set repeat to true?
  if(e.repeat)
    return;
    
  if(e.keyCode==27) { //escape
    cancelAll();
  }
  /*else if(e.keyCode==83) { // S - sine 
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
  }*/
  else if(e.keyCode==82) { // R - record mic
    if(recording) {
      //stop recording
      stopRecord();
    }
    else {
      initRecord();
    }
    recording = !recording;
  }
  else if (e.keyCode == 83) { //use smoother
    clearControls(boo);
    if(e.shiftKey) {
      pts=rougher(pts);
    }
    else if (e.altKey){
      pts=straighter(pts);
    }
    else {
      pts=smoother(pts);
    }
    fixXs();

    drawControls(boo);
    newWave=reWave(pts,boo.height.baseVal.value);
  }
  else if(e.keyCode==87) { // toggle interim waves
    bendy = undefined;
    if (waves) {
      waves = undefined;
      newWave=reWave(pts,document.getElementById('boo').height.baseVal.value);
    }
    else {
      waves = wavesRange(pts,boo.height.baseVal.value);
    }
  }
  else if(e.keyCode==88) { // toggle axis freedom of control points
    fixX = !fixX;
  }
  else if (e.keyCode==65) { // A - toggle ADSR (basic linear)
    hideEl('adsr');
    drawAdsr(adsrPts);
  }
  else if(e.keyCode==70) { // F - toggle show freqs
    drawFreqs=!drawFreqs;
    clearFreqs(document.getElementById('graph'));
  }
  else if(e.keyCode==67) { // C - custom
    wave='custom';
  }
  else if (e.keyCode==71) { // G - toggle sound graph
    /*var g = document.getElementById('graph');
    if (g.className.baseVal == 'hide')
      g.className.baseVal = '';
    else 
      g.className.baseVal = 'hide';*/
      hideEl('graph');
  }
  else if (e.keyCode==76) { //L - record/playback loop
    recLoop = !recLoop;
    if(recLoop) 
      loopd=undefined;
    else
      playLoop();
  }
  else if (e.keyCode==77) { //M - toggle mute
    mute = !mute;
  }
  else if (e.keyCode==80) { //P - set periodicwave from recorded audio for midi playback
    if (mic && mic.frames && mic.frames.length > lastframe) {
      var f = mic.frames[lastframe];
      var w = sofa.enwave(f);
    }
  }
  else if(e.keyCode>=48 && e.keyCode <=57) { //num key
    k = e.keyCode-48;
    if (e.shiftKey) {
      slide = k;
    }
    else if (e.altKey) { //record sound wave
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

/*function mousemove(e) {
  if (e.which == 0) {
    // no clicky, no draggy
    return;
  }
  if(ctlid) {
    move(e);
  }
  else if (adsrid) {
    moveAdsr(e);
  }
  else if(!isNaN(lastPitch)) {
    movePitch(e);
  }
}*/

/*document.addEventListener('touchmove',function(e) {
  move(e.touches[0]);
});*/
document.addEventListener('dblclick', rept);
//document.addEventListener('keyup',type);
document.addEventListener('keydown',type);
document.addEventListener('DOMContentLoaded', init);
