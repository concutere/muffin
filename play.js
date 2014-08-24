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
  var cpts = dc(pts,64);
  var vals=vals||new Float32Array(cpts.length);
  for (var i = 0; i < cpts.length; i++) {
    // using x can be good for "interesting" control options, less so for making sense of the math
    vals[i]=cpts[i].y;
  }
  redrawWave(cpts,h,w);
  var fft = new FFT(cpts.length);
  var trans = fft.forward(vals);
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    