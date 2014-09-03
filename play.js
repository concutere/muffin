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
    var bendStep=2,lastBend=0;
    function stream() {
      var ctx = getCtx();
      var gain = ctx.createGain();
      var oscillator = ctx.createOscillator();
      var analyser = ctx.createAnalyser();
      var startedAt = undefined; //TODO
      gain.gain.value=volume;
      oscillator.type = wave || 'custom';
      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      if (isNaN(hz) && !mute) {
        oscillator.frequency.value=hz=initHz/bendStep;
        oscillator.frequency.setValueAtTime(hz,ctx.currentTime);
        if (rampHz) {
          /* TODO recur, no loop
          */
          for (var i = 0; i <= 2000; i++) {
            oscillator.frequency.linearRampToValueAtTime(hz*(i % 2 == 0 ? 1 : bendStep*2), i*2.5);
          }
        }
       }
      var recur = function recur() {
        if (isNaN(hz)) {
          try {
            oscillator.stop();
            gain.disconnect();
          } catch(e) { }
          return;
        }
        else {
          if(newWave && wave=='custom') {
            oscillator.setPeriodicWave(newWave);
            //newWave = undefined;
          }
          oscillator.frequency.value = hz;
          oscillator.detune.value = cents;
         
          var freqs = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(freqs);
          graphByteFreqs(freqs);
          var times = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteTimeDomainData(times);
          graphByteTimes(times);
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
  if (cpts.length < 3) return;//min pts for cubic bezier
  var svg = document.getElementById('boo');
  var vals=vals||new Float32Array(cpts.length);
  if (includeSvgPath && useDeCasteljauPath) {
    //todo move to beginning?
    var d = "M " + cpts[0].x + ' ' + cpts[0].y ;
    d = cpts.slice(Math.floor(cpts.length/pts.length)).reduce(function(p,c,i,a) {
      return p + " L " + c.x + ' ' + c.y;
    },d);
    var path = document.getElementById('path');
    if (path)
      path.setAttribute('d',d);
  }
    var p=document.getElementById('path'); 
    for (var i = 0; i < cpts.length; i++) {
      if(drawBCs && i % (cpts.length/64) == 0) {
        addBC(svg,i,cpts[i].x,cpts[i].y);
      }
      vals[i]=cpts[i].y;
  }
  
  var fft = new FFT(bezSize);
  var trans = fft.forward(Array.prototype.slice.call(vals,0,bezSize));
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    