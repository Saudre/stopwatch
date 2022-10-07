const DOMhours = document.getElementById("hours");
const DOMminutes = document.getElementById("minutes");
const DOmilliseconds = document.getElementById("seconds");
const DOMmilliseconds = document.getElementById("milliseconds");
const DOMcontrols = document.getElementById("controls");
const DOMrecords = document.getElementById("records");
const DOMnameWatch = document.getElementById("record-title");
const DOMrecordList = document.getElementById("record-list");
// It retruns an Object not an Array so I transform into an Array
const DOMcolors = Array.from(document.querySelectorAll("#colors input"));

const storageKey = "saudreStopWatch";
const storageLimit = 50;
let times = [];
let hours = 0;
let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let lab = 0;
let intervalID = null;
let isActive = (isStop = false);

const colorSet = {
  red: "var(--clr-red-t-up)",
  blue: "var(--clr-blue-t-up)",
  green: "var(--clr-green-t-up)",
  yellow: "var(--clr-yellow-t-up)",
  orange: "var(--clr-orange-t-up)",
  purple: "var(--clr-purple-t-up)",
  pink: "var(--clr-pink-t-up)",
  blank: "var(--clr-txt-t)",
};

function digitFormat(num) {
  return num < 10 ? "0" + num.toString() : num.toString();
}

function updateMilliseconds(newTime) {
  DOMmilliseconds.innerHTML = newTime;
}

function updateSeconds(newTime) {
  DOmilliseconds.innerHTML = newTime;
}

function updateMinutes(newTime) {
  DOMminutes.innerHTML = newTime;
}

function updateHours(newTime) {
  DOMhours.innerHTML = newTime;
}

function addMillisecond() {
  if (milliseconds !== 99) {
    const textMilliseconds = digitFormat((milliseconds += 1));
    updateMilliseconds(textMilliseconds);
    return;
  }

  milliseconds = 0;

  if (seconds !== 59) {
    const textSeconds = digitFormat((seconds += 1));
    updateSeconds(textSeconds);
    updateMilliseconds("00");
    return;
  }

  seconds = 0;

  if (minutes !== 59) {
    const textMinutes = digitFormat((minutes += 1));
    updateMinutes(textMinutes);
    updateSeconds("00");
    updateMilliseconds("00");
    return;
  }

  minutes = 0;
  const textHours = digitFormat((hours += 1));
  updateHours(textHours);
  updateMinutes("00");
  updateSeconds("00");
  updateMilliseconds("00");
}

function startWatch() {
  if (intervalID) return;
  isActive = true;
  isStop = false;
  intervalID = setInterval(addMillisecond, 10);
}

function stopWatch() {
  if (isStop) return;
  clearInterval(intervalID);
  intervalID = null;
  isStop = true;
}

function resetColors() {
  DOMcolors.forEach((c) => {
    c.value === "blank" ? (c.checked = true) : (c.cheked = false);
  });
}

function resetWatch() {
  stopWatch();
  hours = minutes = seconds = milliseconds = 0;
  lab += 1;
  isActive = false;
  updateHours("00");
  updateMinutes("00");
  updateSeconds("00");
  updateMilliseconds("00");
  DOMnameWatch.value = "";
  resetColors();
}

function checkRecords(record) {
  return times.find((e) => e.id === record.id);
}

function saveLocalStorage(obj) {
  const key = storageKey;
  const value = JSON.stringify(obj);
  localStorage.setItem(key, value);
}

function addRecordDOM(time) {
  const newRecord = document.createElement("li");

  newRecord.id = time.id;
  newRecord.classList.add("rcd-in");

  const recordTitle = time.label ? time.label : "-";

  newRecord.innerHTML = `
    <span style="background-color: ${colorSet[time.c]}; border: 1px solid ${colorSet[time.c]}">${recordTitle}</span>
    <span>
    <span>${digitFormat(time.h)}</span>
    <span>:</span>
    <span>${digitFormat(time.m)}</span>
    <span>:</span>
    <span>${digitFormat(time.s)}</span>
    <span>:</span>
    <span>${digitFormat(time.ml)}</span>
    </span>
    <span class="x-record" data-record=${time.id}> x </span>
    `;

  DOMrecordList.insertBefore(newRecord, DOMrecordList.firstChild);
}

function getColor() {
  const selectedColor = DOMcolors.find((c) => c.checked === true);
  return selectedColor ? selectedColor.value : "";
}

function isFullStorage() {
  return times.length >= storageLimit;
}

function saveWatch() {
  if (!isActive) return;

  const newTime = {
    id: `${lab}${hours}${minutes}${seconds}${milliseconds}`,
    label: DOMnameWatch.value,
    h: hours,
    m: minutes,
    s: seconds,
    ml: milliseconds,
    c: getColor(),
  };

  if (isStop && checkRecords(newTime)) return;

  if (isFullStorage()) {
    removeRecord(times[0].id);
  }

  times.push(newTime);
  addRecordDOM(newTime);
  saveLocalStorage(times);
}

function removeRecord(id) {
  const delayOut = 450; // Remove before the animation is over
  const item = document.getElementById(id);
  item.classList.add("rcd-out");

  setTimeout(() => item.remove(), delayOut);

  times = times.filter((record) => record.id !== id);
  saveLocalStorage(times);
}

function clearAllRecords() {
  const recordList = DOMrecordList.querySelectorAll("li");
  recordList.forEach((r) => removeRecord(r.id));
  lab = 0;
}

function downloadRecords() {
  const fileType = "data:text/csv;charset=utf-8,";
  const headings = "SAUDRE STOPWATCH \n id, title, hour, minute, second, milisecond \n";

  let dataRecords = '';

  for (let i = 0; i < times.length; i++) {
    const newRow = `${times[i].id}, ${times[i].label}, ${times[i].h}, ${times[i].m}, ${times[i].s}, ${times[i].ml} \n`;
    dataRecords += newRow;
  }

  const csvContent = fileType + headings + dataRecords;

  const encodedContent = encodeURI(csvContent);

  window.open(encodedContent);
}

function isStorage() {
  return localStorage.getItem(storageKey) ? true : false;
}

function updateSession() {
  if (!isStorage()) return;

  const storedData = JSON.parse(localStorage.getItem(storageKey));

  if (storedData.length === 0) return;

  times = storedData;
  storedData.forEach((record) => addRecordDOM(record));
}

function handleControlsClick(e) {
  switch (e.target.id) {
    case "start":
      startWatch();
      break;
    case "stop":
      stopWatch();
      break;
    case "reset":
      resetWatch();
      break;
    case "save":
      saveWatch();
  }
}

function handleRecordsClick(e) {
  if (e.target.id === "clear-all") {
    clearAllRecords();
    return;
  }

  if (e.target.id === "download-records") {
    downloadRecords();
    return;
  }

  if (e.target.classList.contains("x-record")) {
    const recordID = e.target.dataset.record;
    removeRecord(recordID);
    return;
  }
}

updateSession();

DOMcontrols.addEventListener("click", handleControlsClick);
DOMrecords.addEventListener("click", handleRecordsClick);
