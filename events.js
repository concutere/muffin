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
  //pts=[{x:0,y:yy}];
  for (var i = 0; i <= 1; i+=1/(controlpts-1)) {
    var xx = Math.round(i * w)
    var pt = { x: xx, y: yy };
    pts.push(pt);
  }
  //pts.push({x:w,y:yy})
  pts.forEach(function(v,i,a) {
    v['toString'] = function() { return this.x + ' ' + this.y; };
  });
  
  if (includeSvgPath) 
    addPath(svg,pts);
  
  for (var i = 1; i < pts.length-1; i++) {
    addControl(svg,'control'+(i),pts[i].x, pts[i].y);      
  }
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
  if (e.ctrlKey && e.shiftKey && e.altKey) {
    newWave=undefined;
  }
  if (e.ctrlKey && e.shiftKey) {
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
  }
  else {
    if(e.altKey)
      centWt = 400;
    else if(e.ctrlKey) 
      centWt = 100;
    else if(e.shiftKey)
      centWt = 300;
    
    cents = getCents(centWt,lastPitch,boo.width.baseVal.value);
    //newWave = reWave(pts,boo.height.baseVal.value,boo.width.baseVal.value);
  }
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
    var inid = pts.length;
    var mind=0;
    var ptd=undefined;
    var bcpts = expand(pts,pts.length,true); // gives midpoints
    
    for (var i = 0; i < bcpts.length; i++) {
      var dx = Math.pow(cx-bcpts[i].x,2);
      var dy = Math.pow(cy-bcpts[i].y,2);
      var d = Math.sqrt((dx + dy)/2);
      if (mind==0 || d < mind) {
        mind = d;
        inid=i+1;
        inid=i+1;
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

function type(e) {
  //key handler
  var k =e.keyIdentifier;
  if((['Up','Down','Left','Right']).indexOf(k)>=0) {
    var el = document.getElementById('text');
    if (el==undefined) 
      el=document.createElement('div');
    el.id='text';
    //el.innerText='testing';
    if(!el.parentElement) 
      document.body.appendChild(el);
    
    el.className='roll' + k;
    if (['Down','Right'].indexOf(k)>=0) 
      el.addEventListener('animationend',function(e) {
        document.body.removeChild(el);
    });
  }
  else if(e.keyCode==27) { //escape
    var el = document.getElementById('text');
    if (el && el.parentElement)
      el.parentElement.removeChild(el);
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
