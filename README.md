### bez

shaping sounds w/ bezier curves, an interactive demo with high hopes!


http://concutere.com/bez/bez.html (Chrome only for now)


##### commands


(will use first MIDI input found, otherwise shaping sound waves will drone a middle C)
- drag red dots to change shape
- double-click on red dot to remove control point
- double-click anywhere else to add control point
- 'M' toggles mute
- 'G' toggles web audio fft output
- '1 - 9' select preset
- Alt + '1 - 9' save preset to browser local storage
- 'A' toggles ADSR edit path



Also, the shapes we're working with here are actually based on nurbs, a type of b-spline similar to beziers (segments are calculated the same but composite function is simpler as no intermediate end points need be defined).
