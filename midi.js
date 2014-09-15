  function gotMIDI(access) {
    m=access;
    var inputs = m.inputs();
    var outputs = m.outputs();
    inputs[0].onmidimessage = midiMsg;
    var o = outputs[0];
  }
  
  function midiMsg(e) {
    var cmd = e.data[0] >> 4;
    var chan = e.data[0] & 0xf;
    var key = e.data[1];
    var hit = e.data[2];
    console.log('{ key: ' + key + ', hit: ' + hit + ' }');
    
    if (chan == 9)
      return; 
      
    if(cmd==8 || (cmd==9 && hit==0)) {
      //stop playing note
      hz=undefined;
    }
    else if (cmd == 9) {
      //play note
      play(tet(key),hit/100.0);
    }
    
  }