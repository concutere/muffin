/****



****/


function Mic(connectTo,handler) {
  this.to = connectTo;
  this.frames = [];
  //this.vol = undefined;
  this.input = undefined;
  this.cb = undefined;
  var self = this;
  this.paused = false;
  
  Mic.prototype.record = function(cb,failcb) {
    if (cb instanceof Function)
      self.cb = cb;
    if (!navigator.getUserMedia && navigator.webkitGetUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia;
    navigator.getUserMedia({audio: true}, self.recordback, logfail);

    function logfail(e) {
      console.log(e)
    }
    
    return self;
  };
  
  Mic.prototype.pause = function pause() {
    self.paused=true;
    return self;
  };
  
  Mic.prototype.resume = function resume() {
    self.paused = false;
    return self;
  };
  
  Mic.prototype.isrecording =function isrecording() {
    return !self.paused;
  }
  
  Mic.prototype.recordback = function recordback(stream) {
    var ctx = getCtx();
    //self.vol = ctx.createGain();
    self.input = self.input || ctx.createMediaStreamSource(stream);
    //self.input.connect(self.vol);
    self.paused = false;
    if(self.to) {
      self.input.connect(self.to);
      if (self.cb instanceof Function)
        self.cb();
    }
    else {
      self.rec = ctx.createScriptProcessor(1024, 1, 1); //TODO when audio workers are supported ...
      self.input.connect(self.rec);
      self.rec.connect(ctx.destination);
      self.rec.onaudioprocess = function(e) {
        //console.log('in rec');
        if(!self.paused) {
          var data = e.inputBuffer.getChannelData(0);
          if(!self.paused) {
            self.frames.push(Array.prototype.slice.call(data,0)); 
            requestAnimationFrame(function() {drawGraphData(data)});

            /*if(self.frames.length >= 1024) //TODO ...
              self.frames.pop();
        */}
        }
      }
    }
  }
  
  Mic.prototype.dc = function dc() {
    var ctx = getCtx();
    self.input.disconnect(self.vol);
    if (self.to) 
      self.input.disconnect(ma);
    else  
      self.input.disconnect(ctx.destination);
  }
  
  Mic.prototype.frame = function frame(idx) {
    return self.frames[idx];
  }
  
  Mic.prototype.framesize = function framesize() {
    return self.frames.length;
  }
  //constructor code 
  if (handler)
    self.record(handler);
  else if (!connectTo)
    self.record();
}
