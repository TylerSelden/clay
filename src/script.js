var elems = {
  "output": null,
  "options": null,
  "opt1": null,
  "opt2": null,
  "typewriterfull": null,
  "newline": null,
  "returnbell": null,
  "hardMode": null,
  "reset": null,
  "volume": null,
  "sidemenu": null,
  "lift": null,
  "begin": null,
  "continue": null,
  "titlescreen": null,
  "click0": null,
  "click1": null,
  "click2": null,
  "allen-pond": null,
  "allen-red": null,
  "allen-green": null,
  "bo-at": null,
  "playerName": null,
  "customAlert": null,
  "alertTitle": null,
  "alertMessage": null,
  "closeAlert": null,
  "cancelAlert": null,
  "beep": null,
  "longBeep": null,
  "alertInput": null,
  "chicken": null,
  "chickenNewline": null,
  "chick0": null,
  "chick1": null,
  "chick2": null,
  "settingsVer": null
}

var gameData = {
  path: "./assets/game.json",
  root: "82899daf93a4dbed",
  devRoot: "812e941972d16bb3"
}

var timer = {
  started: null,
  duration: null
}

function startTimer(duration, started) {
  timer.started = (started == undefined) ? Date.now() : started;
  timer.duration = duration;
  loopStop = true;
  
  save();
  setTimeout(stopTimer, duration - Date.now() + timer.started);
}

function stopTimer() {
  timer.started = null;
  timer.duration = null;

  loopStop = false;
  loop();
}

function checkTimer() {
  if (timer.started == null || timer.duration - Date.now() + timer.started <= 0) {
    timer.started = null;
    timer.duration = null;

    return stopTimer();
  }
  startTimer(timer.duration - Date.now() + timer.started);
}

var playerName = "Saul";
var outputSpeed = 50;
var defaultOutputSpeed = 50;
var Game = {};
var currentNode = gameData.root;
var loopDelay = 2000;
var showOptions = false;
var loopStop = false;

function electronBegin(version) {
  if (window.dev) currentNode = gameData.devRoot;

  loadElems();

  elems.settingsVer.innerHTML = `Version ${version}`;

  loadMenu();
}

function loadElems() {
  for (var i in elems) {
    elems[i] = document.getElementById(i);
  }
  // scroll to bottom
  setTimeout(() => { document.scrollingElement.scrollTop = document.scrollingElement.scrollHeight }, 250);
}

function loadAssets() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", gameData.path);
  xhr.onload = function() {
    if (xhr.status == 200) {
      Game = JSON.parse(xhr.responseText);
      checkTimer();
    } else {
      console.error("Failed to load game data");
    }
  }
  xhr.send();
}



function loop(newNode) {
  if (loopStop || showOptions) return;
  save();

  currentNode = Game[currentNode].to[0];
  if (Game[currentNode] == undefined) {
    output("<em class='red'>~ The end ~</em>", loopDelay);
    return loopStop = true;
  }

  if (newNode !== undefined) {
    currentNode = newNode;
    return output(`<em class="yellow">${Game[currentNode].text}</em>`, loopDelay);
  }

  output(Game[currentNode].text, loopDelay);
  if (Game[currentNode].to.length > 1) return showOptions = true;
}

function opt(n) {
  toggleOptions();
  showOptions = false;
  loop(Game[currentNode].to[n]);
}

function save() {
  var saveData = {
    currentNode: currentNode,
    outputBody: elems.output.innerHTML,
    showOptions: showOptions,
    loopStop: loopStop,
    timer: timer,
    outputSpeed: outputSpeed,
    loopDelay: loopDelay
  }
  localStorage.setItem("saveData", JSON.stringify(saveData));
}

function load(callback) {
  var data = JSON.parse(localStorage.getItem("saveData"));
  if (data == null) return callback();
  currentNode = data.currentNode;
  elems.output.innerHTML = data.outputBody;
  showOptions = data.showOptions;
  loopStop = data.loopStop;
  timer = data.timer;
  outputSpeed = data.outputSpeed;
  loopDelay = data.loopDelay;

  // load all the settings

  // refresh elements
  loadElems();

  loadSettings();


  callback();
}

function reset() {
  localStorage.removeItem("saveData");
  localStorage.removeItem("settings");
  window.location.reload();
}