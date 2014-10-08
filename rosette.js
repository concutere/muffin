function Remnant(start, dur, pitch, vol, wave) {
  this.start = start;
  this.dur = dur;
  this.pitch=pitch;
  this.vol=vol;
  this.wave=wave;

  Remnant.prototype.toString = function() {
    return this.start + ', ' + this.dur + ', ' + this.pitch + ', '+ this.vol;
  }
  Remnant.prototype.poot = function poot(ctx) {
    //console.log('pooting ' + this.pitch + ' at ' + this.start + ' for ' + this.dur);
    return play(this.pitch,this.vol,this.dur,this.start);
  }
}

function Rosette(start) {
  this.start = start;
  var remnants = [];

  Rosette.prototype.add = function add(start, dur, pitch, vol, wave) {
    var ant = new Remnant(start-this.start, dur, pitch, vol, wave );
    remnants.push(ant);
    return ant;
  }
  
  Rosette.prototype.poot = function poot(ctx) {
    for (var i = 0; i < remnants.length; i++) {
      var ant = remnants[i];
      var end = ant.dur;
      if (isNaN(end)) {
        end = ctx.currentTime - this.start;
        //console.log('defaulting end');
      }
      //console.log('pooting ' + this.pitch + ' at ' + this.start + ' for ' + end);

      play(ant.pitch,ant.vol, end,ant.start);
    }
  }
  
  Rosette.prototype.crumble = function(ant, at) {
    ant.dur = at-this.start;
    console.log('crumbled' + ant.dur);
  }
  
  Rosette.prototype.toString = function() {
    return remnants.reduce(function(a,e) { return a +'\n'+ e; });
  }
} 