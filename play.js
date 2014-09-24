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
    var analyser, ma;
    var compressor;
    
    var mic = undefined;
    var joe = new Joe();
    var adsrPts = joe.goggles(1000,100);
    function play(hz,vol) {
      var ctx = getCtx(); 
      var o = new Object();
      o['stop']=false;
      o['time']=ctx.currentTime;
      o['hz']=hz;
      o['vol']=vol;
      var start = o['start']=ctx.currentTime;
      
      var attack = (1000-adsrPts[1].x)/1000;
      var decay = (1000-adsrPts[2].x)/1000;
      var sustain = (1000-adsrPts[3].x)/1000;
      var release = (1000-adsrPts[4].x)/1000;
      
      var gain = ctx.createGain();
      var oscillator = ctx.createOscillator();
      analyser = analyser || ctx.createAnalyser();

      //TODO parametrize
      compressor = compressor || ctx.createDynamicsCompressor();
      joe.turnitdown(compressor);
      //lowpass=joe.lowpass();
      oscillator.connect(/*lowpass); //*/gain);
      //lowpass.connect(gain);
      gain.connect( compressor);//analyser);
      compressor.connect(analyser);
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
            if(waves) {
              var diff = ctx.currentTime - start;
              var i = 10;
              var stage='?';
              if (diff <= attack) {
                i = 10 - Math.floor(diff/attack * 10);
                stage='attack';
              }
              else if ( diff <= decay) {
                i = Math.floor((diff-attack)/(decay-attack) * 8);
                stage='decay';
              }
              else if (diff <= sustain) {
                i = 8 + Math.max(0,Math.floor((diff-decay)/(sustain-decay) * 4));
                stage='sustain';
              }
              else if (diff == sustain) {
                i=10;
                stage='sustain++';
              }
              else {//if (diff <= release) {
                i = Math.min(20,12 + Math.floor((diff-sustain)/(release - decay) /* * 8 */));
                stage='else';
              }
              newWave = waves[i];
              console.log('i: ' + i + '\ndiff: '+ diff + '\nstage: '+ stage);
            }
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

      if (!mute) {
        oscillator.start();
      }
      requestAnimationFrame(recur);
      
      return o; //set o['stop']=true to stop playing
    }
    

///////////////////////////////////


function reWave(pts,h) {
  var cpts = curve(pts,bezSize).reverse();

  drawWave(cpts);
  
  return ptsToWave(cpts,h);
}

//TODO remove need for h by reorienting axes in events
function ptsToWave(cpts,h) {
  var ctx = getCtx();
  var vals=vals||new Float32Array(cpts.length);
  for (var i = 0; i < cpts.length; i++) {
    //TODO how can x be used in an intuitive way?
    // loop detection for clipping?
    // cusps?
    // pt diff?
    vals[/*(cpts.length-1)-*/i]=h-cpts[i].y;
  }
  
  var fft = new FFT(vals.length);
  var trans = fft.forward(vals);
  return ctx.createPeriodicWave(trans.real,trans.imag);
}    


function curvesRange(pts,h) {
  var smooth = smoother(pts);
  var rough = rougher(pts);
  var spts = curve(smooth,bezSize).reverse();
  var rpts = curve(rough, bezSize).reverse();
  var cpts = curve(pts, bezSize).reverse();

  var curves = [];
  for (var r = -1; r < 1; r+=0.1) {
    //var wave;
    var pp=[];
    for (var i = 0; i < cpts.length; i++) {
      var p = cpts[i];
      if(r < 0.0) {
        var h = rpts[i];
        pp[i] = newPt(p.x,((1+r) * p.y - r * h.y));
      }
      else {
        var s = spts[i];
        pp[i] = newPt(p.x,((1-r) * p.y + r * s.y));
      }
    }
    //wave = ptsToWave(pp,h);
    //waves.push(wave);
    curves.push(pp);
  }
  
  return curves;//.reverse();//waves;
}

function wavesRange(pts,h) {
  var curves = curvesRange(pts, h);
  var waves = [];
  for (i in curves) {
    waves[i] = ptsToWave(curves[i], h);
  }
  return waves;
}

////////////////////////////////////////////////


function cancelAll() {
  for(p in playing) {
    p['stop']=true;
  }
}


////////////////////////////////////////////////


function initRecord() {
  var ctx = getCtx();
  ma = ma || ctx.createAnalyser();
  mic = new Mic(ma);
  mic.record(loopRecord);
}

function loopRecord() {
  if (recording) {
    var freqs = new Uint8Array(ma.frequencyBinCount);
    ma.getByteFrequencyData(freqs);
    graphByteFreqs(freqs,'blue');
    var times = new Uint8Array(ma.frequencyBinCount);
    ma.getByteTimeDomainData(times);
    graphByteTimes(times,'red');
    requestAnimationFrame(loopRecord);
  }
}

function stopRecord() {
  mic.dc();
  mic=undefined;
}