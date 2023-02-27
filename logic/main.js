import { Constants as CONST } from "./const.js";
import { Assets } from "./const.js";
import { GameLogic } from "./gameLogic.js";

const assetsLoaded = () => { document.getElementById("btnStart").disabled = false; console.log("assets loaded"); };
const assets = new Assets({
	test: "img/test.jpg"
}, assetsLoaded);


var DEBUG = false;
var debugOutput = "";
var canvas = document.getElementById("cvGame");
var ctx = canvas.getContext("2d");
var gameLoop;
var difficulty = 0;
var canvasMinSize = 0;
const BOARDSCALE = 0.8;
var boardScaleX = 1;
var boardScaleY = 1;
var tileSize;

var logic;

var boardSizeIdx = 0;
const boardSizes = [
	{ X: 4, Y: 4 },
	{ X: 8, Y: 4 },
	{ X: 8, Y: 8 },
	{ X: 12, Y: 8 },
	{ X: 12, Y: 12 }
];

resizeCanvas();
// Attempt at auto-resize
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - (document.getElementById("fMenu").offsetHeight + CONST.canvasHeightMargin);


	if (canvas.width < canvas.height) {
		canvasMinSize = canvas.width;
	}
	else {
		canvasMinSize = canvas.height;
	}

	tileSize = Math.min(canvas.width / boardSizes[boardSizeIdx].X, Math.min(canvas.height, canvas.width * boardScaleY) / boardSizes[boardSizeIdx].Y) * BOARDSCALE;
	ctx.translate((canvas.width - (tileSize * boardSizes[boardSizeIdx].X)) / 2, (canvas.height - (tileSize * boardSizes[boardSizeIdx].Y)) / 2);

	// todo: draw-idle for gameover state
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);


function debugToggle() {
	DEBUG = document.getElementById("cbDebug").checked;

	// if (DEBUG) {
	// 	document.getElementById("testOut").classList.remove("hidden");
	// }
	// else {
	// 	document.getElementById("testOut").classList.add("hidden");
	// }
}
document.getElementById("cbDebug").addEventListener("change", debugToggle);

function difficultyChange() {
	difficulty = document.getElementById("sDiff").value;
}
document.getElementById("sDiff").addEventListener("change", difficultyChange);

function keyDownHandler(event) {
	if (event.key === "Right" || event.key === "ArrowRight" || event.key === "D" || event.key === "d") {
		rightPressed = true;
	}
}

function keyUpHandler(event) {
	if (event.key === "Right" || event.key === "ArrowRight" || event.key === "D" || event.key === "d") {
		rightPressed = false;
	}
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var touchPoints = [];
function pointerDownHandler(event) {
	if (event.pointerType === "mouse") {
		// handle mouseclick
	}
	else if (event.pointerType === "touch") {
		touchPoints.push(event.pointerId);
		// handle touch down
	}
}

function pointerUpHandler(event) {
	if (event.pointerType === "touch") {
		var index = touchPoints.indexOf(event.pointerId);

		// handle touch up
	}
	else {
		// handle mouse up
	}

	console.log(getMousePos(event));
}
canvas.addEventListener("pointerdown", pointerDownHandler, false);
canvas.addEventListener("pointerup", pointerUpHandler, false);
canvas.addEventListener("pointercancel", pointerUpHandler, false);

function clearCanvas() {
	// https://stackoverflow.com/a/6722031
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function drawDebug() {
	ctx.font = Math.floor(canvasMinSize * 0.05) + "px Segoe UI";
	ctx.fillStyle = "White"
	ctx.textBaseline = "bottom";
	ctx.fillText(debugOutput, 0, canvas.height * 0.98, canvas.width * 0.8);
}

function draw() {
	clearCanvas();

	// draw test image
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.drawImage(assets.getAsset("test"), 0, 0, canvas.width, canvas.height);
	ctx.restore();

	ctx.beginPath();
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
	ctx.fillRect(0, 0, tileSize * boardSizes[boardSizeIdx].X, tileSize * boardSizes[boardSizeIdx].Y);

	for (let i = 0; i < boardSizes[boardSizeIdx].X; i++) {
		for (let j = 0; j < boardSizes[boardSizeIdx].Y; j++) {
			var rgbVal;

			if (j % 2 === 0) {
				rgbVal = (255 / (boardSizes[boardSizeIdx].X - 1)) * i;
			}
			else {
				rgbVal = 255 - (255 / (boardSizes[boardSizeIdx].X - 1)) * i;
			}

			ctx.fillStyle = `rgb(${rgbVal}, ${rgbVal}, ${rgbVal})`;
			ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);

			ctx.fillStyle = logic.circuitBoard[i][j].getPrintColor() ?? `rgb(${255 - rgbVal}, ${255 - rgbVal}, ${255 - rgbVal})`;
			ctx.font = Math.floor(tileSize * 0.9) + "px Segoe UI";
			ctx.textBaseline = "top";
			ctx.fillText(logic.circuitBoard[i][j].getStringRepresentation(), (i + 0.05) * tileSize, (j + 0.05) * tileSize, tileSize * 0.9);
		}
	}
	ctx.restore();
	ctx.closePath();

	if (DEBUG) {
		drawDebug();
	}
}

function getMousePos(evt) {
	var rect = canvas.getBoundingClientRect(), // abs. size of element
		scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
		scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

	return {
		x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
		y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
	}
}

function handleMouseMove(event) {
	// https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
	var pos = getMousePos(event);          // get adjusted coordinates as above
	var matrix = ctx.getTransform();         // W3C (future)
	var imatrix = matrix.invertSelf();

	var transpX = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e;
	var transpY = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f;

	if (DEBUG) {
		debugOutput = "X: " + Math.floor(transpX) + " | Y: " + Math.floor(transpY);
	}
}

function stopGameHandler(event) {
	event.preventDefault();
	stopGame();
}

function startGameHandler(event) {
	event.preventDefault();
	startGame();
}

function stopGame() {
	clearInterval(gameLoop);
	document.getElementById("sDiff").disabled = false;
	document.getElementById("inSize").disabled = false;
	document.getElementById("btnStart").value = "Start";
	document.getElementById("fMenu").onsubmit = startGameHandler;
	// canvas.classList.remove("noCrsr");

	// clear out touchpoints 
	if (touchPoints.length > 0) {
		touchPoints = [];
	}
}

function boardSizeInputChangeHandler(event) {
	boardSizeIdx = document.getElementById("inSize").value;
	renderBoardSizeLabel();
}

function renderBoardSizeLabel() {
	var out = `Size: ${boardSizes[boardSizeIdx].X}x${boardSizes[boardSizeIdx].Y}`;
	document.getElementById("lblSize").innerHTML = out;
}

function startGame() {
	console.log("difficulty: " + difficulty);

	boardSizeIdx = document.getElementById("inSize").value;

	gameLoop = setInterval(draw, 10);

	document.getElementById("sDiff").disabled = true;
	document.getElementById("inSize").disabled = true;
	renderBoardSizeLabel();
	document.getElementById("btnStart").value = "Stop";
	document.getElementById("fMenu").onsubmit = stopGameHandler;
	// canvas.classList.add("noCrsr");

	logic = new GameLogic(difficulty, boardSizes[boardSizeIdx].X, boardSizes[boardSizeIdx].Y, function (success) { alert(success ? "yay" : "meh"); });

	boardScaleY = boardSizes[boardSizeIdx].Y / boardSizes[boardSizeIdx].X;

	// force resize to recalc tilesize
	resizeCanvas();

	if (DEBUG) {
		console.table(logic.circuitBoard);
	}
}

document.onpointermove = handleMouseMove;
document.getElementById("fMenu").onsubmit = startGameHandler;
document.getElementById("inSize").oninput = boardSizeInputChangeHandler;
renderBoardSizeLabel();
