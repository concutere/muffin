/****



****/


function Mic(connectTo) {
  this.to = connectTo;
  this.data = [];
  //this.vol = undefined;
  this.input = undefined;
  this.cb = undefined;
  var self = this;
  Mic.prototype.record = function(cb,failcb) {
    if (cb instanceof Function)
      self.cb = cb;
    if (!navigator.getUserMedia && navigator.webkitGetUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia;
    navigator.getUserMedia({audio: true}, self.recordback, logfail);
    function logfail(e) {
      console.log(e)
    }
  };
  
  
  Mic.prototype.recordback = function recordback(stream) {
    var ctx = getCtx();
    //self.vol = ctx.createGain();
    self.input = ctx.createMediaStreamSource(stream);
    //self.input.connect(self.vol);
    if(self.to)
      self.input.connect(self.to);
    else
      self.input.connect(ctx.destination);
    if (self.cb instanceof Function)
      self.cb();
  }
  
  Mic.prototype.dc = function dc() {
    self.input.disconnect(self.vol);
    if (self.to) 
      self.input.disconnect(ma);
    else  
      self.input.disconnect(ctx.destination);
  }
}