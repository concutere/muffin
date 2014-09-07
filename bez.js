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
    if more than 4 points provided, will construct a series of sub-curves (quadratics). This curve has the same general shape as what svg would draw with a path using S to chain the points but the actual line of the curve is off center from it (S-path seems to make more extreme curvatures at the control points)
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