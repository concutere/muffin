/***

 ... Ich bin alle Tage und Nächte ...
 
 Sofa encodes audio as time domain / waveform data
 
 TODO remove (explicit) dependencies on draw.js, play.js
***/ 



function Sofa() {
  var self = this;
  Sofa.prototype.init = function init() {
    self.w = 1024;
    self.h = 256;
    self.bits = 8;
    self.samplesize = self.w / self.bits;
    self.samplerate = 44100;
  };
  
  Sofa.prototype.enwave = function enwave(data) {
    return this.encode2wave(
            this.encode(data));
  }

  Sofa.prototype.encode2wave = function encode2wave(encoding) {
    var data=encoding['samples'];
    /*var hz = encoding['hz'];
    var maxi = encoding['maxi'];

    var xs = self.periodslice(data,hz,maxi);
    */

    var pts = data.map(function(e,i,a) { 
                return newPt(i * (self.w/(a.length-1)), self.h - e);
              });
    pts[0]=newPt(0,127);
    pts[pts.length-1]=(newPt(self.w,127/*pts[0].y*/));
    var wave = reWave(pts,self.h);

    //TODO dont set globals here!
    clearControls(document.getElementById('boo'));
    window.pts=pts;
    newWave=wave;
    drawControls(document.getElementById('boo'));
    //drawWave(pts)
    return wave;
  }

  Sofa.prototype.encode = function encode(data,skipPeriod) {
    if(data.length != self.w)
      return;
    
    var corr = self.autoCorrelate(data,self.samplerate);
    var samples = [];//new Uint8Array(self.samplesize);
    var hh = self.h / 2;
    var midp = hh - 1;
    var min = max = maxi = mini = 0;
    for (var i = 0; i < data.length; i++) {
      if(data[i] > max) {
        max = data[i];
        maxi = i;
      }
      else if(data[i] > min) {
        min = data[i];
        mini = i;
      }
    }
    
    var zedxi = -1;
    var z = maxi;
    while (zedxi < 0) {
      if((max >= 0 && data[z] < 0) ||
          (max < 0 && data[z] >= 0)) {
        zedxi = z+1;
        break;
      }
      z--;
    }
    
    if (zedxi >= 0)
      maxi = zedxi;
    
    var r = self.w / self.samplerate;
    var plen = Math.ceil(self.samplerate / corr);
    
    if(maxi + plen >= data.length)
      maxi = data.length - plen - 1;

    if(maxi + plen >= data.length)
      maxi = data.length - plen - 1;      
    var ptct = Math.ceil(plen / self.bits);
    
    for (var i = 0; i < ptct; i++) {
      var step = i*self.bits;
      var pt = parseInt(midp + hh * data[maxi + i*self.bits]);
      var pre = i == 0 ? pt : parseInt(midp + hh * data[maxi + (i-1)*self.bits]);
      var post = i == data.length - 1 ? pt : parseInt(midp + hh * data[maxi + (i+1)*self.bits]);
      
      var predif = pt - pre;
      var postdif = post - pt;
      var slopeschange = (predif <= 0 && postdif >= 0) ||
                      (predif >= 0 && postdif <= 0);
                      
      if (slopeschange) {
        var dif = (predif + postdif) / 2;
        pt += dif;
      }

      samples[i] = pt;
      
    }
    
    
    return {hz:corr, /*'min':min, 'max':max,*/ 'maxi':maxi, 'samples':samples };
  };
  
  
  Sofa.prototype.encodePts = function encodePts(data) {
    var samples = self.encode(data).samples;
    if (samples.length != self.samplesize)
      return;
      
    return Array.prototype.map.call(samples, function(e, i) {
      return newPt(i * self.bits, self.h - e);
    });
  }
  
  /////////////////////////////////////////
  //thank you cwilso
  /////////////////////////////////////////
  var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

Sofa.prototype.autoCorrelate = function autoCorrelate( buf, sampleRate ) {
  if(isNaN(sampleRate)) 
    sampleRate=self.samplesize;
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}
  
//////////////////////////////////////////////////

  Sofa.prototype.findPeriod = function findPeriod(data) {
    function findMinis(data) {
      var minv = 0;
      var minis = [];
      var err = 0.05;
      for (var i = 0; i < data.length; i++) {
        var val = data[i];
        if (val < minv - err) {
          minv = val;
          minis = [i];
        }
        else if(val >= minv - err && val < minv + err) {
          minis.push(i);
        }
      }
      
      return minis;
    }
    
    var minis = findMinis(data);
    var lens = minis.map(function(e,i) { if(i>0) { return e - minis[i-1]; } });
    var len = mode = lens[0];
    for(var i = i; i < lens.length; i++) {
      if(lens[i] == lens[i-1])
        mode = lens[i];
      else
        console.log('wtf?')
    }    
  }
  /////////////
 
  this.init();
}

//////////////////////////////////
var sofa = new Sofa();

