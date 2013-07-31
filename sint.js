window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame	|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		|| 
		function(callback, element){
			window.setTimeout(callback, 1000 / 60);
		};
})();

window.onload = function(){
	start();
};

function start(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	imagesLoading = 0;
	reset();
}

// Get mouse position
function getMouse(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
		  click: false
        };
      }

// Set up variables
function reset(){
	// Create arrays
	actors = [];
	controllers = [];
	particles =  [];
	camera = [];
	ais = [];
	keys = [];
	test = [];
	level = [];
	optionvars = [50, 50];
	mouse = {
		x: 0,
		y: 0,
		down: false
	};
	sound = {
		shoot1: new Audio('sfx.wav')
	}
	game = 'menu';
	ui = {
		select : 0,
		area : 0
	}
	menu = [
		[
			['Singleplayer', 2, true],
			['Multiplayer', 3, true],
			['Options', 1, true],
			['Credits', 4, true]
		],
		[
			['Music', 's', 0, 0, 100, false],
			['Sound', 's', 1, 0, 100, false],
			['Back', 0, true]
		],
		['r', 'play'],
		['r', 'play'],
		['t', 'Sint', '', 'Programming and graphics by Asraelite', 'Music created in FL Studio by Asraelite']
	]
	lastspeed = 0;
	
	
	//controllers[1] = new Controller(actors[2], [[39, 'moveRight'], [37, 'moveLeft'], [38, 'jump'], [88, 'camera'], [78, 'bounce', 100]]);
	
	//ais[0] = new Ai(1, 'alphaBot');
	// type, affiliation, lifespan, xpos, ypos, xvel, yvel
	particles[0] = new Particle('mouse', 0, 10000000000, 0, 0, 0, 0);
	defineLevels(); // Call function to create level variables
	level = 2 // Set level
	spritesheet = new Image(); // Define spritesheet
	spritesheet.src = 'actors.png';
	document.addEventListener('keydown', keyDown, true); // Add key events
	document.addEventListener('keyup', keyUp, true);
	document.addEventListener('mousemove', function(evt){mouse = getMouse(evt)}, false);
	animate();
}

function play(){
	// Create player and its key controller
	actors[0] = new Actor(0, 'player', 200, 3, 80, 80, 16, 16);
	controllers[0] = new Controller(actors[0], [[68, 'moveRight'], [65, 'moveLeft'], [87, 'jump'], [67, 'camera'], [77, 'dark', 100], [83, 'shoot']]);
	
	//actors[1] = new Actor(6, 'all', 50, 3, 60, 80);
	
	camera = [actors[0]]; // Set camera.
}

function animate() {
	requestAnimFrame(animate);
	loopGame();
}

// Modified from W3C
function readFile() {  
  var file = document.getElementById('file').files[0];
  if(file){
    getAsText(file);
  }
}

function getAsText(readFile) {
        
  var reader = new FileReader();
  
  // Read file into memory as UTF-16      
  reader.readAsText(readFile, "UTF-16");
  
  // Handle progress, success, and errors
  reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
}

function updateProgress(evt) {
  if (evt.lengthComputable) {
    // evt.loaded and evt.total are ProgressEvent properties
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      // Increase the prog bar length
      // style.width = (loaded * 200) + "px";
    }
  }
}

function loaded(evt) {  
  // Obtain the read file data    
  var fileString = evt.target.result;
  // Handle UTF-16 file dump
  if(utils.regexp.isChinese(fileString)) {
    //Chinese Characters + Name validation
  }
  else {
    // run other charset test
  }
  // xhr.send(fileString)     
}

function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
    // The file could not be read
  }
}

// Round a number.
function r(num){
	return Math.round(num);
}

// Generate random number from seed
function seed(num){
	return ((num * 467 + ((num * 6) % 9)) % 1000) / 1000;
}

// Add key pressed to key list.
function keyDown(e){
	var keyPress;
	if (typeof event !== 'undefined') {
		keyPress = event.keyCode;
	}else if(e){
		keyPress = e.which;
	}
	if(keys.indexOf(keyPress) == -1){
		keys.push(keyPress);
	}
}

// Remove key from key list.
function keyUp(e){
	var keyPress;
	if (typeof event !== 'undefined') {
		keyPress = event.keyCode;
	}else if(e){
		keyPress = e.which;
	}
	keys.splice(keys.indexOf(keyPress), 1);
}

// Define objects.

function Controller(object, actions){
	this.actor = object;
	this.checkKeys = function(){
		for(i in actions){
			if(keys.indexOf(actions[i][0]) > -1){
				this.actor.action(actions[i][1]);
			}
		}
		this.actor.refreshActions();
	}
}

function Ai(index, ai){
	this.actor = actors[index];
	this.aivars = [0, 0, 0];
	this.action = function(act){
		this.actor.action(act);
	}
	this.run = function(){
		this.actor = actors[index];
		switch(ai){
			case 'alphaBot': // Work in progress following melee AI
				var playerIndex = -1;
				var topDistance = 400;
				var distanceAway = Math.abs(actors[0].x - this.actor.x);
				if((this.aivars[0] == 0 ? distanceAway > 150 : distanceAway < 200)){
					if(actors[0].x > this.actor.x){
						this.action((this.aivars[0] == 0 ? 'moveRight' : 'moveLeft'));
					}else{
						this.action((this.aivars[0] == 0 ? 'moveLeft' : 'moveRight'));
					}
					if(actors[index].xvel < 0.1){
						this.action('jump');
					}
					actors[index].xvel *= Math.pow(0.995, speed);
				}else{
				
				}
				if(Math.random() < 0.03 || this.aivars[2] > 0){
					if(this.aivars[0] == 0){
						this.aivars[2] += 1;
						this.action('dark');
					}else{
						this.aivars[0] -= 1;
					}
				}
				if(this.aivars[2] == 75){
					this.action('jump');
				}
				if(this.aivars[2] > 75 && actors[index].yvel >= 0){
					actors[index].vars = [false, (actors[0].x - this.actor.x) / 15, (actors[0].y - this.actor.y) / 10];
					this.action('shoot');
				}
				if(this.aivars[2] >= 95){
					this.aivars[0] = 10;
					this.aivars[1] = 0;
					this.aivars[2] = 0;
					actors[index].vars = [false, false, false];
				}
				break;
			case 'pace': // Test AI
				if(this.aivars[0] == 0 || this.actor.x < -300 || this.actor.x > 300){
					this.aivars[0] = (this.actor.x > 0 ? -1 : 1);
				}
				if(this.xvel == 0){
					this.action('jump');
				}
				this.action(this.aivars[0] == 1 ? 'moveRight' : 'moveLeft');
				break;
			case 'still':
				break;
		}
	}
}

// Actor class for all solid cubes
function Actor(image, type, health, power, xpos, ypos, width, height){
	this.image = image;
	this.group = type;
	this.health = health;
	this.power = power;
	this.yvel = 0;
	this.xvel = 0;
	this.imageLoad = 2;
	this.right = this.up = this.down = false;
	this.left = false;
	this.x = xpos;
	this.y = ypos;
	this.w = width;
	this.h = height;
	this.box = new Box(this.x, this.y, this.w, this.h, this.xvel, this.yvel, ['player', 'pacer'], true); // Set physics class for this actor
	this.oneactions = [];
	this.actionsturn = [];
	this.index = actors.length;
	this.vars = [false, false, false]; // for use by AIs to control particles
	
	this.refreshActions = function(){
		this.oneactions = [];
		for(i in this.actionsturn){
			this.oneactions.push(this.actionsturn[i]);
		}
	}
	
	// Actions to call from controllers
	this.action = function(type){
		switch(type){
			case 'moveLeft':
				this.xvel -= (0.08 * speed);
				break;
			case 'moveRight':
				this.xvel += (0.08 * speed);
				break;
			case 'jump':
				this.box.y += 1;
				if(this.box.collide()){
					this.yvel = -4 - this.power;
				}
				this.box.y -= 1;
				break;
			case 'melee':
				this.yvel = 10;
				break;
			case 'camera':
				camera = [this];
				break;
			case 'stream':
				particles.push(new Particle(0, 0, 60000, this.x, this.y - 1, this.xvel + ((this.x - (lookx + 250)) + (mouse.x - 250)) / 30, -3 + this.yvel * 3));
				sound.shoot1.play();
				break;
			case 'bounce':
				particles.push(new Particle(1, 0, 5000, this.x, this.y - 1, this.xvel * 2 + ((Math.random() - 0.5) * 5), -5 + this.yvel * 3));
				break;
			case 'flo':
				particles.push(new Particle(2, 0, 100000, this.x, this.y - 16, this.xvel * 4 + ((Math.random() - 0.5) * 10), -10));
				break;
			case 'dark':
				particles.push(new Particle(3, this.index, 3000, this.x + (Math.random() * 16), this.y - (Math.random() * 16), this.xvel, this.yvel));
				this.vars = [false, false, false]
				break;
			case 'shoot':
				this.vars = [true, this.vars[1], this.vars[2]];
				break;
		}
		this.actionsturn.push(type);
	}
	
	this.simulate = function(){
		this.box.xvel = this.xvel;
		this.box.yvel = this.yvel;
		this.box.x = this.x;
		this.box.y = this.y;
		this.box.run();
		this.x = this.box.x;
		this.y = this.box.y;
		this.xvel = this.box.xvel;
		this.yvel = this.box.yvel;
		if(this.health <= 0){
			this.health = 0;
		}
		//this.xvel *= Math.pow(0.992, speed);
	}
	
	this.draw = function(){
		var reflect = 100; // Depth reflection goes before fading completely
		var drawx = r(this.x - lookx + this.xvel);
		var drawy = 200;
		context.drawImage(spritesheet, this.image * 16, 16, 16, 16, drawx, r(this.y - 16 - looky), this.w, this.h);
		context.globalAlpha = 1;
		//context.drawImage(spritesheet, this.image * 16, 16, 16, 16, drawx, r((216 - (this.y - 216)) - looky), 16, 16);
		// StartX, StartY, EndX, EndY
		var gradient = context.createLinearGradient(drawx, r((216 - this.y + 216) - looky - 5), drawx, r((214 - (this.y - 216)) - looky) + 16);
		gradient.addColorStop(0.1, 'rgba(255, 255, 255, ' + (this.y < 120 ? 1 : ((200 - this.y) / 35) + 0.2) +')');
		gradient.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
		context.fillStyle = gradient;
		//context.fillRect(drawx, r((216 - (this.y - 216)) - looky), 16, 16);
	}
}

function Particle(type, affiliation, lifespan, xpos, ypos, xvel, yvel){
	this.x = xpos;
	this.y = ypos;
	this.xvel = xvel;
	this.yvel = yvel;
	this.type = type;
	this.life = lifespan;
	this.size = [3, 5, 7, 5][type];
	this.created = this.timeup = new Date();
	this.timeup = new Date(this.timeup.getTime() + lifespan);
	this.deleteme = false;
	this.aff = affiliation;
	this.vars = [false, false];
	var angle = Math.random() * 360;
	this.addx = Math.sin(angle) * ((particles.length + 200) / 5);
	this.addy = Math.cos(angle) * ((particles.length + 200) / 10);
	this.box = new Box(this.x, this.y, this.size, this.size, this.xvel, this.yvel, [], false);
	
	this.draw = function(){
		//context.beginPath();
		//context.rect(this.x, this.y, 3, 3);
		switch(this.type){
			case 'mouse':
				context.globalAlpha = 0.7;
				context.lineWidth = 2;
				context.strokeStyle = '#33d';
				context.strokeRect(mouse.x - this.vars[0] / 2, mouse.y - this.vars[0] / 2, this.vars[0], this.vars[0]);
				context.globalAlpha = 1;
				break;
			case 0:
				context.globalAlpha = 1;
				context.lineWidth = 1;
				context.strokeStyle = '#66b';
				context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 2, 2);
				context.strokeStyle = '#aaf';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 2, 2);
				break;
			case 1:
				context.globalAlpha = 1;
				context.lineWidth = 2;
				context.strokeStyle = '#b79';
				context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 4, 4);
				context.strokeStyle = '#fbd';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 4, 4);
				break;
			case 2:
				context.globalAlpha = 0.2;
				context.lineWidth = 1;
				context.strokeStyle = '#363';
				context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 5, 5);
				context.strokeStyle = '#9c9';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 5, 5);
				context.globalAlpha = 1;
				break;
			case 3:
				context.globalAlpha = 0.5;
				context.lineWidth = 1;
				context.strokeStyle = '#000';
				context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 4, 4);
				/*
				context.strokeStyle = '#aaa';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 4, 4);
				context.globalAlpha = 1;
				*/
		}
	}
	
	this.onGround = function(){
		return false;
	}
	
	
	this.simulate = function(){
		switch(this.type){
			case 'mouse':
				if(this.vars[0] == false){
					this.vars[0] = 8;
				}
				if(this.vars[1] == true){
					this.vars[0] += 0.4;
					if(this.vars[0] >= 10){
						this.vars[1] = false;
					}
				}else{
					this.vars[0] -= 0.4;
					if(this.vars[0] <= 7){
						this.vars[1] = true;
					}
				}
				break;
			case 0:
				this.yvel += (this.onGround() ? 0 : 0.01 * speed);
				this.xvel *= Math.pow(0.998, speed);;
				this.x += this.xvel;
				this.y += this.yvel;
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = 0;
				}
				break;
			case 1:
				this.yvel += (this.onGround() ? 0 : 0.007 * speed);
				this.xvel *= Math.pow(0.999, speed);
				this.x += this.xvel;
				this.y += this.yvel;
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = (this.yvel > 2 ? this.yvel * -0.7 : 0);
				}
				break;
			case 2:
				this.yvel *= Math.pow(0.996, speed);
				this.xvel *= Math.pow(0.996, speed);
				this.x += this.xvel;
				this.y += this.yvel;
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = 0;
				}
				for(j in camera){
					var distance = Math.sqrt(Math.pow(camera[j].x - this.x, 2) + Math.pow(camera[j].y - this.y, 2));
					var xmov = camera[j].x - ((this.addx / (distance / 10)) + 8) - this.x;
					var ymov = camera[j].y - ((this.addy / (distance / 10)) + 0) - this.y;
					this.xvel += (xmov > 0 ? 1 : -1) / (((distance + 10) / 5) / Math.abs(xmov / 10)) + (Math.random() - 0.5) * 0.4;
					this.yvel += (ymov > 0 ? 1 : -1) / (((distance + 10) / 5) / Math.abs(ymov / 10)) + (Math.random() - 0.5) * 0.4;
					if(distance < 35 && this.y < camera[j].y && camera[j].yvel > -1){
						camera[j].yvel -= (this.y < 50 ? this.y / 3000 : 0.05)
					}
				}
				break;
			case 3:
				this.yvel *= Math.pow(0.996, speed);
				this.xvel *= Math.pow(0.996, speed);
				this.x += this.xvel;
				this.y += this.yvel;
				var parent = actors[this.aff];
				if(typeof this.orbit === 'undefined'){
					var angle = Math.random() * 360;
					this.orbit = {
						cube: this.affiliation,
						x: 9 * Math.cos(angle * Math.PI / 180),
						y: 9 * Math.sin(angle * Math.PI / 180)
					}
				}
				if(parent.vars[0] == false && this.vars[0] == false){
					this.xvel += (this.orbit.x + parent.x + 6 - this.x) / 10;
					this.yvel += (this.orbit.y +  parent.y - 20 - this.y) / 10;
				}else{
					if(this.vars[0] == false){
						this.xvel = parent.vars[1] + (Math.random() - 0.5) * 1.5;
						this.yvel = parent.vars[2] + (Math.random() - 0.5) * 1.5;
						this.vars[0] = true;
					}
					for(j in actors){
						if(this.x > actors[j].x && this.x < actors[j].x + 16 && this.y > actors[j].y - 16 && this.y < actors[j].y + 16 && true && actors[j] != parent){
							actors[j].health -= 1;
							this.deleteme = true;
						}
					}
				}
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = 0;
				}
				break;
		}
		if(thisLoop > this.timeup){
			this.deleteme = true;
		}
		this.box.xvel = this.xvel;
		this.box.yvel = this.yvel;
		this.box.x = this.x;
		this.box.y = this.y + 16;
		this.box.run();
		this.x = this.box.x;
		this.y = this.box.y - 16;
		this.xvel = this.box.xvel;
		this.yvel = this.box.yvel;
	}
}

// Collision detection class
function Box(x, y, w, h, xvel, yvel, colgroup, gravity){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.col = colgroup;
	this.right = false;
	this.left = false;
	this.up = false;
	this.down = false;
	this.gravity = gravity;
	
	this.reset = function(){
		this.right = false;
		this.left = false;
		this.up = false;
		this.down = false;
	}
	
	this.collide = function(){
		// Check for collision with level
		var lv = levels[level];
		var colareax = ((this.width - 2) >> 4) + 2;
		var colareay = ((this.height - 2) >> 4) + 2;
		var collision = false;
		var type = 'level';
		test = [];
		for(var hr = 0; hr < colareax; hr++){
			for(var vr = 0; vr < colareay; vr++){
				var xcol = (((this.x - (hr == colareax - 1 ? 1 + 16 - (((this.width - 1) % 16) + 1): 0)) >> 4) + hr);
				var ycol = (((this.y - (vr == colareay - 1 ? 1 + 16 - (((this.height - 1) % 16) + 1) : 0)) >> 4) + vr);
				if(ycol - 1 >= 0 && ycol <= lv.length){
					if(xcol >= 0 && xcol < lv[ycol].length){
						if(lv[ycol - 1][xcol] == '#'){
						collision = true;
						}
					}
				}
			}
		}
		
		// Check for collision with other boxes in same collision group
		/*
		for(j in actors){
			var obj = actors[j].box;
			if(this.y < obj.y + 16 && this.y + 16 > obj.y && this.x + 16 > obj.x && this.x < obj.x + 16){
				collision = true;
				type = 'cube';
			}
		}
		*/
		return collision;
	}
	
	this.move = function(){
		this.down = false;
		this.x += this.xvel;
		if(this.collide() && Math.abs(this.xvel) > 0){
			this.x = ((this.x >> 4) << 4) + (this.xvel > 0 ? 16 - (((this.width - 1) % 16) + 1) : 16);
			this.xvel = 0;
		}
		this.y += this.yvel;
		if(this.collide()){
			this.y = ((this.y >> 4) << 4) + (this.yvel > 0 ? 16 - (((this.height - 1) % 16) + 1) : 16);
			if(this.yvel < 0){
				this.down = true;
			}
			this.yvel = 0;
		}
		this.reset();
		
	}
	
	this.run = function(){
		this.y += 1;
		if(this.collide() == false && this.gravity){
			this.yvel += 0.5;
		}
		this.y -= 1;
		this.xvel *= Math.pow(0.99, speed);
		this.move();
	}
}

// Run game.

var speed;
var lastLoop = new Date();
var thisLoop = lastLoop;
function loopGame(){
	canvas.style.margin = (window.innerHeight > 360 ? window.innerHeight / 2 - 180 + 'px auto' : '10px auto');
    lastLoop = thisLoop;
	thisLoop = new Date();
    speed = (thisLoop - lastLoop);
	speed = (speed > 50 ? 50 : speed);
	context.clearRect(0, 0, 500, 350);
	lookx = looky = 0;
	looky = -0;
	for(i in controllers){
		controllers[i].checkKeys();
	}
	for(i in actors){
		actors[i].simulate();
	}
	for(i in camera){
		lookx += (camera[i] instanceof Array ? camera[i][0] : camera[i].x + camera[i].xvel * 1) - 250;
		// looky += (camera[i] == instanceof Array ? camera[i][1] : camera[i].y) - 175;
	}
	lookx /= camera.length;
	looky /= camera.length;
	for(i in actors){
		actors[i].draw();
	}
	/*
	if( instanceof Array){
		lookx = camera[0];
		looky = camera[1];
	}else{
		lookx = camera.x - 250 + camera.xvel * 5;
		looky = 0;
	}
	*/
	context.globalAlpha = 1;
	context.lineWidth = 1;
	for(i = 1; i < levels[level].length; i++){
		for(j = 1; j < levels[level][i].length; j++){
			if(levels[level][i][j] == '#' || levels[level][i][j] == 'x'){
				//#efefef
				context.fillStyle = '#eee';
				if((j < levels[level][i].length && j > 0 && i < levels[level].length - 1 && i > 0)){
					if(levels[level][i][j + 1] != '#' || levels[level][i][j - 1] != '#'){
						context.fillStyle = '#ddd';
					}
					if(levels[level][i + 1][j] != '#' || levels[level][i - 1][j] != '#'){
						context.fillStyle = '#ddd';
					}
				}
				if(levels[level][i][j] == 'x'){
					context.fillStyle = '#d77';
				}
				context.fillRect((j << 4) - r(lookx), i << 4, 16, 16);
			}
		}
	}
	context.fillStyle = 'rgba(255, 200, 200, 0.7)';
	for(i in test){
		context.fillRect((test[i][0] << 4) - lookx, test[i][1] << 4, 16, 16);
	}
	context.globalAlpha = 1;
	context.fillStyle = "#444";
	context.font = "10pt Arial";
	context.textAlign = 'left';
	if(game == 'playing'){
		context.fillText('Health: ' + camera[0].health, 10, 290);
		context.fillText('X: ' + r(camera[0].x), 10, 310);
		context.fillText('Y: ' + r(camera[0].y), 70, 310);
	}else{
		context.fillText('W and S to move', 10, 270);
		context.fillText('Enter to select', 10, 290);
		context.fillText('A and D to change slider value', 10, 310);
	}
	lastspeed = (new Date() % 10 == 0 ? r(1000 / speed) : lastspeed);
	context.fillText('FPS: ' + lastspeed, 10, 20);
	context.textAlign = 'right';
	context.fillText('Sint version α 0.4', 490, 310);
	context.fillText(test, 490, 290);
	if(game == 'playing'){
		context.fillText('Actors: ' + actors.length, 490, 20);
		context.fillText('Particles: ' + particles.length, 490, 40);
	}
	for(i in ais){
		ais[i].run();
	}
	for(i in particles){
		particles[i].simulate()
		particles[i]. draw()
		if(particles[i].deleteme || particles.length > 3000){
			particles.splice(i, 1);
			i--;
		}
	}
	if(game == 'menu'){
		if(keys.indexOf(83) > -1){
			if(menudown == false){
				menudown = true;
				ui.select += 1;
			}
		}else{
			menudown = false;
		}
		if(keys.indexOf(87) > -1){
			if(menuup == false){
				menuup = true;
				ui.select -= 1;
			}
		}else{
			menuup = false;
		}
		if(keys.indexOf(13) > -1){
			if(menuenter == false){
				menuenter = true;
				if(menu[ui.area][ui.select][2]){
					ui.area = menu[ui.area][ui.select][1];
					ui.select = 0;
				}else if(menu[ui.area][0] == 't'){
					ui.area = 0;
					ui.select = 0;
				}
			}
		}else{
			menuenter = false;
		}
		ui.select = (ui.select + menu[ui.area].length) % menu[ui.area].length;
		context.fillStyle = '69d';
		context.font = '40pt Helvetica';
		context.textAlign = 'center';
		context.fillText('Sint', 250, 100);
		// Main menu
		if(menu[ui.area][0] == 'r'){
			switch(menu[ui.area][1]){
				case 'play':
					play();
					game = 'playing';
					break;
				case 'fractal':
					game = 'test';
					break;
				default:
					ui.area = 0;
					break;
			}
		}else if(menu[ui.area][0] == 't'){
					context.fillStyle = '#78a';
					context.font = '12pt Helvetica';
					for(i = 1; i < menu[ui.area].length; i++){
						context.fillText(menu[ui.area][i], 250, 120 + (20 * i));
					}
					context.fillStyle = '#9bf';
					context.fillRect(150, 150 + (20 * i), 200, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = '#fff';
					context.fillText('Back', 250, 168 + (20 * i));
		}else{
			for(i in menu[ui.area]){
				if(menu[ui.area][i][1] == 's'){
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(150, 150 + (30 * i), 80, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 190, 168 + (30 * i));
					context.fillStyle = '#eee';
					context.strokeStyle = (ui.select == i ? '#cdf' : '#ddf');
					context.fillRect(240, 160 + (30 * i), 110, 5);
					context.strokeRect(240, 160 + (30 * i), 110, 5);
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.strokeStyle = (ui.select == i ? '#79f' : '#abf');
					var thisoption = menu[ui.area][i][2];
					var optionaddx = 100 * (optionvars[thisoption] / (menu[ui.area][i][4] - menu[ui.area][i][3]));
					context.strokeRect(240 + optionaddx, 155 + (30 * i), 10, 10);
					context.fillRect(240 + optionaddx, 155 + (30 * i), 10, 10);
					if(ui.select == i){
						if(keys.indexOf(65) > -1 && optionvars[thisoption] > menu[ui.area][i][3]){
							optionvars[thisoption] -= 1;
						}
						if(keys.indexOf(68) > -1 && optionvars[thisoption] < menu[ui.area][i][4]){
							optionvars[thisoption] += 1;
						}
					}
				}else{
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(150, 150 + (30 * i), 200, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 250, 168 + (30 * i));
				}
			}
		}
	}
	// Slow down game to test low framerates
	/*
	for(var j=1; j < 10000000; j++){
		j = j;
	}
	*/
}