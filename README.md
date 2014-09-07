### bez

shaping sounds w/ bezier curves, an interactive demo with high hopes!



##### commands
- drag red dots to change shape
- drag gray top slider to change pitch
- double-click on red dot to remove control point
- double-click anywhere else to add control point
- 'M' toggles mute
- 'A' toggles web audio fft output
- '1 - 9' select preset
- Alt + '1 - 9' save preset to browser local storage
- 'R' toggles pitch sweep (up/down 1 octave)



Also, the shapes we're working with here are actually based on nurbs, a type of b-spline similar to beziers (segments are calculated the same but composite function is simpler as no intermediate end points need be defined).
