const BRUSH_TIMEOUT = 1500;
const activeToolEl = document.getElementById('active-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const clearCanvasBtn = document.getElementById('clear-canvas');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const eraser = document.getElementById('eraser');
const loadStorageBtn = document.getElementById('load-storage');
const saveStorageBtn = document.getElementById('save-storage');
const { body } = document;

let bucketColor = '#FFFFFF';
let currentColor = '#A51DAB';
let currentSize = 10;
let drawnArray = [];
let isEraser = false;
let isMouseDown = false;

function displayBrushSize() {
  brushSize.textContent = currentSize;
}

function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  displayBrushSize();
}

function brushTimeout(ms) {
  setTimeout(switchToBrush, ms);
}

function drawCanvas(canvas, context) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

function restoreCanvas(context) {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    if (drawnArray[i].eraser) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  drawnArray.push(line);
}

function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}


function getCanvasContext() {
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  const context = canvas.getContext('2d');
  return { canvas, context }
}

function changeCurrentSize() {
  if (brushSlider.value < 10) {
    currentSize = `0${brushSlider.value}`;
  } else {
    currentSize = brushSlider.value;
  }
  displayBrushSize();
}

function changeBrushColor() {
  isEraser = false;
  currentColor = brushColorBtn.value;
}

function changeBucketColor(canvas, context) {
  bucketColor = bucketColorBtn.value;
  drawCanvas(canvas, context);
  restoreCanvas(context);
}

function activeEraser() {
  isEraser = true;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  currentColor = bucketColor;
  currentSize = 50;
}

function clearCanvas(canvas, context) {
  drawCanvas(canvas, context);
  drawnArray = [];
  activeToolEl.textContent = 'Canvas Cleared';
  brushTimeout(BRUSH_TIMEOUT);
}

function preparePaint(event, context) {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = currentColor;
}

function paint(event, context) {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  } else {
    storeDrawn(undefined);
  }
}

function stopPaint() {
  isMouseDown = false;
}

function savePainting() {
  localStorage.setItem('drawnArray', JSON.stringify(drawnArray));
  activeToolEl.textContent = 'Canvas Saved';
  brushTimeout(BRUSH_TIMEOUT);
}

function loadPainting(context) {
  if (localStorage.getItem('drawnArray')) {
    drawnArray = JSON.parse(localStorage.getItem('drawnArray'));
    restoreCanvas(context);
    activeToolEl.textContent = 'Canvas Loaded';
    brushTimeout(BRUSH_TIMEOUT);
  } else {
    activeToolEl.textContent = 'No Canvas to Load';
    brushTimeout(BRUSH_TIMEOUT);
  }
}

function clearStorage() {
  localStorage.removeItem('drawnArray');
  activeToolEl.textContent = 'Local Storage Cleared';
  brushTimeout(BRUSH_TIMEOUT);
}

function downloadPainting(imageName = 'my-drawing.png') {
  const image = canvas.toDataURL('image/png');
  downloadBtn.href = image;
  downloadBtn.download = imageName;
  activeToolEl.textContent = 'Image File Saved';
  brushTimeout(BRUSH_TIMEOUT);
}

function setEventListeners(canvas, context) {
  brushColorBtn.addEventListener('change', changeBrushColor);
  brushIcon.addEventListener('click', switchToBrush);
  brushSlider.addEventListener('change', changeCurrentSize);
  bucketColorBtn.addEventListener('change', () => changeBucketColor(canvas, context));
  canvas.addEventListener('mousedown', (event) => preparePaint(event, context));
  canvas.addEventListener('mousemove', (event) => paint(event, context));
  canvas.addEventListener('mouseup', stopPaint);
  clearCanvasBtn.addEventListener('click', () => clearCanvas(canvas, context));
  clearStorageBtn.addEventListener('click', clearStorage);
  downloadBtn.addEventListener('click', () => downloadPainting());
  eraser.addEventListener('click', activeEraser);
  loadStorageBtn.addEventListener('click', () => loadPainting(context));
  saveStorageBtn.addEventListener('click', savePainting);
}


function init() {
  const { canvas, context } = getCanvasContext();
  drawCanvas(canvas, context);
  setEventListeners(canvas, context);
}

init();