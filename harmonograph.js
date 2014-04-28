var harmonograph;
paper.install(window);

window.onload = function () {
  paper.setup("myCanvas");
  harmonograph = new Harmonograph();
  addDatGui();
  harmonograph.render();
};


var Harmonograph = function () {

  var ref = this;

  this.x = view.center.x, this.y = view.center.y;
  this.freqX = 1;
  this.freqS = 1;
  this.freqY = 1;
  this.amplitude;
  this.time, this.tick;
  this.decay = 1 / 10000;
  this.timeFactor = 100;

  this.scaleToView = false;

  this.render = function () {

    project.clear();

    this.phaseX = 2 * Math.PI * Math.random();
    this.phaseS = 2 * Math.PI * Math.random();
    this.phaseY = 2 * Math.PI * Math.random();

    this.amplY = view.center.y / 2;
    this.amplX = this.scaleToView ? view.center.x / 2 : this.amplY;
    this.amplS = view.center.x / 4;
    var origAmpl = this.amplX;

    this.time = 0;
    this.tick = 0.15 * Math.min(this.freqX / this.freqY, 1.0);

    var noiseFactor = 0.01;
    this.noiseX = (2 * Math.random() - 1) * noiseFactor;
    this.noiseS = (2 * Math.random() - 1) * noiseFactor;
    this.noiseY = (2 * Math.random() - 1) * noiseFactor;

    var segments = [];

    view.onFrame = null;
    view.onFrame = function (event) {

      with (ref) {

        if (amplX > 1) {

          for (var i = timeFactor - 1; i >= 0; i--) {

            x = view.center.x + 
            amplX * Math.sin((Math.PI / 6 * freqX + noiseX) * time + phaseX) + 
            amplS * Math.sin((Math.PI / 6 * freqS + noiseS) * time + phaseS);
            
            y = view.center.y + 
            amplY * Math.sin((Math.PI / 6 * freqY + noiseY) * time + phaseY);
            
            amplX = amplX * (1 - decay);
            amplY = amplY * (1 - decay);
            amplS = amplS * (1 - decay);

            segments.push([x, y]);

            time += tick;
          };

          var path = new Path({
            segments: segments,
            strokeColor: "black"
          });

          path.strokeColor.alpha = 0.8 * amplX * (1 - amplX / origAmpl) / origAmpl;

          path.smooth();

          segments = [[x, y]];
        }
      }
    };
  };
};

var addDatGui = function () {

  var gui = new dat.GUI({
    load: {
      "remembered": {
        "Unison": {
          "0": {
            "freqX": 2,
            "freqS": 4,
            "freqY": 2
          }
        }, 
        "Octave": {
          "0": {
            "freqX": 2,
            "freqS": 4,
            "freqY": 4
          }
        }, 
        "5th": {
          "0": {
            "freqX": 4,
            "freqS": 6,
            "freqY": 6
          }
        }, 
        "4th": {
          "0": {
            "freqX": 6,
            "freqS": 8,
            "freqY": 8
          }
        }, 
        "Major 6th": {
          "0": {
            "freqX": 3,
            "freqS": 5,
            "freqY": 5
          }
        }, 
        "Major 3rd": {
          "0": {
            "freqX": 4,
            "freqS": 5,
            "freqY": 5
          }
        }, 
        "Minor 3rd": {
          "0": {
            "freqX": 5,
            "freqS": 6,
            "freqY": 6
          }
        }, 
        "Perfect 11th": {
          "0": {
            "freqX": 3,
            "freqS": 8,
            "freqY": 8
          }
        }, 
        "7th-limit jazz tuning": {
          "0": {
            "freqX": 3,
            "freqS": 7,
            "freqY": 7
          }
        }, 
        "random": {
          "0": {
            "freqX": Math.floor(Math.random() * 12),
            "freqS": Math.floor(Math.random() * 12),
            "freqY": Math.floor(Math.random() * 12)
          }
        }
      },
      "closed": false,
      "folders": {
        "X": {
          "closed": true,
        },
        "Y": {
          "closed": true,
        }
      }
    }, 
    preset: "Unison"
  });

gui.remember(harmonograph);
gui.add(harmonograph, "freqX", 1, 12).step(1).onChange(function (value) {
  harmonograph.freqX = value;
  harmonograph.render();
});
gui.add(harmonograph, "freqY", 1, 12).step(1).onChange(function (value) {
  harmonograph.freqY = value;
  harmonograph.render();
});
gui.add(harmonograph, "freqS", 0, 12).step(1).onChange(function (value) {
  harmonograph.freqS = value;
  harmonograph.render();
});
gui.add(harmonograph, "scaleToView").onChange(function (value) {
  harmonograph.scaleToView = value;
  harmonograph.render();
});
gui.add(harmonograph, "render");
};


if (location.hostname == "localhost") {

  window.onkeyup = function(e) {

    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 83) {

      var curTime = (+new Date);

      var svg = paper.project.exportSVG({asString: true});
      var blobSVG = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
      saveAs(blobSVG, curTime+'.svg');

      var jsn = {
        freqX: harmonograph.freqX,
        freqY: harmonograph.freqY,
        freqS: harmonograph.freqS,
        noiseX: harmonograph.noiseX,
        noiseY: harmonograph.noiseY,
        noiseS: harmonograph.noiseS
      };
      var blobJSN = new Blob([jsn], {type: "application/json;charset=utf-8"});
      saveAs(blobJSN, curTime+'.txt');
    }
  }
}