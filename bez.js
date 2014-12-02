
function newPt(x, y) {
  return {'x': x, 'y': y/*, toString: function() {return this.x + ' ' + this.y}*/};
}

      //bezier functions
  function quad(x0,x1,x2,t) {
    return Math.pow(1-t,2) * x0 +
           2*t*(1-t) * x1 +
           t*t * x2;
  }

  function cubic(x0,x1,x2,x3,t) {
    return Math.pow(1-t,3) * x0 +
           Math.pow(1-t,2) * 3 * t * x1 +
           Math.pow(t,2) * 3 * (1 - t) * x2 +
           Math.pow(t,3) * x3;
  }

  function cubicD(x0,x1,x2,x3,t) {
    return t * (-x0 + 3*x1 - 3*x2 + x3) * 6 +
           t * 6 * (x0 - 2*x1 + x2) - 
           3 * (x0-x1);
  }
  function cubicDD(x0,x1,x2,x3,t) {
    return Math.pow(t, 2) * (-x0 + 3*x1 - 3*x2 + x3) * 3 +
           6 * (x0 - 2*x1 + x2);
  }
     
  function cubicPt(p0,p1,p2,p3,t) {
    return newPt(cubic(p0.x,p1.x,p2.x,p3.x,t),
                 cubic(p0.y,p1.y,p2.y,p3.y,t));
  }  

  function invert(x, p) {     
    return 2*p - x;
  }

  function invertPt(x, p) {
    if (!x || !p)
      console.log('invertPt bad args \n');
    else if (x.x == p.x && x.y == p.y)
      return newPt(p.x, p.y);
    else
      return newPt(invert(x.x,p.x), invert(x.y, p.y));
  }

  function mid(a, b) {
    return a + (a-b)/2;
  }
  
  function midPt(a, b) {
    return newPt(mid(a.x,b.x),mid(a.y,b.y));
  }
  
  ////////////////////////////////////////
  
  function spline(pts,size,skipPad) {
    var last = skipPad ? undefined : pts[0];
    var acc=[];
    var tsize = Math.floor(size/(pts.length-2));
    for (var p = skipPad ? 0 : 1; p < pts.length-(skipPad ? 1 : 2); p++) {
      var midp = {x: (pts[p].x+pts[p+1].x)/2, 
                  y: (pts[p].y+pts[p+1].y)/2};
      if(last!=undefined) {
        var seg = [last,pts[p],midp];
        acc=acc.concat(curve(seg,tsize, skipPad));
      }
      last = midp;
    }
    acc=acc.concat(curve([last,pts[pts.length-2],pts[pts.length-1]],tsize));
    if (acc.length>size)
      acc=acc.slice(0,size);
    else if (!skipPad)
      while (acc.length<size) 
        acc.push(acc[acc.length-1]);

    return acc;
  }
/***
    curve divides a bezier curve into a sequence of sub-curve segments
    skipPad = true is intended to find all midpoints (current assumption size = pts.length)
    if more than 4 points provided, will construct a series of sub-curves (quadratics). This curve has the same general shape as what svg would draw with a pp using S to chain the points but the actual line of the curve is off center from it (S-pp seems to make more extreme curvatures at the control points)
***/
function curve(pts, size, skipPad) {
  
  if (pts.length > 4) {
    return spline(pts,size,skipPad);
  }
  var ts = [];
  for (var t = 0.0; t < 1; t+=1/size) {
    if (pts.length==4) {
      var bx = cubic(pts[0].x,pts[1].x,pts[2].x,pts[3]
      .x, t);
      var by = cubic(pts[0].y,pts[1].y,pts[2].y,pts[3].y, t);
      ts.push({x: bx, y: by});
    } else if(pts.length == 3) {
      var bx = quad(pts[0].x,pts[1].x,pts[2].x, t);
      var by = quad(pts[0].y,pts[1].y,pts[2].y, t);
      ts.push({x: bx, y: by});
    }
  }
  return ts;
}   
   
//    ////////////////////////////////////



//proper composite cubic bezier curve
//not being used for audio currently, wave conversion more buggy + less interesting sounds
function bezier(pts,size) {
  var start = pts[0];
  var cpre = start;
  var segs=[];
  for (var p = 0; p < pts.length; p+=2) {
    var end = pts[p];
    var c2 = p==0? invertPt(pts[1],pts[0]) : pts[p-1];
    var c1 = invertPt(cpre,start);
    segs.push([start, c1, c2, end]);
    start = end;
    cpre = c2;
  }
  segs.push([start,invertPt(cpre,start),start,start]);

  var tstep = segs.length / size;
  var tsize = size / segs.length;
  var acc = [];
  for (var i = 0; i < segs.length; i++) {
    var s = segs[i];
    for (var t = 0; t <= 1; t += tstep) {
      acc.push(cubicPt(s[0],s[1],s[2],s[3],t));
    }
  }
  return acc;
}



/////////////////////////////////////////////



//rougher will add intermediary spikes between existing points, resulting in a len*3 (-2 for endpts) list
//TODO add scaling factor to limit which segments get split/roughened
//x's currently get autofixed after call (TODO move to call w/in fns?)

function rougher(pts) {
  var mids = [];
  var diffs = [];
  var npts = [pts[0]];
  for (var i = 1; i < pts.length; i++) {
    var last = pts[i-1];
    var pt = pts[i];
    var diff = pt.y - last.y; 
    var mp = midPt(pt,last);
    var my = last.y + diff / 2;
    //mids.push(mp);

    //diffs.push(diff);
    //var xd = (pt.x - last.x) / 3;
    
    var a = newPt(last.x +1, my + diff/20);
    var b = newPt(last.x + 2, my - diff/20);
    npts.push(a);
    npts.push(b);
    npts.push(newPt(pt.x,pt.y));
  }
  
  return npts;
}

function straighter(pts) {
  var last = pts[0];
  var mids = [];
  var diffs = [];
  var npts = [newPt(pts[0].x,pts[0].y)];
  for (var i = 1; i < pts.length; i++) {
    var pt = pts[i];
    if (last) {
      var mp = midPt(pt,last);
      //mids.push(mp);
      var diff = pt.y - last.y;
      var my = last.y + diff / 2;
      //diffs.push(diff);

      npts.push(newPt(last.x+1,my));
      npts.push(newPt(pt.x,pt.y));
    }
    last = pt;
  }
  
  return npts;
}

function smoother(pts) {
  var last = pts[0];
  var mids = [];
  var diffs = [];
  var npts = [];
  var min=max=pts[0].y;
  var mini=maxi=maxd=maxdi=mind=mindi=totd=0;
  for (var i = 1; i < pts.length; i++) {
    var pt = pts[i];
    if (last) {
      if(min>pt.y) {
        min = pt.y;
        mini = i;
      }
      else if (max<pt.y) {
        max = pt.y;
        maxi = i;
      }
      var mp = midPt(last,pt);
      mids.push(mp);
      var diff = pt.y - last.y;
      var my = last.y + diff / 2;
      diffs.push(diff);
      totd+=diff;
      if(mind > diff) {
        mind = diff;
        mindi = i;
      }
      else if (maxd < diff) {
        maxd = diff;
        maxdi = i;
      }

      /*npts.push(newPt(last.x+1,my));
      npts.push(newPt(pt.x,pt.y));*/
    }
    last = pt;
  }
  
  var avgd = totd / diffs.length;
  for (var i = 0; i < diffs.length; i++) {
    if(diffs[i] >= avgd || i==mini || i==maxi || i <= 1 || i >= pts.length - 2) {
      var pt=pts[i];
      npts.push(newPt(pt.x,pt.y));
    }
  }
  npts.push(newPt(pts[pts.length-1].x,pts[pts.length-1].y));
  
  return npts;
}


function reverse(pts) {
  return Array.prototype.reverse.call(pts);
}


function insine(pts,w,h) {
  var npts = [newPt(pts[0].x,pts[0].y)];
  for (var i = 1; i < pts.length; i++) {
    var last = pts[i-1];
    var pt = pts[i];
    var diff = pt.y - last.y; 
    var mp = midPt(pt,last);
    var my = last.y + diff / 2;
    //mids.push(mp);

    //diffs.push(diff);
    //var xd = (pt.x - last.x) / 3;
    
    var a = newPt(last.x +2, my - diff/20);
    var b = newPt(last.x + 4, my + diff/20);

    npts.push(newPt(last.x+1, my));
    npts.push(a);
    npts.push(newPt(last.x+3,my));
    npts.push(b);
    npts.push(newPt(last.x+5,my));
    npts.push(newPt(pt.x,pt.y));
  }
  
  return npts;
}
