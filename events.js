//event handlers
var boo = document.getElementById('boo');
var ctlid = undefined;
var lastPitch = undefined;

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
  path=[];
  for (var i = 0; i <= 1; i+=1/(controlpts-1)) {
    var xx = Math.round(i * w)
    var pt = { x: xx, y: yy, toString: function() { return this.x + ' ' + this.y; } };
    pts.push(pt);
    path.push(xx);
    path.push(yy);
  }
  samplePaths = ([path]).concat(samplePaths);
  
  if (includeSvgPath) 
    addPath(svg,pts);

  drawControls(svg,pts);
}

function down (e) { 
  if(e.srcElement.id.indexOf('control')==0) {
    ctlid = parseInt(e.srcElement.id.substr(7));
  }
  else if(e.srcElement.id=='pitch') {
    lastPitch = 0;
  }
}

function up(e) {
  hz=undefined;
  ctlid = undefined;
  lastPitch=undefined;
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
  if (pitchColor) {
    var color = colorange(cents, 1200);
    var rgb = 'rgba(' + color.join(',') + ',127)';
    el.setAttribute('fill', rgb);
  }
}

function move(e) {
  if (ctlid == undefined)
    return;
    
  if (isNaN(hz)) {
    stream();
  }
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  var x = e.clientX;
  var y = e.clientY;
  var id = e.srcElement.id;
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
  //var ratio = scaleHz(y,h,2);//Math.log(1+(h-y)/h)*4;
  //hz=ratio*minHz; 
  document.body.focus();
}

function rept(e) {
  var cx = e.clientX, cy = e.clientY;
  var h = boo.height.baseVal.value;
  var w = boo.width.baseVal.value;
  var el = e.srcElement;
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
    var bcpts = expand(pts,(pts.length)*scale,true); // gives midpoints
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
  else if(e.keyCode>=48 && e.keyCode <=57) { //num key
    k = e.keyCode-48;
    if (e.shiftKey) {
      slide = k;
    }
    else if (e.altKey) { //record sound
      var path = [];
      for (var i = 0; i < pts.length; i++) {
        path.push(pts[i].x);
        path.push(pts[i].y);
      }
      samplePaths[k]=path;
    }
    else { //load sound
      var newpts=[];
      var path = samplePaths[k];
      if (!path || path.constructor != Array)
        return;
      for (var i = 1; i < path.length; i+=2) {
        newpts.push({x: path[i-1], y: path[i], toString: function() { return this.x + " " + this.y; }});
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
document.addEventListener('mousemove',function(e) {
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
});

document.addEventListener('touchmove',function(e) {
  move(e.touches[0]);
});
document.addEventListener('dblclick', rept);
document.addEventListener('keyup',type);
document.addEventListener('DOMContentLoaded', init);
