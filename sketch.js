  // -----------
  // Sabrina Kantor
  // -----------

  var radius = 120;
  var centerX = 300;
  var centerY = 200;
  var points = [];
  var invert = false;
  var playing = false;

  var song, analyzer;

  function preload() {
      song = loadSound('assets/song3.mp3');
  }

  function rotateCircle() {
      translate(490, -100);
      rotate(PI / 2.0);
  }

  function setup() {
      var myCanvas = createCanvas(600, 400);
      myCanvas.parent("music-container");


      var button = createButton('invert');

      button.position(530, 10);
      button.mouseClicked(changeBG);
      button.parent("controls");


      var play = createButton("play");
      play.position(530, 30);
      play.mouseClicked(playSong);
      play.parent("controls");

      sliderR = createSlider(0, 255, 100);
      sliderR.position(10, 10);
      sliderR.style('width', '80px');
      sliderR.parent("controls");

      sliderG = createSlider(0, 255, 100);
      sliderG.position(10, 30);
      sliderG.style('width', '80px');
      sliderG.parent("controls");

      sliderB = createSlider(0, 255, 100);
      sliderB.position(10, 50);
      sliderB.style('width', '80px');
      sliderB.parent("controls");

      rotateCircle();


      // create a new Amplitude analyzer
      analyzer = new p5.Amplitude();
      //frequency
      fft = new p5.FFT();
      // Patch the input to an volume analyzer
      analyzer.setInput(song);


      //sets all the points
      // one extra point to connect line
      for (var i = 0; i < 101; i++) {
          var degree = i * (360 / 100);
          var radian = degree * (PI / 180);
          var p = new Point(radian);

          points.push(p);
      }

  }

  function changeBG() {
      invert = !invert;
  }

  function playSong() {
      if (!playing) {
          song.loop();

      } else {
          song.pause();
      }
      playing = !playing;
  }

  function CoSine(angle, add) {
      var length = radius + add;
      return (cos(angle) * length) + centerX;
  }

  function Sine(angle, add) {
      var length = radius + add;
      return (-sin(angle) * length) + centerY;
  }


  function loudestFrequency(base, lowMid, highMid, treble) {
      if ((base.value > lowMid.value) && (base.value > highMid.value) && (base.value > treble.value)) {
          return base;
      } else if ((lowMid.value > base.value) && (lowMid.value > highMid.value) && (lowMid.value > treble.value)) {
          return lowMid;
      } else if ((highMid.value > treble.value) && (highMid.value > base.value) && (highMid.value > lowMid.value)) {
          return highMid;
      } else {
          return treble;
      }
  }

  function Line(add, frequency) {
      this.add = add;
      this.frequency = frequency;
      this.display = function () {


          var vol = analyzer.getLevel();
          var freq = fft.analyze();
          noFill();
          strokeWeight(9);

          for (var i = 0; i < points.length - 2; i++) {
              for (var i = 0; i < points.length; i++) {
                  //+ 110 gets rid of the weird right side sticking out too far
                  var a = freq[i + 200];
                  //modifies the amplitude
                  var biggestAmp = map(vol, 0, 1, 0, 255);
                  var amp = map(a, 0, 255, 0, biggestAmp);
                  points[i].amplitude = amp;

                  points[i].display();

              }

          }
      }
  }




  function draw() {


      var valR = sliderR.value();
      var valG = sliderG.value();
      var valB = sliderB.value();

      var circleColor = color(valR, valG, valB);
      strokeWeight(2);

      //INVERTS COLOR
      if (!invert) {
          background(240);
      } else {
          background(color(valR, valG, valB));
          circleColor = color(240);
      }

      var vol = analyzer.getLevel();
      var freq = fft.analyze();


      //base points(49 - 63) frequency(96,128)
      var base = new Frequency(freq.length - (freq.length / 4), freq.length);

      //mid-low 33 - 48
      var midLow = new Frequency(freq.length - 2 * (freq.length / 4),
          freq.length - (freq.length / 4));

      //mid-high 17 - 32
      var midHigh = new Frequency(freq.length - 3 * (freq.length / 4),
          freq.length - 2 * (freq.length / 4));

      //treble 0 - 16
      var treble = new Frequency(1, freq.length - 3 * (freq.length / 4));

      var loudest = loudestFrequency(base, midLow, midHigh, treble);



      //draws all the intial points
      for (var i = 0; i < points.length; i++) {
          //+ 110 gets rid of the weird right side sticking out too far
          var a = freq[i + 200];
          //modifies the amplitude
          var biggestAmp = map(vol, 0, 1, 0, 255);
          var amp = map(a, 0, 255, 0 - (biggestAmp * .9), biggestAmp);
          points[i].amplitude = amp;
          stroke(circleColor);
          points[i].display();

      }

      //draws the line
      var line1 = new Line(0, new Frequency(0, 0));

  }


  function Point(angle) {
      this.amplitude = 0;
      this.angle = angle;
      this.xVal = CoSine(this.angle, 0);
      this.yVal = Sine(this.angle, 0);


      this.display = function () {


          var amp = map(this.amplitude, 0, 255, 0, -340);
          var amp2 = map(this.amplitude, 0, 255, 0, -480);


          fill(0);

          strokeWeight(2.5);
          point(CoSine(angle, (amp2 - 6)), Sine(angle, (amp2 - 6)))
          line(this.xVal, this.yVal, CoSine(angle, (amp)), Sine(angle, (amp)));

      }




  }

  function Frequency(low, high) {
      this.low = low;
      this.high = high;
      this.value = fft.getEnergy(low, high);
  }
