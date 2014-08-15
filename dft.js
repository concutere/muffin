var dft = (function() {
// w/ ref to https://github.com/corbanbrook/dsp.js/
  var size = 4;//64; //4096;
  var real = new Float32Array(size);
  var imag = new Float32Array(size);

  var N = size * size;
  
  var pirat = 2 * Math.PI / size;

  var sins = new Float32Array(N);
  var coss = new Float32Array(N);

  for (var i = 0; i < N; i++) {
    sins[i] = Math.sin(i * pirat);
    coss[i] = Math.cos(i * pirat);
  }

  return function dft(shape) {
    this.size = size;
    if(shape.length != size) 
      return;

    var rval,
        ival;

    for (var k = 0; k < size; k++) {
      rval = 0.0;
      ival = 0.0;

      for (var n = 0; n < size; n++) {
        rval += coss[k*n] * shape[n];
        ival += sins[k*n] * shape[n];
      }

      real[k] = rval;
      imag[k] = ival;
    }

    return {"real": real, "imag": imag};
  }
})();