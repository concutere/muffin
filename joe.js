/***
    Joe - a little library all about pitch (intonation + adsr)
***/

function Joe(params) {
if(!params) params=[]
  //adsr vars
  var attack = params['attack']||1.05;
  var decay = params['decay']||0.99;
  var sustain = params['sustain']||0.95;
  var release = params['release']||0.01;
  var attackFor = params['attackFor']||0.05;
  var decayFor = params['decayFor']||0.05;
  var sustainFor = params['sustainFor']||0.1;
  var releaseFor = params['releaseFor']||0.5;
  var echoStartFor = params['echoStartFor']||2.5;
  var echoEndFor = params['echoEndFor']||5;
  var echoStart = params['echoStart']||0.2;
  var echoEnd = params['echoEnd']||0.1;
 
  var sustained = false;//to calculate proper stop time... maybe todo just rely on params?
  
  Joe.prototype.ads = function(currentTime,hz,volume,oscillator,gain) {
    gain.gain.cancelScheduledValues(currentTime);
    gain.gain.setValueAtTime(volume/6,currentTime);
    //attack
    gain.gain.linearRampToValueAtTime(volume * attack,currentTime + attackFor);
    gain.gain.exponentialRampToValueAtTime(volume * 2,currentTime + attackFor/2);
    oscillator.frequency.setValueAtTime(hz*attack, currentTime );
    oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + attackFor );
    //decay
    gain.gain.linearRampToValueAtTime(volume * decay,currentTime + attackFor + decayFor);

    //sustain
    gain.gain.linearRampToValueAtTime(volume * sustain, currentTime + attackFor + decayFor + sustainFor);  
  }
  
  Joe.prototype.release = function(currentTime,volume,gain,oscillator) {
    gain.gain.exponentialRampToValueAtTime(volume * release, currentTime + releaseFor + (sustained ? echoStartFor + echoEndFor : 0));
    setTimeout(function() {oscillator.stop();gain.disconnect();},1000 * ((sustained ? echoStartFor + echoEndFor : 0) + releaseFor));
  }
  
  Joe.prototype.adsr = function(currentTime,hz,volume,oscillator,gain) {
    gain.gain.cancelScheduledValues(currentTime);
    gain.gain.setValueAtTime(volume/6,currentTime);
    //attack
    gain.gain.linearRampToValueAtTime(volume * attack,currentTime + attackFor);
    oscillator.frequency.exponentialRampToValueAtTime(hz + attack/6, currentTime + attackFor);
    //decay
    gain.gain.linearRampToValueAtTime(volume * decay,currentTime + attackFor + decayFor);
    oscillator.frequency.exponentialRampToValueAtTime(hz, currentTime + attackFor + decayFor/2);
    //sustain
    gain.gain.linearRampToValueAtTime(volume * sustain, currentTime + attackFor + decayFor + sustainFor);  
    
    this.release(currentTime + attackFor + decayFor + sustainFor,volume,gain,oscillator);
  }    
  
  //post-release sustain, the sustain that the s in adsr is just implicit
  Joe.prototype.echo = function(currentTime, volume, gain) {
    gain.gain.cancelScheduledValues(currentTime);
    //gain.gain.setValueAtTime(volume,currentTime);
    //gain.gain.linearRampToValueAtTime(volume , currentTime );
    sustained = true;
    gain.gain.exponentialRampToValueAtTime(volume * echoStart, currentTime + echoStartFor);
    gain.gain.linearRampToValueAtTime(volume * echoEnd, currentTime + echoStartFor + echoEndFor);
  }
}