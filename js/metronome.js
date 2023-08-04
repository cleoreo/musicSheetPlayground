var queueRunning = false; // Variable to track queue status

// Queue to store elements for manipulation
var elementQueue = [];

let intervalId;
let isPlaying = false;

function getDurationTime(beatsValue, bpmValue, duration, dot) {
  let beat = parseInt(beatsValue);
  let bpm = parseInt(bpmValue);
  let timeofq = 0.5;
  switch (beat) {
    case 1:
      timeofq = (60 / bpm) * 0.25;
      break;
    case 2:
      timeofq = (60 / bpm) * 0.5;
      break;
    case 4:
      timeofq = 60 / bpm;
      break;
    case 8:
      timeofq = (60 / bpm) * 2;
      break;
    case 16:
      timeofq = (60 / bpm) * 4;
      break;
  }
  let time = 0;
  switch (duration.toString()) {
    case "w":
    case "1":
      time = timeofq * 4;
      break;

    case "h":
    case "2":
      time = timeofq * 2;
      break;

    case "q":
    case "4":
      time = timeofq;
      break;

    case "8":
      time = timeofq / 2;
      break;

    case "16":
      time = timeofq / 4;
      break;

    case "32":
      time = timeofq / 8;
      break;
  }
  if (dot === true) {
    time = time * 1.5;
  }
  return time * 1000;
}

async function playMusicSheet() {
  // Add all elements to the queue
  elementQueue = [];
  const {measuresArray, bpm} = MS.getMusicSheetJson();
  await measuresArray.forEach((measure, mIndex) => {
    measure.notesArray.forEach(async (note, nIndex) => {
      const el = document.getElementById("vf-" + mIndex + "_" + nIndex);
      elementQueue.push({
        el,
        delay: await getDurationTime(measure.beatValue, bpm, note.duration, note.dot),
      })
    })
  });

  startMetronome(bpm);
  startQueue();
};

function pauseMusicSheet() {
  elementQueue.length = 0;
  stopMetronome();
}

async function startQueue() {
  if (queueRunning) return; // If queue is already running, return
  queueRunning = true;

  while (elementQueue.length > 0) {
    const currentItem = elementQueue.shift();
    const currentElement = currentItem.el; // Get the first element from the queue
    addClass(currentElement, "highlighted");
    await delay(currentItem.delay); // Delay for demonstration
    removeClass(currentElement, "highlighted");
  }

  queueRunning = false;
}

// Function to add a class to an element
function addClass(element, className) {
  element.classList.add(className);
}

// Function to remove a class from an element
function removeClass(element, className) {
  element.classList.remove(className);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to play the metronome sound
function playClickSound() {
  const clickSound = new Audio("./metronome-sound/drumstick.mp3"); // Provide the path to your sound file
  clickSound.play();
}

// Function to start the metronome
function startMetronome(tempo) {
  if (isPlaying) return;

  const interval = 60000 / tempo; // Convert tempo to milliseconds per beat

  intervalId = setInterval(() => {
    playClickSound();
  }, interval);

  isPlaying = true;
}

// Function to stop the metronome
function stopMetronome() {
  clearInterval(intervalId);
  isPlaying = false;
}
