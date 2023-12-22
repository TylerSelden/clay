var settings = {
  playerName: {
    change: function(save) {
      setTimeout(() => {
        playerName = (elems.playerName.value.trim() == "") ? "Saul" : elems.playerName.value.trim();
        if (save !== true) saveSettings();
      }, 10);
    },
    save: function() {
      return playerName;
    },
    load: function(data) {
      playerName = data;
      elems.playerName.value = playerName;
    }
  },
  hardMode: {
    value: false,
    change: function(save) {
      this.value = !this.value;
      elems.hardMode.classList.toggle("enabled");
      elems.hardMode.innerHTML = this.value ? "Enabled" : "Disabled";
      if (save !== true) saveSettings();
    },
    save: function() {
      return this.value;
    },
    load: function(data) {
      if (data) this.change(true);
    }
  },
  reset: {
    value: true,
    change: function() {
      confirm("Warning", "This will erase your save. Are you sure?", reset);
    }
  },
  volume: {
    value: 95,
    change: function(save) {
      this.value = elems.volume.value;
      for (var i in elems) {
        // check if elem is audio element
        if (elems[i].tagName == "AUDIO") {
          elems[i].volume = this.value / 100;
        }
      }
      if (save !== true) saveSettings();
    },
    save: function() {
      return this.value;
    },
    load: function(data) {
      this.value = data;
      elems.volume.value = this.value;
      this.change(true);
    }
  }
}

function saveSettings() {
  var data = {};
  for (var i in settings) {
    var setting = settings[i];
    if (setting.save !== undefined) data[i] = setting.save();
  }
  localStorage.setItem("settings", JSON.stringify(data));
}

function loadSettings() {
  var data = JSON.parse(localStorage.getItem("settings"));
  if (data == null) return;
  for (var i in data) {
    var setting = settings[i];
    setting.load(data[i]);
  }
}

function loadMenu() {
  // check if savedata exists
  if (localStorage.getItem("saveData") !== null) {
    document.getElementById("continue").disabled = false;
  }
}

function continueGame(username) {
  if (username !== undefined) {
    elems.playerName.value = username;
    settings.playerName.change();
    alert("Info", "This game features autosaving.", true, () => {
      elems.titlescreen.classList.add("hidden");
      load(loadAssets);
    });
    return;
  }
  
  elems.titlescreen.classList.add("hidden");
  load(loadAssets);
}

function newGame() {
  if (localStorage.getItem("saveData") !== null) {
    confirm("Warning", "This will erase your save. Are you sure?", () => {
      localStorage.removeItem("saveData");
      prompt("Your name", "Please enter your first name below.", continueGame, "Saul");
    });
  } else {
    prompt("Your name", "Please enter your first name below.", continueGame, "Saul");
  }
}

function toggleSettingsMenu() {
  var settingsMenu = document.getElementById("settings-menu");
  settingsMenu.classList.toggle("hidden");
  var settingsClickout = document.getElementById("settings-clickout");
  settingsClickout.classList.toggle("hidden");
}

function toggleOptions(opt1, opt2) {
  // use hidden class, if already hidden take opt1 and opt2 and fill the buttons
  if (elems.options.classList.contains("hidden")) {
    // reposition options at the bottom of the container :)
    elems.output.removeChild(elems.options);
    elems.output.appendChild(elems.options); 
    elems.options.classList.remove("hidden");
    elems.opt1.innerHTML = opt1;
    elems.opt2.innerHTML = opt2;
    return;
  }
  elems.options.classList.add("hidden");
}

// ok so the way this works is actually super complicated so don't even ask
// just-- don't touch

function output(text, delayTime) {

  // Check if the user is at the bottom of the page
  var atBottom = (document.scrollingElement.scrollTop + document.scrollingElement.clientHeight) == document.scrollingElement.scrollHeight;

  // Create a new paragraph element
  var p = document.createElement("p");
  var elemStack = [p];

  // Append the paragraph element to the output container
  elems.output.appendChild(p);

  // load sounds / saul sounds
  var typewriterfull = (settings.hardMode.value) ? elems.chicken : elems.typewriterfull;
  var newline = (settings.hardMode.value) ? elems.chickenNewline : elems.newline;
  var returnbell = (settings.hardMode.value) ? elems.chickenNewline : elems.returnbell;
  var click0 = (settings.hardMode.value) ? elems.chick0 : elems.click0;
  var click1 = (settings.hardMode.value) ? elems.chick1 : elems.click1;
  var click2 = (settings.hardMode.value) ? elems.chick2 : elems.click2;

  // play typewriter sounds
  if (outputSpeed == defaultOutputSpeed) {
    typewriterfull.play();
    typewriterfull.addEventListener("ended", function() {
      typewriterfull.currentTime = 0;
      typewriterfull.play();
    });
  }

  var i = 0;
  var interval = setInterval(function() {
    // Check if the next character is the beginning of an HTML element
    if (text[i] == "<") {
      var j = i;

      // Check if it's a closing tag
      if (text[j + 1] == "/") {
        // Closing tag
        while (text[j] !== ">") j++;
        elemStack.pop();
      } else {
        // Opening tag
        while (text[j] !== ">") j++;

        // Create the element
        var sandbox = document.createElement("div");
        sandbox.innerHTML = text.substring(i, j + 1);
        var elem = sandbox.firstChild;

        // Add the element to the stack
        elemStack[elemStack.length - 1].appendChild(elem);
        elemStack.push(elem);
      }

      i = j + 1;
    }

    // check for JS code snippet inside ${}  (eval if its there)
    var brackets = 0;
    var codeStr;
    if (text[i] == "$" && text[i + 1] == "{" && text.substring(i).includes("}")) {
      brackets = 1;
      var j = i + 2;
      while (brackets > 0) {
        if (text[j] == "{") brackets++;
        if (text[j] == "}") brackets--;
        j++;
      }
      var code = text.substring(i + 2, j - 1);
      codeStr = eval(`function dummy() {${code};} dummy();`);
      i = j;
    }
    // if codeStr is defined, output that too at its position
    if (codeStr !== undefined) {
      text = text.slice(0, i) + codeStr + text.slice(i);
      codeStr = undefined;
    }
    
    // Add the character to the current element's content
    if (text[i] !== undefined) {
      elemStack[elemStack.length - 1].innerHTML += text[i];
      if (outputSpeed !== defaultOutputSpeed && text[i].trim() !== "") {
        // random int 0-2
        var rand = Math.floor(Math.random() * 3);
        var click = null;
        if (rand == 0) click = click0;
        if (rand == 1) click = click1;
        if (rand == 2) click = click2;
        // setTimeout(() => {
          click.play().then(function() {
            click.currentTime = 0;
          });
        // }, 400);
      }
      i++;
    }

    // Scroll to the bottom if the user was already at the bottom
    if (atBottom) document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
    
    // Stop the interval if we've reached the end of the text
    if (i >= text.length) {
      typewriterfull.pause();
      // keep this off for now, so it's not repetitive
      newline.play().then(function() {
        newline.currentTime = 0;
      });
      clearInterval(interval);
      if (showOptions) {
        setTimeout(function() {
          newline.play();
          setTimeout(() => {returnbell.play()}, 500)
        }, delayTime - 500 - returnbell.duration);
        setTimeout(function() {
          var atBottom = (document.scrollingElement.scrollTop + document.scrollingElement.clientHeight) == document.scrollingElement.scrollHeight;
          toggleOptions(Game[Game[currentNode].to[0]].text, Game[Game[currentNode].to[1]].text);
          if (atBottom) document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight;
        }, delayTime);
        return;
      }
      setTimeout(loop, delayTime);
    }
  }, outputSpeed);
}

var alertCb;
function alert(header, message, showClose, cb, okMsg) {
  elems.alertTitle.innerHTML = header;
  elems.alertMessage.innerHTML = message;
  elems.closeAlert.disabled = !showClose;
  elems.closeAlert.innerHTML = (okMsg == undefined) ? "Close" : okMsg;
  elems.cancelAlert.classList.add("hidden");
  elems.alertInput.classList.add("hidden");
  elems.customAlert.classList.remove("hidden");
  alertCb = cb;
}

function closeAlert() {
  elems.customAlert.classList.add("hidden");
  if (alertCb !== undefined) {
    if (!elems.alertInput.classList.contains("hidden")) {
      alertCb(elems.alertInput.value);
      elems.alertInput.value = "";
      elems.alertInput.placeholder = "";
    } else alertCb();
  }
}

function cancelAlert() {
  elems.customAlert.classList.add("hidden");
}

function confirm(header, message, cb) {
  elems.alertTitle.innerHTML = header;
  elems.alertMessage.innerHTML = message;
  elems.closeAlert.innerHTML = "Yes";
  elems.cancelAlert.classList.remove("hidden");
  elems.alertInput.classList.add("hidden");
  elems.customAlert.classList.remove("hidden");
  alertCb = cb;
}

function prompt(header, message, cb, placeholder) {
  elems.alertTitle.innerHTML = header;
  elems.alertMessage.innerHTML = message;
  elems.closeAlert.innerHTML = "Ok";
  elems.alertInput.value = "";
  elems.cancelAlert.classList.add("hidden");
  elems.alertInput.classList.remove("hidden");
  elems.alertInput.placeholder = placeholder;
  elems.customAlert.classList.remove("hidden");
  alertCb = cb;
  elems.alertInput.focus();
}

function promptEnter(e) {
  if (e.key == "Enter") closeAlert();
}

function credits() {
  alert("Credits", "Made by <strong>Kaius</strong> for the <a href='https://itch.io/jam/secret-santa' target='_blank'>Secret Santa game jam</a>.", true, () => {
    alert("Special thanks to:", "iamyellow_ and Mark", true, () => {
      alert("...", "And saul.", true);
    }, "Next");
  }, "Next");
}