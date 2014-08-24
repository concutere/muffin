      //bezier functions
  function cubicPts(x0,x1,x2,x3,t) {
    return [Math.pow(1-t,3) * x0, 
           Math.pow(1-t,2) * 3 * t * x1, 
           Math.pow(t,2) * 3 * (1 - t) * x2, 
           Math.pow(t,3) * x3];
  }
  function quadPts(x0,x1,x2,t) {
    return [Math.pow(1-t,2) * x0, 
           2*t*(1-t) * x1, 
           t*t * x2];
  }
  function cubic(x0,x1,x2,x3,t) {
    /*return cubicPts(x0,x1,x2,x3,t).reduce(function(p,c) {
      return p + c;
    },0);*/
    return Math.pow(1-t,3) * x0 +
           Math.pow(1-t,2) * 3 * t * x1 +
           Math.pow(t,2) * 3 * (1 - t) * x2 +
           Math.pow(t,3) * x3;
  }
  function quad(x0,x1,x2,t) {
    /*return quadPts(x0,x1,x2,t).reduce(function(p,c) {
      return p + c;
    },0)*/
    return Math.pow(1-t,2) * x0 +
           2*t*(1-t) * x1 +
           t*t * x2;
  }
  
  function cubicPt(p0,p1,p2,p3,t) {
    var x=cubic(p0.x,p1.x,p2.x,p3.x,t);
    var y=cubic(p0.y,p1.y,p2.y,p3.y,t);

    return ({'x': x, 'y': y, toString: function() { return x + " "+ y}});

  }

  function quadPt(p0,p1,p2,t) {
    var x=quad(p0.x,p1.x,p2.x,t);
    var y=quad(p0.y,p1.y,p2.y,t);
      return ({'x': x, 'y': y, toString: function() { return x + " "+ y}});
  }
/***
    expand divides a bezier curve into a sequence of sub-curve segments
    skipPad = true is intended to find all midpoints (current assumption size = pts.length)
    
    if more than 4 points provided, will construct a series of sub-curves (quadratics). This by itself can build a curve that has the same general shape as a continuous cubic bezier curve but the actual line of the curve is off center from it (S-path seems to make more extreme curvatures at the control points). 
    
    See dc function for full deCasteljau algo, it makes use of expand
***/
function expand(pts, size, skipPad) {
  
  if (pts.length > 4) {
    //see commented out P at bottom to handle any # of pts for a single higher-order beziercurve/bernstein poly
    
    //break down into multiple 3pt quad curves and call expand on each
    //subdivide t accordingly for the accumulated expand calls
    
    var last = skipPad ? undefined : pts[0];
    var acc=[];
    var tsize = Math.floor(size/(pts.length-2));
    for (var p = skipPad ? 0 : 1; p < pts.length-(skipPad ? 1 : 2); p++) {
      var midp = {x: (pts[p].x+pts[p+1].x)/2, 
                  y: (pts[p].y+pts[p+1].y)/2};
      if(last!=undefined) {
        var seg = [last,pts[p],midp];
        //TODO? set threshold for min tangent delta before new midpt needed? 
        //how will this affect padding to 2**n (so we can use radix fft)?
        acc=acc.concat(expand(seg,tsize, skipPad));
      }
      last = midp;
    }
    acc=acc.concat(expand([last,pts[pts.length-2],pts[pts.length-1]],tsize));
    if (acc.length>size)
      acc=acc.slice(0,4096);
    else if (!skipPad)
      while (acc.length<size) 
        acc.push(acc[acc.length-1]);

    return acc;
  }
  var ts = [];
  for (var t = 0.0; t < 1; t+=1/size) {
    if (pts.length==4) {
      var bx = cubic(pts[0].x,pts[1].x,pts[2].x,pts[3]
      .x, t);
      var by = cubic(pts[0].y,pts[1].y,pts[2].y,pts[3].y, t);
      ts.push({x: bx, y: by, toString: function() { return px + " "+ py}});
      console.log('4pt')
    } else
    if(pts.length == 3) {
      var bx = quad(pts[0].x,pts[1].x,pts[2].x, t);
      var by = quad(pts[0].y,pts[1].y,pts[2].y, t);
      ts.push({x: bx, y: by, toString: function() { return px + " "+ py}});
      //console.log('3pt')
    }
    else
      console.log('wrong # of pts('+pts.length+'), expected 3');
  }
  return ts;
}   

function midpt(p0,p1,ratio) {
  if (ratio==undefined) ratio=0.5;
  var px=(p0.x+p1.x)*ratio;
  var py=(p0.y+p1.y)*ratio
  return {x:px, y: py, toString: function() { return px + " "+ py}};
}

function recubic(p0,p1,p2,p3) {
  var pts=[];
  var s0=(p0.x/p0.y);
  var s1=p1.x/p1.y;
  var s2 =p2.x/p2.y;
  var s3=p3.x/p3.y;

  var q0=midpt(p0,p1,t);
  var q1=midpt(p1,p2,t);
  var q2=midpt(p2,p3,t);
  var r0=midpt(q0,q1,t);
  var r1=midpt(q1,q2,t);
  var p=midpt(r0,r1,t);
  
  if(Math.abs(s0-s1) < 0.1 && Math.abs(s1-s2) < 0.1 && Math.abs(s2-s3) < 0.1)
    return [p];
  else {
    pts=pts.concat(recubic(p0,q0,r0,p));
    pts=pts.concat(recubic(p,r1,q2,p3));
  }
  
  return pts;
}

function requad(p0,p1,p2) {
  var pts=[];
  var s0=(p0.x/p0.y);
  var s1=p1.x/p1.y;
  var s2 =p2.x/p2.y;

  var q0=midpt(p0,p1);
  var q1=midpt(p1,p2);
  var r0=midpt(q0,q1);
  if(Math.abs(s0-s1) < 0.1 && Math.abs(s1-s2) < 0.1)
    return [r0];
  else {
    pts=pts.concat(requad(p0,q0,r0));
    pts=pts.concat(requad(r0,q1,p2));
  }
  return pts;
}

function dc(pts,size) {
  if (pts.length * 2 >size) return pts;
  var tpts=([pts[0]]).concat(pts);
  var len=tpts.length;
  var dcpts=[];
  var order=2; //quad or cubic...
  var step=((len-2)/size)/2;
    for (var i = order; i <len;i+=1) {
      //var p0=tpts[i-3]
      var p1=tpts[i-2];
      var p2=tpts[i-1];
      var p3=tpts[i];

      if(i%order==0) { //endpoints
        dcpts.push(p1);
        dcpts=dcpts.concat(requad(p1,p2,p3));
      //var pt=requad(p1,p2,p3,t));
      }      
      else {
        var m1 = midpt(p1,p2);
        var m2 = midpt(p2,p3);
        dcpts=dcpts.concat(requad(m1,p2,m2));
      }
  }
  /*if (dcpts.length < size/2)
    return dc(dcpts,size);
  else*/
    return dcpts;
}
//    ////////////////////////////////////
//    //n-degree bernstein func
//        /**Computes factorial*/
//function fact(k){
//    if(k==0 || k==1){
//	return 1;
//    }
//    else{
//	return k * fact(k-1);
//    }
//}
//
///**Computes Bernstain
//*@param {Integer} i - the i-th index
//*@param {Integer} n - the total number of points
//*@param {Number} t - the value of parameter t , between 0 and 1
//**/
//function B(i,n,t){
//    //if(n < i) throw "Wrong";
//    return fact(n) / (fact(i) * fact(n-i))* Math.pow(t, i) * Math.pow(1-t, n-i);
//}                            
//
//
///**Computes a point's coordinates for a value of t
//*@param {Number} t - a value between o and 1
//*@param {Array} points - an {Array} of [x,y] coodinates. The initial points
//**/
//function P(t, points){
//    var r = {x:0,y:0};
//    var n = points.length-1;
//    for(var i=0; i <= n; i++){
//	r.x += points[i].x * B(i, n, t);
//	r.y += points[i].y * B(i, n, t);
//    }                
//    return r;
//}