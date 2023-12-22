var Puzzles = [
  null, // no puzzle #000 to avoid confusion
  {
    elem: "puzzle001",
    canvas: "puzzle001-canvas",
    ctx: null,
    bitmap: `.X.#
             .###
             ####
             ####
             ###.
             .^..`.replaceAll(' ', '').split('\n'),
    sprites: {
      inspector: [1, 5, "bo-at", 60, 60, 0, 0],
      red:       [1, 2, "allen-red", 59, 60, 0, 0],
      green:      [3, 2, "allen-green", 59, 60, 0, 0]
    },
    newSprites: {
      inspector: [1, 5],
      red:       [1, 2],
      green:     [3, 2]
    },
    originalSprites: {
      inspector: [1, 5, "bo-at", 60, 60, 0, 0],
      red:       [1, 2, "allen-red", 59, 60, 0, 0],
      green:      [3, 2, "allen-green", 59, 60, 0, 0]
    },
    grid: {
      x: 64,
      y: 32,
      width: 0,
      height: 0
    },
    listenerActive: true,
    setGridWH: function() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.grid.width = this.canvas.width - (this.grid.x * 2);
      this.grid.height = this.canvas.height - (this.grid.y * 2);
    },
    load: function () {
      // stop loop
      loopStop = true;
      // load elements
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);
      if (this.ctx == null) {
        this.canvas = document.getElementById(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        // disable image smoothing
        this.ctx.imageSmoothingEnabled = false;
      }

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      elems.sidemenu.classList.remove("hidden");

      // load font
      var font = new FontFace('myFont', 'url(./assets/font.ttf)');
      font.load().then(function(loadedFont) {
        document.fonts.add(loadedFont);
        // just in case
        clearInterval(Puzzles[1].animationInterval);
        clearInterval(Puzzles[1].idleInterval);
        // load puzzle
        window.addEventListener("keydown", Puzzles[1].listener);
        Puzzles[1].idleInterval = setInterval(Puzzles[1].idle, 300);
        setTimeout(() => { Puzzles[1].loop() }, 100);
      });
    },
    idle: function() {
      Puzzles[1].sprites.red[5] = !Puzzles[1].sprites.red[5];
      Puzzles[1].sprites.green[5] = !Puzzles[1].sprites.green[5];
      Puzzles[1].drawPond();
    },
    loop: function() {
      this.drawPond();
      if (this.checkStatus() == true) {
        this.win();
      } else if (this.checkStatus() == false) {
        this.lose();
      }
    },
    drawPond: function() {
      // resize canvas
      this.setGridWH();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // draw pond
      var pondX = (this.canvas.width - (this.canvas.height * (elems["allen-pond"].width / elems["allen-pond"].height))) / 2;
      this.ctx.drawImage(
        elems["allen-pond"],
        pondX,
        0,
        this.canvas.height * (elems["allen-pond"].width / elems["allen-pond"].height),
        this.canvas.height
      );

      this.drawSprites();
    },
    startAnimation: function() {
      // remove event listener
      // window.removeEventListener("keydown", this.listener);
      this.listenerActive = false;
      // start animation
      for (var i in this.sprites) {
        var sprite = this.sprites[i];
        var newSprite = this.newSprites[i];
        // all this sprite talk is making me thirsty
        newSprite[2] = newSprite[0] - sprite[0];
        newSprite[3] = newSprite[1] - sprite[1];
      }
      // change inspector to second frame
      this.sprites.inspector[5] = 1;
      this.animationInterval = setInterval(() => {
        this.animate();
        this.drawPond();
      }, 1000 / 30);
    },
    animate: function() {
      var animationSteps = 60;
      for (var i in Puzzles[1].newSprites) {
        var sprite = Puzzles[1].sprites[i];
        var newSprite = Puzzles[1].newSprites[i];
        // move sprite 1/animationSteps of the way to newSprite
        var xStep = newSprite[2] / animationSteps;
        var yStep = newSprite[3] / animationSteps;
        sprite[0] += xStep;
        sprite[1] += yStep;
      }
      // check if done, keeping in mind floating point errors
      var done = true;
      for (var i in Puzzles[1].newSprites) {
        var sprite = Puzzles[1].sprites[i];
        var newSprite = Puzzles[1].newSprites[i];
        if (Math.abs(sprite[0] - newSprite[0]) > 0.01 || Math.abs(sprite[1] - newSprite[1]) > 0.01) {
          done = false;
          break;
        }
      }
      if (done) {
        Puzzles[1].stopAnimation();
        Puzzles[1].loop();
      }
    },
    stopAnimation: function() {
      clearInterval(this.animationInterval);
      // round off sprites
      for (var i in this.sprites) {
        var sprite = this.sprites[i];
        sprite[0] = Math.round(sprite[0]);
        sprite[1] = Math.round(sprite[1]);
      }
      // return inspector to fram 0
      this.sprites.inspector[5] = 0;

      // window.addEventListener("keydown", this.listener);
      this.listenerActive = true;
    },
    drawSprites: function() {
      var squareSize = this.grid.width / this.bitmap[0].length;

      for (var i in this.sprites) {
        var sprite = this.sprites[i];
        // rotate canvas to sprite[6] degrees
        this.ctx.save();
        var imgCenterX = this.grid.x + (sprite[0] * squareSize) + (squareSize / 2);
        var imgCenterY = this.grid.y + (sprite[1] * squareSize) + (squareSize / 2);
        this.ctx.translate(imgCenterX, imgCenterY);
        this.ctx.rotate(sprite[6] * Math.PI / 180);
        this.ctx.drawImage(
          elems[sprite[2]],
          0,                                            // sx
          sprite[4] * sprite[5],                        // sy
          sprite[3],                                    // swidth
          sprite[4],                                    // sheight
          -squareSize / 2,                              // dx
          -squareSize / 2,                              // dy
          squareSize,                                   // dwidth
          squareSize                                    // dheight
        )
        this.ctx.restore();
      }
    },
    moveAll: function(dir) {
      for (var i in this.sprites) {
        var sprite = this.sprites[i];
        var newSprite = this.newSprites[i];
        // reset newSprite
        newSprite[0] = sprite[0];
        newSprite[1] = sprite[1];
        if (i == "green") {
          // invert direction
          if (dir == "up") {
            dir = "down";
          } else if (dir == "down") {
            dir = "up";
          } else if (dir == "left") {
            dir = "right";
          } else if (dir == "right") {
            dir = "left";
          }
        }
        
        if (!this.canMove(sprite, dir)) {
          if (i == "inspector") break;
          continue;
        }
        this.moveSprite(sprite, newSprite, dir);
      }
      this.startAnimation();
    },
    win: function() {
      clearInterval(Puzzles[1].animationInterval);
      clearInterval(Puzzles[1].idleInterval);
      
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    lose: function() {
      clearInterval(Puzzles[1].animationInterval);
      clearInterval(Puzzles[1].idleInterval);

      alert("Incorrect!", "You failed to solve the puzzle.", true);
      this.reset();
    },
    canMove: function(sprite, dir) {
      if (dir == "up") {
        if (sprite[0] < 0 || sprite[0] >= this.bitmap[0].length   ||   sprite[1] - 1 < 0 || sprite[1] - 1 >= this.bitmap.length) return false;
        if (this.bitmap[sprite[1] - 1][sprite[0]] == undefined || this.bitmap[sprite[1] - 1][sprite[0]] == '.') return false;
        return true;
      }
      if (dir == "down") {
        if (sprite[0] < 0 || sprite[0] >= this.bitmap[0].length   ||   sprite[1] + 1 < 0 || sprite[1] + 1 >= this.bitmap.length) return false;
        if (this.bitmap[sprite[1] + 1][sprite[0]] == undefined || this.bitmap[sprite[1] + 1][sprite[0]] == '.') return false;
        return true;
      }
      if (dir == "left") {
        if (sprite[0] - 1 < 0 || sprite[0] - 1 >= this.bitmap[0].length   ||   sprite[1] < 0 || sprite[1] >= this.bitmap.length) return false;
        if (this.bitmap[sprite[1]][sprite[0] - 1] == undefined || this.bitmap[sprite[1]][sprite[0] - 1] == '.') return false;
        return true;
      }
      if (dir == "right") {
        if (sprite[0] + 1 < 0 || sprite[0] + 1 >= this.bitmap[0].length   ||   sprite[1] < 0 || sprite[1] >= this.bitmap.length) return false;
        if (this.bitmap[sprite[1]][sprite[0] + 1] == undefined || this.bitmap[sprite[1]][sprite[0] + 1] == '.') return false;
        return true;
      }
      return false;
    },
    // checkstatus function, animation buffer, animate function
    moveSprite: function(origSprite, sprite, dir) {
      if (dir == "up") {
        if (origSprite == this.sprites.inspector) origSprite[6] = 0;
        sprite[1] -= 1;
      } else if (dir == "down") {
        if (origSprite == this.sprites.inspector) origSprite[6] = 180;
        sprite[1] += 1;
      } else if (dir == "left") {
        if (origSprite == this.sprites.inspector) origSprite[6] = 270;
        sprite[0] -= 1;
      } else if (dir == "right") {
        if (origSprite == this.sprites.inspector) origSprite[6] = 90;
        sprite[0] += 1;
      }
    },
    checkStatus: function() {
      // check for being eaten
      var inspector = this.sprites.inspector;
      for (var i in this.sprites) {
        if (this.sprites[i] == inspector) continue;
        var sprite = this.sprites[i];
        // in the same square
        if (sprite[0] == inspector[0] && sprite[1] == inspector[1]) {
          return false;
        }
        // adjacent
        if (sprite[0] == inspector[0]) {
          if (sprite[1] == inspector[1] - 1 || sprite[1] == inspector[1] + 1) {
            return false;
          }
        }
        if (sprite[1] == inspector[1]) {
          if (sprite[0] == inspector[0] - 1 || sprite[0] == inspector[0] + 1) {
            return false;
          }
        }
      }
      // check for being at the FINISH
      if (this.bitmap[inspector[1]][inspector[0]] == 'X') {
        return true;
      }
      return null;
    },
    listener: function(e) {
      e.preventDefault();
      if (!Puzzles[1].listenerActive) return;
      var key = e.key;
      if (key == "ArrowUp") {
        Puzzles[1].moveAll("up");
      } else if (key == "ArrowDown") {
        Puzzles[1].moveAll("down");
      } else if (key == "ArrowLeft") {
        Puzzles[1].moveAll("left");
      } else if (key == "ArrowRight") {
        Puzzles[1].moveAll("right");
      }
      Puzzles[1].loop();
    },
    unload: function() {
      clearInterval(this.animationInterval);
      clearInterval(this.idleInterval);
      window.removeEventListener("keydown", this.listener);
      setTimeout(() => {
        elems.sidemenu.classList.add("hidden");
        loopStop = false;
        loop();
      }, 3000);
    },
    reset: function() {
      window.removeEventListener("keydown", this.listener);
      setTimeout(() => {
        Puzzles[1].sprites = JSON.parse(JSON.stringify(Puzzles[1].originalSprites));
        Puzzles[1].load();
      }, 3000);
    }
  },
  {
    elem: "puzzle002",
    load: function () {
      loopStop = true;
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      elems.sidemenu.classList.remove("hidden");
    },
    check: function () {
      var selectElem = document.getElementById("puzzle002-liar");
      var selected = selectElem.options[selectElem.selectedIndex].value;

      if (selected == "D") {
        this.win();
      } else {
        this.lose();
      }
    },
    win: function () {
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    lose: function () {
      alert("Incorrect!", "You failed to solve the puzzle.", true);
    },
    unload: function() {
      window.removeEventListener("keydown", this.listener);
      elems.sidemenu.classList.add("hidden");
        loopStop = false;
      setTimeout(loop, 3000);
    }
  },
  {
    elem: "puzzle003",
    load: function () {
      loopStop = true;
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      elems.sidemenu.classList.remove("hidden");
    },
    check: function () {
      var selectElem = document.getElementById("puzzle003-select");
      var selected = selectElem.options[selectElem.selectedIndex].value;

      if (selected == "A") {
        this.win();
      } else {
        this.lose();
      }
    },
    win: function () {
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    lose: function () {
      alert("Incorrect!", "You failed to solve the puzzle.", true);
    },
    unload: function() {
      window.removeEventListener("keydown", this.listener);
      elems.sidemenu.classList.add("hidden");
        loopStop = false;
      setTimeout(loop, 3000);
    }
  },
  {
    elem: "puzzle004",
    load: function () {
      loopStop = true;
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      addEventListener("keydown", this.listener);
      elems.sidemenu.classList.remove("hidden");
    },
    listener: function(event) {
      if (event.key == "Enter") Puzzles[4].check();
    },
    check: function () {
      var elem = document.getElementById("puzzle004-input");
      var value = elem.value;
      if (value == "2541") return this.win();
      return this.lose();
    },
    win: function () {
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    lose: function () {
      alert("Incorrect!", "You failed to solve the puzzle.", true);
    },
    unload: function() {
      window.removeEventListener("keydown", this.listener);
      elems.sidemenu.classList.add("hidden");
      loopStop = false;
      setTimeout(loop, 3000);
    }
  },
  {
    elem: "puzzle005",
    solutionCheckboxes: [
      "puzzle005-A0",
      "puzzle005-B0",
      "puzzle005-C0",
      "puzzle005-D0",
      "puzzle005-E0",
      "puzzle005-F0",
      "puzzle005-G0"
    ],
    byproductCheckboxes: [
      "puzzle005-A1",
      "puzzle005-B1",
      "puzzle005-C1",
      "puzzle005-D1",
      "puzzle005-E1",
      "puzzle005-F1",
      "puzzle005-G1"
    ],
    load: function () {
      loopStop = true;
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);

      // load solutionCheckboxes
      for (var i in this.solutionCheckboxes) {
        this.solutionCheckboxes[i] = document.getElementById(this.solutionCheckboxes[i]);
      }
      // load byproductCheckboxes
      for (var i in this.byproductCheckboxes) {
        this.byproductCheckboxes[i] = document.getElementById(this.byproductCheckboxes[i]);
      }

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      elems.sidemenu.classList.remove("hidden");
    },
    check: function () {
      var solution = 0;
      var byproduct = 0;
      for (var i in this.solutionCheckboxes) {
        var checkbox = this.solutionCheckboxes[i];
        if (checkbox.checked) solution += parseInt(checkbox.value);
      }
      for (var i in this.byproductCheckboxes) {
        var checkbox = this.byproductCheckboxes[i];
        if (checkbox.checked) byproduct += parseInt(checkbox.value);
      }
      // check if one was used twice
      for (var i in this.solutionCheckboxes) {
        if (this.solutionCheckboxes[i].checked && this.byproductCheckboxes[i].checked) return this.lose();
      }
      if (solution !== 29 || byproduct !== 30) return this.lose();
      return this.win();
    },
    win: function () {
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    lose: function () {
      alert("Incorrect!", "You failed to solve the puzzle.", true);
    },
    unload: function() {
      window.removeEventListener("keydown", this.listener);
      elems.sidemenu.classList.add("hidden");
      loopStop = false;
      setTimeout(loop, 3000);
    }
  },
  {
    elem: "puzzle006",
    solutionCheckboxes: [
      "puzzle006-red",
      "puzzle006-blue",
      "puzzle006-green",
      "puzzle006-yellow",
      "puzzle006-white"
    ],
    timer: {
      elem: "puzzle006-clock",
      time: "276000",
      update: function() {
        // called every 10ms
        this.time -= 10;

        var playsound = false;
        if (this.time <= 0) return Puzzles[6].timeout();
          
        if (this.time < 30000 && this.time % 250 == 0) {
          playsound = true;
        } if (this.time < 60000 && this.time % 500 == 0) {
          playsound = true;
        } else if (this.time % 1000 == 0) {
          playsound = true;
        }
        if (playsound) {
          elems.beep.currentTime = 0;
          elems.beep.play();
        }

        // if time > 1 minute, display MM:SS
        if (this.time > 60000) {
          var minutes = Math.floor(this.time / 60000);
          var seconds = Math.floor((this.time % 60000) / 1000);
          if (seconds < 10) seconds = "0" + seconds;
          document.getElementById(this.elem).innerHTML = minutes + ":" + seconds;
        } else {
          // display SS:MS
          var seconds = Math.floor(this.time / 1000);
          var millis = this.time % 1000;
          if (millis < 100) millis = "0" + millis;
          if (millis < 10) millis = "0" + millis;
          // remove last 0 from millis
          millis = String(millis).slice(0, -1);
          document.getElementById(this.elem).innerHTML = seconds + ":" + millis; 
        }
      }
    },
    load: function () {
      loopStop = true;
      if (typeof (this.elem) == "string") this.elem = document.getElementById(this.elem);

      // load checkboxes
      for (var i in this.solutionCheckboxes) {
        this.solutionCheckboxes[i] = document.getElementById(this.solutionCheckboxes[i]);
      }
      // start timer >:)
      this.timer.interval = setInterval(() => { this.timer.update() }, 10);

      // show puzzle
      for (var i of elems.sidemenu.children) i.classList.add("hidden");
      this.elem.classList.remove("hidden");
      elems.sidemenu.classList.remove("hidden");
    },
    check: function () {
      // check if solutions 2 and 4 are checked
      if (!this.solutionCheckboxes[1].checked || !this.solutionCheckboxes[3].checked) return this.lose();
      if (this.solutionCheckboxes[0].checked || this.solutionCheckboxes[2].checked || this.solutionCheckboxes[4].checked) return this.lose();
      return this.win();
    },
    win: function () {
      alert("Correct!", "You successfully solved the puzzle!", true);
      this.unload();
    },
    timeout: function () {
      document.getElementById(this.timer.elem).innerHTML = "0:00";
      elems.longBeep.currentTime = 0;
      elems.longBeep.play();
      alert("Puzzle failed!", "You ran out of time!", true);
      this.reset();
    },
    reset: function () {
      this.timer.time = 276000;
      this.timer.update();
    },
    lose: function () {
      alert("Incorrect!", "30 seconds have been subtracted from the timer.", true);
      this.timer.time -= 30000;
    },
    unload: function() {
      clearInterval(this.timer.interval);
      window.removeEventListener("keydown", this.listener);
      elems.sidemenu.classList.add("hidden");
      loopStop = false;
      setTimeout(loop, 3000);
    }
  }
]