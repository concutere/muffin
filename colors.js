// color lerp util from an old project
function colorange(x, w) {
  var scale = 256/w;
  var rgb = getSpectrumColor(x * scale, w * scale);
  rgb = rgb.map(function(v,i,a) { return parseInt(v); });
  return rgb;
}

var lastSpectra = -1;
function getSpectrumColor(x, w) {
  var scale = 1/6;
  var v = x/scale % w;
  var newSpectra = Math.floor(x / w / scale);
  lastSpectra = newSpectra;
  if (newSpectra > 5 && x == w)
    newSpectra = 0;
  switch(newSpectra) {
    case 0:
      return [255-v, 0, 255];
    case 1:
      return [0, Math.floor(v), 255];
    case 2:
      return [0, 255, Math.floor(255-v)];
    case 3:
      return [v, 255, 0];
    case 4:
      return [255, 255-v, 0];
    case 5: 
      return [255, 0, v];
    default: 
      return [0,0,0];
  }
}