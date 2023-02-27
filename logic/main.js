import { Constants as CONST} from "./const.js";
import { Assets } from "./const.js";
import { GameLogic } from "./gameLogic.js";

const assetsLoaded = () => { document.getElementById("btnStart").disabled = false; alert("test"); };
const assets = new Assets({
	test: "img/test.jpg"
}, assetsLoaded);


var DEBUG = false;
var debugOutput = "";
var canvas = document.getElementById("cvGame");
var ctx = canvas.getContext("2d");
var gameLoop;
var difficulty = 0;
var lives = 1;
var canvasMinSize = 0;
const BOARDSCALE = 0.8;

var logic;

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

	// Move coordinate origin to center of canvas
	ctx.translate((canvas.width - (canvasMinSize * BOARDSCALE)) / 2, (canvas.height - (canvasMinSize * BOARDSCALE)) / 2);
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
	ctx.fillText(debugOutput, -canvas.width / 2 * 0.98, canvas.height / 2 * 0.98, canvas.width * 0.8);
}

function draw() {
	clearCanvas();

	var tileSize = (canvasMinSize * BOARDSCALE) / Math.min(logic.gameState.sizeX, logic.gameState.sizeY);

	// draw test image
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.drawImage(assets.getAsset("test"), 0, 0, canvas.width, canvas.height);
	ctx.restore();

	ctx.beginPath();
	ctx.save();
	ctx.fillStyle = "Black";
	ctx.fillRect(0, 0, canvasMinSize * BOARDSCALE, canvasMinSize * BOARDSCALE);
	ctx.fillStyle = "Gray";
	ctx.fillRect(0,0, tileSize, tileSize);
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
	document.getElementById("inLives").disabled = false;
	document.getElementById("btnStart").value = "Start";
	document.getElementById("fMenu").onsubmit = startGameHandler;
	// canvas.classList.remove("noCrsr");

	// clear out touchpoints 
	if(touchPoints.length > 0) {
		touchPoints = [];
	}
}

function livesInputChangeHandler(event) {
	lives = document.getElementById("inLives").value;
	renderLives();
}

function renderLives() {
	var out = "Lives: " + lives;
	document.getElementById("lblLives").innerHTML = out;
}

function startGame() {
	console.log("difficulty: " + difficulty);

	lives = document.getElementById("inLives").value;

	gameLoop = setInterval(draw, 10);

	document.getElementById("sDiff").disabled = true;
	document.getElementById("inLives").disabled = true;
	renderLives();
	document.getElementById("btnStart").value = "Stop";
	document.getElementById("fMenu").onsubmit = stopGameHandler;
	// canvas.classList.add("noCrsr");

	logic = new GameLogic(0, 8, 4, function(success) { alert(success ? "yay" : "meh"); });

	if(DEBUG) {
		console.table(logic.circuitBoard);
	}
}

document.onpointermove = handleMouseMove;
document.getElementById("fMenu").onsubmit = startGameHandler;
document.getElementById("inLives").oninput = livesInputChangeHandler;
