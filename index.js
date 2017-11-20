let context = document.getElementById("canvas").getContext("2d");
let canvas = document.getElementById("canvas");
let canvasTools = document.getElementById("canvasTools");
let slider = document.getElementById("myRange");
let sliderValue = document.getElementById("demo");

let main = document.getElementById("main");
let form = document.getElementById("new_user");
let keyword = document.getElementById("keyword");
let image = document.getElementById("image");
let signin = document.getElementById("signin");
let gameContent = document.getElementById("gameContent");

let messageForm = document.getElementById("message_form");
let messageText = document.getElementById("message_text");
let allMessages = document.getElementById("allMessages");
let sidebar = document.getElementById("sidebar");
let scoreboard = document.getElementById("scoreboard");

let currentImageId;
let currentColor = `#${document.getElementById("color").value}`;
let currentPenSize = slider.value;
let paint = false;
let xClicks = [];
let yClicks = [];
let dragClicks = [];

let xHistory = [];
let yHistory = [];
let dragHistory = [];
let penColorHistory = [];
let penSizeHistory = [];

let currentGameId;
let currentPlayerUsername;
let currentPlayerId;
let currentDrawerId;
let currentDrawerUsername;

let playerURL = "https://pictionaryapi.herokuapp.com/api/v1/players";
let gamesURL = "https://pictionaryapi.herokuapp.com/api/v1/games/";
let imagesURL = "https://pictionaryapi.herokuapp.com/api/v1/images/";
let messagesURL = "https://pictionaryapi.herokuapp.com/api/v1/messages/";
// let playerURL = "http://localhost:3000/api/v1/players";
// let gamesURL = "http://localhost:3000/api/v1/games/";
// let imagesURL = "http://localhost:3000/api/v1/images/";
// let messagesURL = "http://localhost:3000/api/v1/messages/";

// game setup ----------------------------------------------------------------

const newUser = function(ev) {
	ev.preventDefault();

	let username = document.getElementById("username").value;
	currentGameId = document.getElementById("game").value;
	let playerData = { username: username, game_id: currentGameId };
	let headers = {
		Accept: "application/json",
		"Content-Type": "application/json"
	};
	fetch(playerURL, {
		method: "post",
		body: JSON.stringify(playerData),
		headers: headers
	})
		.then(res => res.json())
		.then(json => {
			currentPlayerUsername = json.username;
			currentPlayerId = json.id;
			setupGame();
		});
};

const setupGame = function() {
	signin.remove();
	gameContent.removeAttribute("style");

	addListeners();
};

const clearCanvas = function() {
	context.clearRect(0, 0, 490, 600);
	submitImage();
	xHistory = [];
	yHistory = [];
	dragHistory = [];
	penColorHistory = [];
	penSizeHistory = [];
};

// event listeners ----------------------------------------------------------------

const addListeners = function() {
	canvas.addEventListener("touchstart", handleMouseDown);
	canvas.addEventListener("touchmove", handleMouseMove);
	canvas.addEventListener("touchend", handleMouseUp);
	canvas.addEventListener("touchleave", handleMouseLeave);
	messageForm.addEventListener("submit", handleMessageSubmit);
};

// event handlers ----------------------------------------------------------------
slider.oninput = function() {
	sliderValue.value = this.value;
	currentPenSize = this.value;
};

const handleMouseDown = function(ev) {
	// console.log(ev);
	// console.log("PageX:", ev.pageX, "PageY:", ev.pageY);
	// console.log("ClientX:", ev.clientX, "ClientY:", ev.clientY);
	// console.log("OffsetX:", ev.offsetX, "OffsetY:", ev.offsetY);
	// console.log("X:", ev.x, "Y:", ev.y);
	var mouseX = ev.offsetX;
	var mouseY = ev.offsetY;
	paint = true;
	getCurrentColor();
	addClicks(mouseX, mouseY, false, currentColor, currentPenSize);
	redraw();
};

const handleMouseMove = function(ev) {
	if (paint) {
		getCurrentColor();
		addClicks(ev.offsetX, ev.offsetY, true, currentColor, currentPenSize);
		redraw();
	}
};

const handleMouseUp = function(ev) {
	paint = false;
	xClicks = [];
	yClicks = [];
	dragClicks = [];
};

const handleMouseLeave = function(ev) {
	paint = false;
};

const handleMessageSubmit = function(ev) {
	ev.preventDefault();
	let text = messageText.value;
	messageForm.reset();
	submitMessage(text);
};

// draw functions ----------------------------------------------------------------

const addClicks = function(x, y, drag, penColor, penSize) {
	xClicks.push(x);
	yClicks.push(y);
	dragClicks.push(drag);

	xHistory.push(x);
	yHistory.push(y);
	dragHistory.push(drag);
	penColorHistory.push(penColor);
	penSizeHistory.push(penSize);
};

const redraw = function() {
	// context.clearRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = currentColor;
	context.lineJoin = "round";
	context.lineWidth = currentPenSize;
	for (let i = 0; i < xClicks.length; i++) {
		context.beginPath();
		if (dragClicks[i] && i) {
			context.moveTo(xClicks[i - 1], yClicks[i - 1]);
		} else {
			context.moveTo(xClicks[i] - 1, yClicks[i]);
		}
		context.lineTo(xClicks[i], yClicks[i]);
		context.closePath();
		context.stroke();
	}
	submitImage();
};

const undoDraw = function() {
	context.clearRect(0, 0, 490, 600);
	paint = true;
	let cut = dragHistory.lastIndexOf(false);

	context.lineJoin = "round";

	for (let i = 0; i < cut; i++) {
		context.beginPath();
		if (dragHistory[i] && i) {
			context.strokeStyle = penColorHistory[i];
			context.lineWidth = penSizeHistory[i];
			context.moveTo(xHistory[i - 1], yHistory[i - 1]);
		} else {
			context.strokeStyle = penColorHistory[i];
			context.lineWidth = penSizeHistory[i];
			context.moveTo(xHistory[i] - 1, yHistory[i]);
		}
		context.lineTo(xHistory[i], yHistory[i]);
		context.closePath();
		context.stroke();
	}
	submitImage();
	paint = false;

	xHistory = xHistory.slice(0, cut);
	yHistory = yHistory.slice(0, cut);
	dragHistory = dragHistory.slice(0, cut);
	penColorHistory = penColorHistory.slice(0, cut);
	penSizeHistory = penSizeHistory.slice(0, cut);
};

const getCurrentColor = function() {
	currentColor = `#${document.getElementById("color").value}`;
};

// const setCurrentColor = function(color) {
// 	currentColor = color;
// };

// fetch requests ----------------------------------------------------------------

// doc ready ----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
	form.addEventListener("submit", ev => {
		newUser(ev);
		handleSlider();
		setInterval(getGameInfo, 2000);
	});
});

const handleSlider = function() {
	// console.log(slider);
	slider = document.getElementById("myRange");
	sliderValue.value = slider.value; // Display the default slider value
};
