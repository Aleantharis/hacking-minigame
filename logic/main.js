import { Constants as CONST } from "./const.js";
import { Assets } from "./const.js";
import { GameLogic } from "./gameLogic.js";

const assetsLoaded = () => {
	document.getElementById("btnStart").disabled = false;
	console.log("assets loaded");
	gameState = "Intro";

	// trigger resize to trigger redraw for intro
	resizeCanvas();
};
const assets = new Assets({
	test: "img/test.jpg"
}, assetsLoaded);


var DEBUG = false;
var debugOutput = "";
var canvas = document.getElementById("cvGame");
var ctx = canvas.getContext("2d");
var gameLoop;
var difficulty;
var canvasMinSize = 0;
const BOARDSCALE = 0.8;
var boardScaleY = 1;
var tileSize;

// "Loading", "Intro", "Running", "Success", "Failure"
var gameState = "Loading";
var isDialogRendered = true;

var mouseX = 0;
var mouseY = 0;

var logic;

var boardSizeIdx = 0;
const boardSizes = [
	{ X: 4, Y: 4 },
	{ X: 8, Y: 4 },
	{ X: 8, Y: 6 },
	{ X: 8, Y: 8 },
	{ X: 12, Y: 8 },
	{ X: 12, Y: 10 }, 
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


	switch (gameState) {
		case "Intro":
			drawIntro();
			break;
		case "Success":
			drawSuccess();
			break;
		case "Failure":
			drawFailure();
			break;
	}
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);


function debugToggle() {
	DEBUG = document.getElementById("cbDebug").checked;
	logic.gameState.DEBUG = DEBUG;
}
document.getElementById("cbDebug").addEventListener("change", debugToggle);

function difficultyChange() {
	difficulty = document.getElementById("sDiff").value;
}
document.getElementById("sDiff").addEventListener("change", difficultyChange);

function pointerUpHandler(event) {
	// Prevent interaction if gameloop is not running
	switch (gameState) {
		case "Running":
			handleMouseMove(event);
			var relX = Math.floor(mouseX / tileSize);
			var relY = Math.floor(mouseY / tileSize);

			if (relX >= 0 && relX < boardSizes[boardSizeIdx].X && relY >= 0 && relY < boardSizes[boardSizeIdx].Y) {
				logic.boardInteraction(relX, relY);
			}
			return;
		case "Success":
			isDialogRendered = !isDialogRendered;
			drawSuccess();
			return;
		case "Failure":
			isDialogRendered = !isDialogRendered;
			drawFailure();
			return;
		case "Intro":
		case "Loading":
		default:
			return;
	}
}
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
	ctx.fillText(debugOutput, 0, 0, canvas.width * 0.8);
}

function drawSuccess() {
	draw();
	drawTransparentOverlay();

	// HACK SUCCESSFUL
	// (click here to hide overlay)

	if (isDialogRendered) {
		drawDialog("HACK COMPLETED", "", "(Click to hide overlay)", "darkgreen");
	}
}

function drawFailure() {
	draw();
	drawTransparentOverlay();

	// HACK FAILED
	// You triggered a trap
	// (click here to hide overlay)

	if (isDialogRendered) {
		drawDialog("HACK FAILED", "You triggered a trap", "(Click to hide overlay)", "darkred");
	}
}

function drawIntro() {
	drawBackground();
	drawTransparentOverlay();

	drawDialog("HACKING MINIGAME", "Rotate nodes by clicking them. Connect Power (green) to Goal (gold) to succeed.", "Click Power-Node to activate. Avoid red nodes.", "gold")
}

function drawDialog(firstLine, secondLine, thirdLine, fillStyle) {
	const sc = (1 - BOARDSCALE) / 2;
	const headlineScale = 0.5;

	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.translate(canvas.width * sc, canvas.height * sc);
	ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
	ctx.fillRect(0, 0, canvas.width * BOARDSCALE, canvas.height * BOARDSCALE);

	ctx.translate(canvas.width / 2 - canvas.width * sc, canvas.height / 2 - canvas.height * sc);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = fillStyle;
	ctx.font = Math.floor(canvasMinSize * BOARDSCALE * headlineScale) + "px Segoe UI";
	ctx.fillText(firstLine, 0, 0, canvas.width * BOARDSCALE);

	if (thirdLine === "") {
		ctx.font = Math.floor(canvasMinSize * BOARDSCALE * 0.10) + "px Segoe UI";
		ctx.fillText(secondLine, 0, canvas.height * BOARDSCALE * (headlineScale / 2), canvas.width * BOARDSCALE);
	}
	else {
		ctx.font = Math.floor(canvasMinSize * BOARDSCALE * 0.05) + "px Segoe UI";
		ctx.fillText(secondLine, 0, canvas.height * BOARDSCALE * (headlineScale / 2), canvas.width * BOARDSCALE);

		ctx.font = Math.floor(canvasMinSize * BOARDSCALE * 0.05) + "px Segoe UI";
		ctx.fillText(thirdLine, 0, canvas.height * BOARDSCALE * (headlineScale * (2 / 3)), canvas.width * BOARDSCALE);
	}
	ctx.restore();
}

function drawTransparentOverlay() {
	// Draw gray overlay
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function drawBackground() {
	// draw test image
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.drawImage(assets.getAsset("test"), 0, 0, canvas.width, canvas.height);
	ctx.restore();
}

function draw() {
	clearCanvas();

	drawBackground();

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

			ctx.fillStyle = logic.getTileAt(i, j).getPrintColor() ?? `rgb(${255 - rgbVal}, ${255 - rgbVal}, ${255 - rgbVal})`;
			ctx.font = `${Math.floor(tileSize * 0.9)}px "Segoe UI", sans-serif`;
			ctx.textBaseline = "top";
			ctx.fillText(logic.getTileAt(i, j).getStringRepresentation(), (i + 0.05) * tileSize, (j + 0.05) * tileSize, tileSize * 0.9);
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

	mouseX = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e;
	mouseY = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f;

	if (DEBUG) {
		debugOutput = "X: " + Math.floor(mouseX) + " | Y: " + Math.floor(mouseY);
	}
}

function stopGameHandler(event) {
	event.preventDefault();

	gameState = "Intro";
	stopGame(false);
}

function startGameHandler(event) {
	event.preventDefault();
	startGame();
}

function stopGame(win) {
	if (gameState !== "Intro") {
		gameState = win ? "Success" : "Failure";
	}

	isDialogRendered = true;

	clearInterval(gameLoop);
	document.getElementById("sDiff").disabled = false;
	document.getElementById("inSize").disabled = false;
	document.getElementById("btnStart").value = "Start";
	// document.getElementById("cbDebug").disabled = true;
	document.getElementById("fMenu").onsubmit = startGameHandler;

	// Trigger resize to draw canvas
	resizeCanvas();
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
	gameState = "Running";

	document.getElementById("sDiff").disabled = true;
	document.getElementById("inSize").disabled = true;
	renderBoardSizeLabel();
	document.getElementById("btnStart").value = "Stop";
	// document.getElementById("cbDebug").disabled = false;
	document.getElementById("fMenu").onsubmit = stopGameHandler;

	logic = new GameLogic(difficulty, boardSizes[boardSizeIdx].X, boardSizes[boardSizeIdx].Y, function (win) { stopGame(win); });

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
difficultyChange();
