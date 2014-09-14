      /****************
        basic audio setup
      *****************/
  var getCtx = (function() {
        var ctx = new (AudioContext || webkitAudioContext)();
        return function() { return ctx; };
  })();
        
    function scaleHz(val, max, octaves) {
      return Math.pow(2,(max-val) / (max/octaves));
    } 

    var hz,lastHz, minHz=110, initHz=261.625565, cents=0; //middle C
    var newWave=undefined,currWave=undefined;
    var bendStep=2,lastBend=0;
    var recur;
    
    var joe = new Joe();
    var adsrPts = joe.goggles(1000,100);
    var analyser;
    function stream() {
      var ctx = getCtx(); 
      var gain = ctx.createGain();
      var oscillator = ctx.createOscillator();
      analyser = analyser || ctx.createAnalyser();

      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      if (!mute) {
        if (isNaN(hz)) {
          hz=initHz/bendStep;
        }
        if(hz!=oscillator.frequency.value) {
          oscillator.frequency.cancelScheduledValues(ctx.currentTime);
          oscillator.frequency.value=hz;
          oscillator.frequency.setValueAtTime(hz,ctx.currentTime);
        }
        if (useAdsr) {
          joe.attack(ctx.currentTime,hz,volume,oscillator,gain);
        }
        else  
          gain.gain.setValueAtTime(volume,ctx.currentTime);

      }
      var recur = recur || function recur() {
        if (isNaN(hz)) {
          try {
            if (useAdsr) {
              joe.release(ctx.currentTime,volume,gain,oscillator);
            }
            else {
              oscillator.stop(0);
              gain.disconnect();
            }
          } catch(e) { }
          return;
        }
        else {
          if(wave=='custom') {
            if (newWave) {
              currWave = newWave;
              newWave = undefined;
            }
            oscillator.setPeriodicWave(currWave);
          }
          else
            oscillator.type = wave;

          oscillator.frequency.value = hz;
          oscillator.detune.value = cents;
         
          //TODO move to draw
          //drawGraph(analyser);
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


function reWave(pts,h,w) {
  var ctx = getCtx();
  var cpts = curve(pts,bezSize);
  var vals=vals||new Float32Array(cpts.length);

  drawWave(cpts,h,w);
  
  for (var i = 0; i < cpts.length; i++) {
    //TODO how can x be used in an intuitive way?
    // loop detection for clipping?
    // cusps?
    // pt diff?
    vals[i]=h-cpts[i].y;
  }
  
  var fft = new FFT(bezSize);
  var trans = fft.forward(vals);
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    