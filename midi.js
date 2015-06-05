  function gotMIDI(access) {
    m=access;
    hasMidiInput = m.inputs.size >= 1;
    if(hasMidiInput) {
      try {
        var input = m.inputs.values().next().value;
        //var output = m.outputs.values().next().value;
        input.onmidimessage = midiMsg;
        //var o = outputs[0];
      }
      catch (e) {
        hasMidiInput = false; //is this always correct?
      }
    }
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
      bendy = hit == 64 ? undefined : hit;
    }
  }
