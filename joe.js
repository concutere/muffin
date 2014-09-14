/***
    Joe - a little library all about pitch (intonation + adsr)
    '...  a couple of quarts of beer, would fix it so the intonation would not offend your ear ...'
***/

function Joe(params) {
if(!params) params=[newPt(0,0.1667),//start from 
                    newPt(0.05,1.05),//attack
                    newPt(0.1,0.99),//decay
                    newPt(0.8,0.95),//sustain
                    newPt(0.95,0.01),//release
                    ];
  var quarts = this.quarts = params;
  
  Joe.prototype.spill = function() {
    return quarts;
  }
  
  //scale to fit
  Joe.prototype.goggles = function(w,h) {
    return quarts.map(function (e) { return newPt(e.x*w,e.y*h); });
  }
  
  //assumes default params!
  Joe.prototype.ads = function(currentTime,hz,volume,oscillator,gain) {
    gain.gain.cancelScheduledValues(currentTime);
    gain.gain.setValueAtTime(volume/6,currentTime);
    //attack
    var a = quarts[1];
    gain.gain.linearRampToValueAtTime(volume * a.y,currentTime + a.x);
    //gain.gain.exponentialRampToValueAtTime(volume * 2,currentTime + attackFor/2);
    
    //TODO how to represent pitch-shifting in curve drawing? just another colored line???
    //oscillator.frequency.setValueAtTime(hz*a.y, currentTime );
    //oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + a.x );
    //decay
    var d = quarts[2];
    gain.gain.linearRampToValueAtTime(volume * d.y,currentTime + d.x);

    //sustain
    var s = quarts[3];
    gain.gain.linearRampToValueAtTime(volume * s.y, currentTime + s.x);  
  }
  
  Joe.prototype.release = function(currentTime,volume,gain,oscillator) {
    var r = quarts[quarts.length-1];
    gain.gain.exponentialRampToValueAtTime(volume * r.y, currentTime + r.x);
    setTimeout(function() {oscillator.stop();gain.disconnect();},1000 * r.x);
  }
  
  Joe.prototype.attack = function(currentTime,hz,volume,oscillator,gain) {
    gain.gain.cancelScheduledValues(currentTime);
    gain.gain.setValueAtTime(quarts[0].y,currentTime+quarts[0].x);
    
    //TODO parametrize hz mods
    //oscillator.frequency.setValueAtTime(hz*quarts[1].y, currentTime );
    //oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + quarts[1].x );
    
    for (var i = 1; i < quarts.length-1; i++) {
      var quart = quarts[i];
      gain.gain.linearRampToValueAtTime(volume * quart.y, currentTime+quart.x);
    }
  }    
}