  function gotMIDI(access) {
    m=access;
    var inputs = m.inputs();
    var outputs = m.outputs();
    inputs[0].onmidimessage = midiMsg;
    var o = outputs[0];
  }
  
  var bendy=undefined;
  function midiMsg(e) {
    var cmd = e.data[0] >> 4;
    var chan = e.data[0] & 0xf;
    var key = e.data[1];
    var hit = e.data[2];
    
    if (chan == 9)
      return; 
      
    if(cmd==8 || (cmd==9 && hit==0)) {
      //stop playing note
      var i = tet(key);
      if (!playing[i]) 
        return;
      playing[i]['stop']=true;
      
      var tmp = [];
      for (o in playing) {
        if (o!=i && playing[o]!=undefined) {
          tmp[o]=playing[o];
        }
      }
      
      playing = tmp;
    }
    else if (cmd == 9) {
      //play note
      var i = tet(key);
      if(playing[i] && playing[i]['stop']!==true)
        playing[i]['stop']=true;
      //else
      playing[i] = play(i,hit/100.0);
    }
    else if (cmd == 14) {
      bendy = hit;
    }
  }
