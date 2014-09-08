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
    var recur;
    
    //adsr vars
    var attack = 1.25;
    var decay = 1;
    var sustain = 0.95;
    var release = 0.01;
    var attackFor = 0.1;
    var decayFor = 0.25;
    var sustainFor = 1;
    var releaseFor = 0.1;
    var echoStartFor = 0.5;
    var echoEndFor = 5;
    var echoStart = 0.25;
    var echoEnd = 0.1;
    function stream() {
      var ctx = getCtx();
      var gain = ctx.createGain();
      var oscillator = ctx.createOscillator();
      var analyser = ctx.createAnalyser();
      var startedAt = undefined; //TODO

      oscillator.type = wave || 'custom';
      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      if (isNaN(hz) && !mute) {
        oscillator.frequency.cancelScheduledValues(ctx.currentTime);
        oscillator.frequency.value=hz=initHz/bendStep;
        oscillator.frequency.setValueAtTime(hz,ctx.currentTime);
        if (useAdsr) {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          //gain.gain.value=volume;
          gain.gain.setValueAtTime(volume/6,ctx.currentTime);
          //attack
          gain.gain.linearRampToValueAtTime(volume * attack,ctx.currentTime + attackFor);
          oscillator.frequency.linearRampToValueAtTime(hz + attack/6, ctx.currentTime + attackFor);
          //decay
          gain.gain.linearRampToValueAtTime(volume * decay,ctx.currentTime + attackFor + decayFor);
          oscillator.frequency.linearRampToValueAtTime(hz, ctx.currentTime + attackFor + decayFor/2);
          //sustain
          gain.gain.linearRampToValueAtTime(volume * sustain, ctx.currentTime + attackFor + decayFor + sustainFor);
        }
        else  
          gain.gain.setValueAtTime(volume,ctx.currentTime);

      }
      var recur = recur || function recur() {
        if (isNaN(hz)) {
          try {
            if (useAdsr) {
              if (useEcho) {
                gain.gain.linearRampToValueAtTime(volume * echoStart, ctx.currentTime + echoStartFor);
                gain.gain.linearRampToValueAtTime(volume * echoEnd, ctx.currentTime + echoStartFor + echoEndFor);
              }
              else {
                gain.gain.linearRampToValueAtTime(volume * release, ctx.currentTime + releaseFor);
              }
              setTimeout(function() {oscillator.stop();gain.disconnect();},1000 * (useEcho ? (echoStartFor + echoEndFor) : releaseFor));
            }
            else {
              oscillator.stop(0);
              gain.disconnect();
            }
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
  var cpts = curve(pts,bezSize);
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