var harmonograph;
paper.install(window);

window.onload = function () {
  paper.setup("paperCanvas");
  harmonograph = new Harmonograph();
  addDatGui();
  harmonograph.render();
};


var Harmonograph = function () {

  var ref = this;

  this.freqRatio = 1 / 3;
  this.noise = 10 + (100 - 10) * Math.random();
  this.rotational = false;
  this.rotWork = 0.5;

  this.render = function () {

    project.clear();

    var phaseX = Math.PI / 2;
    var phaseS = 0;
    var phaseY = 0;

    var amplY = 0.8 * view.center.y;
    var amplX = 0.6 * view.center.x;
    var amplS = 0.6 * view.center.x;
    
    var origAmpl = amplX;
    var decay = 1 / 2000;

    var time = 0;
    var tick = 0.1;
    var timePerLoop = 200;

    var freqS = (!this.rotational ? 2 : 3 / 2) * this.freqRatio;
    var noiseX = (2 * Math.random() - 1) * this.noise / 10000;
    //var noiseX = 0;
    var noiseS = (2 * Math.random() - 1) * this.noise / 10000;
    //var noiseS = 0;
    var noiseY = (2 * Math.random() - 1) * this.noise / 10000;
    //var noiseY = 0;

    var segments = [];

    view.onFrame = null;
    view.onFrame = function (event) {

      with (ref) {

        if (amplX > 0.1) {

          for (var i = timePerLoop - 1; i >= 0; i--) {

            x = view.center.x + 
            amplX * Math.sin(phaseX + time * (1 + noiseX)) * (1 - rotWork) + 
            amplS * Math.sin(phaseS + time * (freqS + noiseS)) * rotWork;
            
            if (rotational) {
              y = view.center.y + 
              amplY * Math.sin(phaseY + time * (freqRatio + noiseY)) * (1 - rotWork) - 
              amplS * Math.cos(phaseS + time * (freqS + noiseS)) * rotWork;
            }
            else {
              y = view.center.y + 
              amplY * Math.sin(phaseY + time * (freqRatio + noiseY));
            }
            
            amplX *= (1 - decay * tick);
            amplY *= (1 - decay * tick);
            amplS *= (1 - decay * tick);

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
    load: datJSON, 
    preset: "Unison"
  });

  gui.remember(harmonograph);

  gui.add(harmonograph, "freqRatio", 0.5, 3).onChange(function (value) {
    harmonograph.freqRatio = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "noise", 10, 100).onChange(function (value) {
    harmonograph.noise = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "rotational").onChange(function (value) {
    harmonograph.rotary = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "rotWork", 0.0, 1.0).onChange(function (value) {
    harmonograph.rotary = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "render");
};

var datJSON = {
  "remembered": {
    "Unison": {
      "0": {
        "freqRatio": 1
      }
    }, 
    "Octave": {
      "0": {
        "freqRatio": 2
      }
    }, 
    "5th": {
      "0": {
        "freqRatio": 3 / 2
      }
    }, 
    "4th": {
      "0": {
        "freqRatio": 4 / 3
      }
    }, 
    "Major 6th": {
      "0": {
        "freqRatio": 5 / 3
      }
    }, 
    "Major 3rd": {
      "0": {
        "freqRatio": 5 / 4
      }
    }, 
    "Minor 3rd": {
      "0": {
        "freqRatio": 6 / 5
      }
    }, 
    "Perfect 11th": {
      "0": {
        "freqRatio": 8 / 3
      }
    }, 
    "7th-limit jazz tuning": {
      "0": {
        "freqRatio": 7 / 3
      }
    }
  },
  "closed": false,
  "folders": {}
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
      };
      var blobJSN = new Blob([jsn], {type: "application/json;charset=utf-8"});
      saveAs(blobJSN, curTime+'.txt');
    }
  }
}