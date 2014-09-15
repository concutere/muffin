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
    
    //TODO calc lookup table on init
    function tet(key) {
      var refHz = initHz;
      var refKey = 60;
        
      return refHz * Math.pow(2, (key-refKey)/12);
    }

    var playing = [];
    
    var initHz=261.625565; //middle C
    var newWave=undefined,currWave=undefined;
    var bendStep=2,lastBend=0;
    
    var joe = new Joe();
    var adsrPts = joe.goggles(1000,100);
    var analyser;
    function play(hz,vol) {
      var o = new Object();
      o['stop']=false;
      var ctx = getCtx(); 
      var gain = ctx.createGain();
      var oscillator = ctx.createOscillator();
      analyser = analyser || ctx.createAnalyser();
      
      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      if (!mute) {
        if(isNaN(vol))
          vol = volume;
        if (isNaN(hz)) {
          hz=initHz/bendStep;
        }
        
        if(hz!=oscillator.frequency.value) {
          oscillator.frequency.cancelScheduledValues(ctx.currentTime);
          oscillator.frequency.value=o['hz']=hz;
          oscillator.frequency.setValueAtTime(hz,ctx.currentTime);
        }
        if (useAdsr) {
          joe.attack(ctx.currentTime,hz,vol,oscillator,gain);
        }
        else  
          gain.gain.setValueAtTime(vol,ctx.currentTime);

      }
      var recur = recur || function recur() {
        if (isNaN(hz) || o['stop']===true) {
          try {
            if (useAdsr) {
              joe.release(ctx.currentTime,vol,gain,oscillator);
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
          //oscillator.detune.value = cents;
         
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
      
      return o; //set o['stop']=true to stop playing
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