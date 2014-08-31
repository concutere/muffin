      //bezier functions
  function cubic(x0,x1,x2,x3,t) {
    return Math.pow(1-t,3) * x0 +
           Math.pow(1-t,2) * 3 * t * x1 +
           Math.pow(t,2) * 3 * (1 - t) * x2 +
           Math.pow(t,3) * x3;
  }
  function quad(x0,x1,x2,t) {
    return Math.pow(1-t,2) * x0 +
           2*t*(1-t) * x1 +
           t*t * x2;
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
    if (x.x == p.x && x.y == p.y)
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
  /***
    expand divides a bezier curve into a sequence of sub-curve segments
    skipPad = true is intended to find all midpoints (current assumption size = pts.length)
    if more than 4 points provided, will construct a series of sub-curves (quadratics). This curve has the same general shape as what svg would draw with a path using S to chain the points but the actual line of the curve is off center from it (S-path seems to make more extreme curvatures at the control points)
***/
function expand(pts, size, skipPad) {

  
  if (pts.length > 4) {
    var start = pts[0];
    var cpre = start;
    var segs=[];
    for (var p = 1; p < pts.length; p+=2) {
      var end = pts[p];
      var c2 = pts[p-1];
      var c1 = invertPt(cpre,start);
      segs.push([start, c1, c2, end]);
      start = end;
      cpre = c2;
    }
    var tstep = segs.length / size;
    var tsize = size / segs.length;
    return segs.reduce(function(acc,s) {
      for (var t = 0.0; t < 1; t += tstep) {
        acc.push(cubicPt(s[0],s[1],s[2],s[3],t));
      }
      return acc;
    },[]);
  }
  else {
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
}   
 

function newPt(x, y) {
  return {'x': x, 'y': y, toString: function() {return this.x + ' ' + this.y}};
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