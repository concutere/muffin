      /****************
        basic audio setup
      *****************/
      var getCtx = (function() {
        var ctx = new AudioContext();
        return function() { return ctx; };
      })();
        
    function scaleHz(val, max, octaves) {
      return Math.pow(2,(max-val) / (max/octaves));
    } 

    var hz, minHz=110, initHz=261.625565, cents=0; //middle C
    var newWave=undefined;
    function stream() {
      var ctx = getCtx();
      var gain = ctx.createGain();

      var oscillator = ctx.createOscillator();
      gain.gain.value=1;
      oscillator.type = 'custom';
      
 
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      if (isNaN(hz) && !mute)
        oscillator.frequency.value=hz=initHz;
      
      var recur = function recur() {
        if (isNaN(hz)) {
          try {
            oscillator.stop();
            gain.disconnect();
          } catch(e) { }
          return;
        }
        else {
          if(newWave) {
            oscillator.setPeriodicWave(newWave);
            //newWave = undefined;
          }
          oscillator.frequency.value = hz;
          oscillator.detune.value = cents;
          requestAnimationFrame(recur);
        }
      };

      if (!mute) 
        oscillator.start();
      requestAnimationFrame(recur);
    }
    
    
///////////////////////////////////
// TODO refactor drawing bits out
function reWave(pts,h,w) {
  var ctx = getCtx();
  var cpts = expand(pts,bezSize);
  var svg = document.getElementById('boo');
  var vals=vals||new Float32Array(cpts.length);
  if (includeSvgPath && useDeCasteljauPath) {
    //todo move to beginning?
    var d = "M " + cpts[0].x + ' ' + cpts[0].y ;
    d = cpts.reduce(function(p,c,i,a) {
      return p + " L " + c.x + ' ' + c.y;
    },d);
    var path = document.getElementById('path');
    if (path)
      path.setAttribute('d',d);
  }
  for (var i = 0; i < cpts.length; i++) {
    if(drawBCs && i % (cpts.length/64) == 0) {
      addBC(svg,i,cpts[i].x,cpts[i].y);
    }
    // using x can be good for "interesting" control options, less so for making sense of the math
    vals[i]=cpts[i].y;
  }
  
  var fft = new FFT(bezSize);
  var trans = fft.forward(vals);
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    