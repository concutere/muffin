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
      gain.gain.value=volume;
      oscillator.type = wave || 'custom';
      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      if (isNaN(hz) && !mute) {
        oscillator.frequency.value=hz=initHz/bendStep;
        oscillator.frequency.setValueAtTime(hz,ctx.currentTime);
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
function reWave(vals) {
  var ctx = getCtx();

  var fft = new FFT(bezSize);
  var trans = fft.forward(Array.prototype.slice.call(vals,0,bezSize)); //why slice needed?
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    