/***

 ... Ich bin alle Tage und Nächte ...
 
 Sofa encodes audio as time domain / waveform data
 
***/ 



function Sofa() {
  var self = this;
  Sofa.prototype.init = function init() {
    self.w = 1024;
    self.h = 256;
    self.bits = 8;
    self.samplesize = self.w / self.bits;
  };


  Sofa.prototype.encode = function encode(data) {
    if(data.length != self.w)
      return;
    
    var samples = [];//new Uint8Array(self.samplesize);
    var hh = self.h / 2;
    var midp = hh - 1;
    for (var i = 0; i < self.samplesize; i++) {

      var pt = parseInt(midp + hh * data[i*self.bits]);
      var pre = i == 0 ? pt : parseInt(midp + hh * data[(i-1)*self.bits]);
      var post = i == data.length - 1 ? pt : parseInt(midp + hh * data[(i+1)*self.bits]);
      
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
    
    return samples;
  };
  
  
  Sofa.prototype.encodePts = function encodePts(data) {
    var samples = self.encode(data);
    if (samples.length != self.samplesize)
      return;
      
    return Array.prototype.map.call(samples, function(e, i) {
      return newPt(i * self.bits, self.h - e);
    });
  }
  /////////////
 
  this.init();
}

//////////////////////////////////
var sofa = new Sofa();

