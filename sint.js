window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	canvas.style.display = 'block'; // Set up canvas
	canvas.style.border = '1px solid #ddd';
	canvas.style.background = '#fff'; // Set canvas style
	canvas.style.margin = (window.innerHeight > 360 ? window.innerHeight / 2 - 180 + 'px auto' : '10px auto');
	start();
};

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

function start(){
	reset();
}

// Get mouse position
function getMouse(evt){
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// Get touch position on mobiles
function getTouch(evt){
	var rect = canvas.getBoundingClientRect();
	var touch = evt.touches[0];
	console.log(touch);
	evt.preventDefault();
	return {
		x: touch.clientX - rect.left,
		y: touch.clientY - rect.top
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
	keysDown = [];
	test = [];
	level = ['','','','','','','','','','','','','','','','','','','',''];
	partsInserted = [];
	optionvars = [50, 50, 87, 65, 68, 69, 81];
	game = 'menu';
	moveLocked = false;
	lookx = 0;
	ui = {
		select: 0,
		area: 0
	}
	mouse = {
		x: 0,
		y: 0,
		down: false,
		click: false
	};
	tomenu = false;
	slow = false;
	trialComplete = false;
	finTime = false;
	sound = {
		shoot1: new Audio('sfx.wav'),
		jump: new Audio('Funk.mp3'),
	}
	menu = [
		[
			['Play', 4, true],
			//['Multiplayer', 5, true],
			['Options', 1, true],
			['Credits', 6, true]
		],
		[
			['Sound levels', 2, true],
			['Controls', 3, true],
			['Back', 0, true]
		],
		[
			['Music', 's', 0, 0, 100, false],
			['Sound', 's', 1, 0, 100, false],
			['Back', 1, true]
		],
		[
			['Jump', 'c', 2], ['Left', 'c', 3],
			['Right', 'c', 4],['Next', 'c', 5],
			['Prev', 'c', 6],['Back', 1, true, 120]
		],
		[	
			['Adventure', 5, true],
			['Time trial', 7, true],
			['Free play', 5, true],
			['Back', 0, true]
		],
		['r', 'play'],
		['t', 'Sint', '', 'Programming and graphics by Markus Scully (Asraelite)', 'Sound and music by Christian Stryczynski'],
		[
			['"Super Awesome Carrot" by Josh', 8, 0, 'tl'],
			['"Duck" by Asraelite', 8, 1, 'tl'],
			['Back', 7, true]
		],
		['r', 'time']
	];
	lastspeed = 0;
	
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)){ // Check if mobile
		mobile = true;
	}else{
		mobile = false;
	}
	
	// type, affiliation, lifespan, xpos, ypos, xvel, yvel
	defineLevels(); // Call function to create level variables
	//level = 2 // Set level
	spritesheet = new Image(); // Define spritesheet
	spritesheet.src = 'actors.png';
	document.addEventListener('keydown', keyDown, true); // Add key events
	document.addEventListener('keyup', keyUp, true);
	if(mobile){
		document.body.addEventListener('touchstart', function(evt){mouse.down = true}, false);
		document.body.addEventListener('touchend', function(evt){mouse.down = false}, false);
		document.body.addEventListener('touchmove', function(evt){mouse.x = getTouch(evt).x; mouse.y = getTouch(evt).y}, false);
	}else{
		document.addEventListener('mousedown', function(evt){mouse.down = true}, false);
		document.addEventListener('mouseup', function(evt){mouse.down = false}, false);
		document.addEventListener('mousemove', function(evt){mouse.x = getMouse(evt).x; mouse.y = getMouse(evt).y}, false);
	}
	
	animate();
}

function toMenu(){
	actors = [];
	controllers = [];
	particles =  [];
	camera = [];
	ais = [];
	keys = [];
	level = ['','','','','','','','','','','','','','','','','','','',''];
	partsInserted = [];
	game = 'menu';
	ui.area = 0;
	ui.select = 0;
	tomenu = false;
}

function play(){
	// Create player and its key controller
	actors[0] = new Actor(0, 'player', 200, 3, 128, 64, 16, 16);
	controllers[0] = new Controller(actors[0], [[optionvars[4], 'moveRight'], [optionvars[3], 'moveLeft'], [optionvars[2], 'jump'], [27, 'quit'], [81, 'suicide', 0]]);
	
	particles[0] = new Particle('mouse', 0, 10000000000, 0, 0, 0, 0); // Create reticule
	
	finTime = false;
	
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

// Round a number.
function r(num){
	return Math.round(num);
}

function setStrChar(string , index, letter) {
    if(index > string.length-1){
		return string;
	}
    return string.substr(0, index) + letter + string.substr(index + 1);
}

// Generate random number from seed (not used)
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
		keysDown.push(keyPress);
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
			if(actions[i].length > 2 && actions[i][2] == 0){
				if(keysDown.indexOf(actions[i][0]) > -1){
					this.actor.action(actions[i][1]);
				}
			}else{
				if(keys.indexOf(actions[i][0]) > -1){
					this.actor.action(actions[i][1]);
				}
			}
			if(mouse.click && actions[i][0] == 'c'){
				this.actor.action(actions[i][1]);
			}
		}
		this.actor.refreshActions();
	}
}

function Ai(index, ai){
	this.index = index;
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
			case 'pace': // Walking back and forth
				if(this.actor.xvel == 0){
					this.aivars[0] = (1 - this.aivars[0]);
				}
				this.action(this.aivars[0] == 0 ? 'moveRight' : 'moveLeft');
				break;
			case 'still':
				break;
			case 'test': // Jumping AI
				this.action('jump');
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
	//this.box = new Box(this.x, this.y, this.w, this.h, this.xvel, this.yvel, ['player', 'pacer'], true); // Set physics class for this actor
	this.box = new Box(this.x, this.y, this.w, this.h, this.xvel, this.yvel, [], true);
	this.oneactions = [];
	this.actionsturn = [];
	this.index = actors.length;
	this.vars = [false, false, false]; // for use by AIs to control particles
	this.test = '';
	
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
				if(this.box.collide() || this.box.inlava){
					this.yvel = (-4 - this.power) * (this.box.inlava ? 0.2 : 1);
					distanceToSound = Math.abs(this.x - lookx - 250);
					if(distanceToSound < 300){
						sound.jump.volume = (r(distanceToSound < 100 ? 1 : (300 - distanceToSound) / 200) * optionvars[1]) / 100;
						sound.jump.play();
					}
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
				var angle = Math.atan2((this.y) - mouse.y, mouse.x - (this.x - lookx));
				particles.push(new Particle(0, 0, 9000, this.x + 8, this.y - 8, Math.sin(angle) * 15, Math.cos(angle) * 15));
				sound.shoot1.volume = r(optionvars[1]) / 100;
				sound.shoot1.play();
				break;
			case 'bounce':
				particles.push(new Particle(1, 0, 5000, this.x, this.y - 1, this.xvel * 2 + ((Math.random() - 0.5) * 5), 1));
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
			case 'suicide':
				this.health = (this.y > 50 ? 0 : this.health);
				clockStart = new Date().getTime();
				break;
			case 'quit':
				tomenu = true;
				break;
		}
		this.actionsturn.push(type);
	}
	
	this.simulate = function(){
		this.box.xvel = this.xvel;
		this.box.yvel = this.yvel;
		this.box.x = this.x;
		this.box.y = this.y;
		this.box.health = this.health;
		this.box.run();
		this.x = this.box.x;
		this.y = this.box.y;
		this.xvel = this.box.xvel;
		this.yvel = this.box.yvel;
		this.health = this.box.health;
		if(this.health <= 0){
			this.health = 200;
			for(i = 0; i < 64; i++){
				particles.push(new Particle(0, 0, Math.random() * 500 + 2500, this.x + ((i % 8) * 2), this.y - ((i % 8) * 2), (Math.random() - 0.5) * 10, (Math.random() - 0.8) * 10), true);
			}
			this.y = 0;
			this.x = 128;
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

function Particle(type, affiliation, lifespan, xpos, ypos, xvel, yvel, gravity){
	this.gravity = typeof gravty !== 'undefined' ? gravity : true;
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
	this.box = new Box(this.x, this.y, this.size, this.size, this.xvel, this.yvel, [], gravity);
	this.box.unstuck();
	
	this.draw = function(){
		//context.beginPath();
		//context.rect(this.x, this.y, 3, 3);
		if(this.x > lookx - 50 && this.x < lookx + 550 && this.y < 300 && this.y > -50){
			switch(this.type){
				case 'mouse':
					context.globalAlpha = 0.7;
					context.lineWidth = 2;
					context.strokeStyle = '#33d';
					context.strokeRect(mouse.x - this.vars[0] / 2, mouse.y - this.vars[0] / 2, this.vars[0], this.vars[0]);
					break;
				case 0:
					context.globalAlpha = 1;
					context.lineWidth = 1;
					context.strokeStyle = '#66b';
					context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 2, 2);
					break;
				case 1:
					context.globalAlpha = 1;
					context.lineWidth = 2;
					context.strokeStyle = '#b79';
					context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 4, 4);
					break;
				case 2:
					context.globalAlpha = 0.2;
					context.lineWidth = 1;
					context.strokeStyle = '#363';
					context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 5, 5);
					break;
				case 3:
					context.globalAlpha = 0.5;
					context.lineWidth = 1;
					context.strokeStyle = '#000';
					context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 4, 4);ha = 1;
			}
			context.globalAlpha = 1;
		}
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
				this.x = lookx;
				if(mouse.down){
					if(!mobile){
						particles.push(new Particle(0, 0, 9000, lookx + mouse.x, mouse.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5));
					}else{
						if(mouse.y < 100){
							actors[0].action('jump');
						}
						if(mouse.x > 300){
							actors[0].action('moveRight');
						}else if(mouse.x < 200){
							actors[0].action('moveLeft');
						}
					}
					this.vars[0] = 6;
				}
				break;
			case 0:
				for(j in actors){
					if(Math.abs(this.x - (actors[j].x + 8)) < 20 && Math.abs(this.y - (actors[j].y + 8)) < 20){
						this.xvel += (20 - Math.abs(this.x - (actors[j].x + 8))) / (this.x > (actors[j].x + 8) ? 5 : -5);
						this.yvel += (20 - Math.abs(this.y - (actors[j].y + 8))) / (this.y > (actors[j].y + 8) ? 5 : -5);
					}
				}
				break;
			case 1:
			
			default:
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
	this.health = 0;
	this.inlava = false;
	
	this.reset = function(){
		this.right = false;
		this.left = false;
		this.up = false;
		if(!this.inlava){
			this.down = false;
		}
	}
	
	this.collide = function(){
		// Check for collision with level
		var lv = level;
		var colareax = ((this.width - 2) >> 4) + 2;
		var colareay = ((this.height - 2) >> 4) + 2;
		var collision = false;
		var type = 'level';
		this.inlava = false;
		test = [];
		for(var hr = 0; hr < colareax; hr++){
			for(var vr = 0; vr < colareay; vr++){
				var xcol = (((this.x - (hr == colareax - 1 ? 1 + 16 - (((this.width - 1) % 16) + 1): 0)) >> 4) + hr);
				var ycol = (((this.y - (vr == colareay - 1 ? 1 + 16 - (((this.height - 1) % 16) + 1) : 0)) >> 4) + vr);
				if(ycol - 1 >= 0 && ycol <= lv.length){
					if(xcol >= 0 && xcol < lv[ycol].length){
						if(lv[ycol - 1][xcol] == '#'){
							collision = true;
						}else if(lv[ycol - 1][xcol] == 'x'){
							this.health -= 0.01 * speed;
							this.inlava = true;
							this.xvel *= Math.pow(0.997, speed);
							this.yvel *= Math.pow(0.997, speed);
						}else if(lv[ycol - 1][xcol] == 'w'){
							this.inlava = true;
							this.xvel *= Math.pow(0.999, speed);
							this.yvel *= Math.pow(0.999, speed);
						}else if(lv[ycol - 1][xcol] == 'F'){
							trialComplete = true;
						}
					}
				}
			}
		}
		
		for(j in actors){
			var obj = actors[j];
			if(this.y < obj.y + obj.h && this.y + obj.h > obj.y && this.x + obj.w > obj.x && this.x < obj.x + obj.w && obj.box != this){
				collision = true;
			}
		}
		
		return collision;
	}
	
	this.move = function(){
		if(!this.inlava){
			this.down = false;
		}
		var apparentVel = (this.xvel * speed) / (1000 / 60);
		var velToKill = Math.abs(apparentVel)
		var maxMove = Math.floor(this.width / 2);
		while(velToKill > 0){ // If velocity is more than half the box size, only move in increments of half box size to prevent clipping
			if(velToKill > maxMove){
				this.x += (this.xvel > 0 ? maxMove : -maxMove);
				velToKill -= maxMove;
			}else{
				this.x += (this.xvel > 0 ? velToKill : -velToKill);
				velToKill = 0;
			}
			if(this.collide() && Math.abs(this.xvel) > 0){
				this.x = ((this.x >> 4) << 4) + (this.xvel > 0 ? 16 - (((this.width - 1) % 16) + 1) : 16);
				this.xvel = 0;
				velToKill = 0;
			}
		}
		
		var apparentVel = (this.yvel * speed) / (1000 / 60);
		var velToKill = Math.abs(apparentVel);
		var maxMove = Math.floor(this.height / 2);
		while(velToKill > 0){
			if(velToKill > maxMove){
				this.y += (this.yvel > 0 ? maxMove : -maxMove);
				velToKill -= maxMove;
			}else{
				this.y += (this.yvel > 0 ? velToKill : velToKill * -1);
				velToKill = 0;
				
			}
			if(this.collide()){
				this.y = ((this.y >> 4) << 4) + (this.yvel > 0 ? 16 - (((this.height - 1) % 16) + 1) : 16);
				if(this.yvel < 0){
					this.down = true;
				}
				this.yvel = 0;
				velToKill = 0;
			}
		}
		
		if(this.collide()){
			this.unstuck(5000);
		}
		
		this.reset();
		
	}
	
	this.unstuck = function(limit){
		var j = 0;
		var originalx = this.x;
		var originaly = this.y;
		while(this.collide() && j < limit){
			this.x = r(originalx + (Math.sin(Math.PI * 2 * ((j % 16) / 16)) * (j / 4)));
			this.y = r(originaly + (Math.cos(Math.PI * 2 * ((j % 16) / 16)) * (j / 4)));
			j++;
		}
		if(j >= limit){
			this.x = originalx;
			this.y = originaly;
		}
	}
	
	this.run = function(){
		this.y += 1;
		if(this.collide() == false && this.gravity){
			this.yvel += 0.025 * speed;
		}
		this.y -= 1;
		this.xvel *= Math.pow(0.99, speed);
		if(!this.gravity){
			this.yvel *= Math.pow(0.99, speed);
		}
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
	limitLeft = 16;
	limitRight = 16;
	if(game == 'playing'){
		if(gameMode == 'free'){
			var maxx = 0;
			for(i in actors){
				if(actors[i].x > maxx){
					maxx = actors[i].x;
				}
			}
			maxx += 1;
			while(level[0].length < maxx){
				partIndex = Math.floor(Math.random() * (levelparts.length - 1)) + 1;
				partFound = false;
				if(partsInserted.length == 0){
					var toInsert = levelparts[0];
					partsInserted.push([false, '5n', 1, 1, 0]);
					partFound = true;
				}else{
					thisPart = levelparts[partIndex];
					if(thisPart[20] == partsInserted[partsInserted.length - 1][1] && (Math.random() * thisPart[24]) < 1){
						partsInserted.push([thisPart[20], thisPart[21], thisPart[22], thisPart[23], thisPart[24]]);
						toInsert = thisPart;
						partFound = true;
					}
				}
				if(partFound){
					for(i = 0; i < 20; i++){
						level[i] += toInsert[i];
					}
				}
			}
		}else if(gameMode == 'time'){
			level = timelevels[levelNo];
			limitRight = (level[0].length << 4) - 516;
		}
	}
	for(i in controllers){
		controllers[i].checkKeys();
	}
	for(i in actors){
		actors[i].simulate();
	}
	lookx = 0
	looky = 0;
	for(i in camera){
		lookx += (camera[i] instanceof Array ? camera[i][0] : camera[i].x + camera[i].xvel * 1) - 250;
		// looky += (camera[i] == instanceof Array ? camera[i][1] : camera[i].y) - 175;
	}
	lookx /= camera.length;
	looky /= camera.length;
	if(lookx < limitLeft){
		lookx = limitLeft;
	}
	if(lookx > limitRight && gameMode != 'free'){
		lookx = limitRight;
	}
	
	context.globalAlpha = 1;
	context.lineWidth = 1;
	var lv = level;
	for(i = 0; i < lv.length; i++){ // Draw level
		for(j = (lookx > 300 ? r((lookx - 300) / 16) : 0); j < r((lookx + 600) / 16); j++){
			if(lv[i][j] == '#' || lv[i][j] == 'x' || lv[i][j] == 'w'){
				//#efefef
				var edgeTile = false;
				if((j < lv[i].length && j > 0 && i < lv.length - 1 && i > 0)){
					var edgeChecks = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
					for(k in edgeChecks){
						if(lv[i + edgeChecks[k][0]][j + edgeChecks[k][1]] != '#'){
							edgeTile = true;
						}
					}
					if(edgeTile){
						context.fillStyle = '#ddd';
					}else{
						context.fillStyle = '#eee';
					}
				}
				if(lv[i][j] == 'x'){
					context.fillStyle = '#d77';
				}
				if(lv[i][j] == 'w'){
					context.fillStyle = '#47d';
				}
				context.fillRect((j << 4) - r(lookx), i << 4, 16, 16);
			}else if(lv[i][j] == 'E'){
				actors[actors.length] = new Actor(6, 'all', 200, 3, j << 4, i << 4, 16, 16);
				ais[ais.length] = new Ai(actors.length - 1, 'pace');
				level[i] = setStrChar(level[i], j, '.');
			}
		}
	}
	context.fillStyle = 'rgba(255, 200, 200, 0.7)';
	for(i in test){
		context.fillRect((test[i][0] << 4) - lookx, test[i][1] << 4, 16, 16);
	}
	for(i in actors){
		if(actors[i].x < lookx + 550 && actors[i].x > lookx - 50){
			actors[i].draw();
		}
	}
	context.globalAlpha = 1;
	context.fillStyle = "#444";
	context.font = "10pt Arial";
	context.textAlign = 'left';
	if(game == 'playing'){
		context.fillText('Health: ' + r(camera[0].health), 10, 270);
		context.fillText('X: ' + r(camera[0].x), 10, 290);
		context.fillText('Y: ' + r(camera[0].y), 70, 290);
		context.fillText('Xvel: ' + r(camera[0].xvel * 10) / 10, 10, 310);
		context.fillText('Yvel: ' + r(camera[0].yvel * 10) / 10, 70, 310);
	}else{
		context.fillText('W and S to move', 10, 270);
		context.fillText('Enter to select', 10, 290);
		context.fillText('A and D to change slider value', 10, 310);
	}
	lastspeed = (new Date() % 10 == 0 ? r(1000 / speed) : lastspeed);
	context.fillText('FPS: ' + lastspeed, 10, 20);
	if(game == 'playing'){
		if(gameMode == 'time'){
			var time = r((new Date().getTime() - clockStart)) / 1000;
			if(trialComplete && !finTime){
				finTime = (Math.floor(time / 60) + ':' + (r(time % 60) < 10 ? '0' + r(time % 60) : r(time % 60)));
			}
			context.fillText('Time: ' + (finTime ? finTime : (Math.floor(time / 60) + ':' + (r(time % 60) < 10 ? '0' + r(time % 60) : r(time % 60)))), 10, 40);
		}
	}
	context.textAlign = 'right';
	if(mobile){
		context.fillText('RetX: ' + r(mouse.x), 420, 290);
		context.fillText('RetX: ' + r(mouse.y), 490, 290);
		context.fillText('Sint mobile version α 0.5', 490, 310);
	}else{
		context.fillText('Sint version α 0.5', 490, 310);
	}
	context.fillText(test, 490, 290);
	if(game == 'playing'){
		context.fillText('Actors: ' + actors.length, 490, 20);
		context.fillText('Particles: ' + particles.length, 490, 40);
		context.fillText(r(lookx), 490, 60);
		context.fillText(actors[0].test, 490, 80);
	}
	for(i in ais){
		if(Math.abs(ais[i].actor.x - lookx) < 2000){
			ais[i].run();
		}
	}
	for(i in particles){
		try{
			particles[i].simulate();
			particles[i]. draw();
		}catch(err){
			particles.splice(i, 1);
			i--;
			console.error('Particle error');
		}
		if(particles[i].deleteme || particles.length > 3000){
			particles.splice(i, 1);
			i--;
		}
	}
	if(game == 'menu'){
		if(keysDown.indexOf(83) > -1 && moveLocked == false){
			ui.select += 1;
		}else{
			menudown = false;
		}
		if(keysDown.indexOf(87) > -1 && moveLocked == false){
			ui.select -= 1;
		}
		ui.select = (ui.select + menu[ui.area].length) % menu[ui.area].length;
		if(menu[ui.area][0] == 't'){
			ui.select = 0;
		}
		var thisType = menu[ui.area][ui.select][1];
		// Draw menu
		context.fillStyle = '#69d';
		context.font = '40pt Helvetica';
		context.textAlign = 'center';
		context.shadowColor = '#69d';
		context.shadowBlur = 10;
		context.fillText('Sint', 250, 100);
		context.shadowBlur = 0;
		// Main menu
		if(mobile){
			play();
			game = 'playing';
			gameMode = 'free';
		}
		if(menu[ui.area][0] == 'r'){
			switch(menu[ui.area][1]){
				case 'play':
					play();
					game = 'playing';
					gameMode = 'free';
					break;
				case 'time':
					play();
					clockStart = new Date().getTime();
					game = 'playing';
					gameMode = 'time';
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
					context.fillRect(150, 130 + (20 * i), 200, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = '#fff';
					context.fillText('Back', 250, 148 + (20 * i));
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
						if(keys.indexOf(65) > -1){
							if(optionvars[thisoption] > menu[ui.area][i][3]){
								optionvars[thisoption] -= 0.1 * speed;
							}else{
								optionvars[thisoption] = menu[ui.area][i][3]
							}
						}
						if(keys.indexOf(68) > -1){
							if(optionvars[thisoption] < menu[ui.area][i][4]){
								optionvars[thisoption] += 0.1 * speed;
							}else{
								optionvars[thisoption] = menu[ui.area][i][4]
							}
						}
					}
				}else if(menu[ui.area][i][1] == 'c'){
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(150, 120 + (30 * i), 80, 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 190, 138 + (30 * i));
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect(240, 120 + (30 * i), 110, 25);
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					var tempIn = optionvars[parseInt(i) + 2];
					if(tempIn > 47){
						tempIn = String.fromCharCode(tempIn);
					}
					if(tempIn == 0){
						tempIn = 'Enter key';
					}
					context.fillText(tempIn, 290, 138 + (30 * i));
					
					if(ui.select == i){
						if(keysDown.length > 0 && keysDown.indexOf(13) > -1 && moveLocked == false){
							moveLocked = true;
							optionvars[ui.select + 2] = 0;
						}else if(keysDown.length > 0 && moveLocked == true){
							optionvars[ui.select + 2] = keysDown[0];
							moveLocked = false;
						}
					}
				}else{
					thisOne = menu[ui.area];
					if(thisOne[i].length > 3){
						var more = thisOne[i][3];
					}else{
						var more = false;
					}
					context.fillStyle = (ui.select == i ? '#9bf' : '#cdf');
					context.fillRect((more == 'tl' ? 100 : 150), (typeof more === 'number' ? more : 150) + (30 * i), (more == 'tl' ? 300 : 200), 25);
					context.font = '12pt Helvetica';
					context.fillStyle = (ui.select == i ? '#fff' : '#eef');
					context.fillText(menu[ui.area][i][0], 250, (typeof more === 'number' ? more + 18 : 168) + (30 * i));
				}
			}
		}
		if(keysDown.indexOf(13) > -1 && thisType != 'c' && thisType != 's'){
			if(menu[ui.area][ui.select][0] == 't'){
				ui.area = 0;
				ui.select = 0;
			}else if(menu[ui.area][ui.select][3] == 'tl'){
				levelNo = ui.select;
				ui.area = 8;
				ui.select = 0;
			}else{
				ui.area = menu[ui.area][ui.select][1];
				ui.select = 0;
			}
		}
	}
	
	// Slow down game to test low framerates
	if(slow){
		for(var j=1; j < 10000000; j++){
			j = j;
		}
	}
	if(tomenu){
		toMenu();
	}
	keysDown = [];
}