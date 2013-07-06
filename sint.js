window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	imagesLoading = 0;
	reset();
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
	controllers = [];
	particles =  [];
	ais = [];
	keys = [];
	test = [];
	mouse = {
		x: 0,
		y: 0,
		down: false
	};
	sound = {
		shoot1: new Audio('sfx.wav')
	}
	game = 'menu';
	lastspeed = 0;
	
	// Create 2 actors
	actors[0] = new Actor(0, 'player', 200, 3, 80, 80);
	//actors[1] = new Actor(1, 'player', 200, 3, 50, 5);
	
	actors[1] = new Actor(6, 'all', 50, 3, 70, 80);
	
	// Create player key controllers.
	controllers[0] = new Controller(actors[0], [[68, 'moveRight'], [65, 'moveLeft'], [87, 'jump'], [67, 'camera'], [77, 'dark', 100], [83, 'shoot']]);
	//controllers[1] = new Controller(actors[1], [[39, 'moveRight'], [37, 'moveLeft'], [38, 'jump'], [88, 'camera'], [78, 'bounce', 100]]);
	
	ais[0] = new Ai(1, 'alphaBot');
	// type, affiliation, lifespan, xpos, ypos, xvel, yvel
	particles[0] = new Particle('mouse', 0, 10000000000, 0, 0, 0, 0);
	
	camera = [actors[0]]; // Set camera.
	canvas.style.background = '#ddf'; // Set canvas style.
	level = 0 // Set level
	canvas.style.display = 'block'; // Set up canvas
	canvas.style.border = '1px solid #ddd';
	spritesheet = new Image(); // Define spritesheet
	spritesheet.src = 'actors.png';
	document.addEventListener('keydown', keyDown, true); // Add key events
	document.addEventListener('keyup', keyUp, true);
	document.addEventListener('mousemove', function(evt){mouse = getMouse(evt)}, false);
	animate();
}

// Define the level.
levels = [
			[
			 '################################################'
			,'################################################'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##............................................##'
			,'##..###..##........####..............###########'
			,'###########........#############################'
			,'################################################'
			,'################################################'
			,'################################################'
			,'################################################'
			,'################################################'
			,'################################################'
			,'################################################'
			]
		]

function animate() {
	requestAnimFrame(animate);
	loopGame();
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
function Actor(image, type, health, power, xpos, ypos){
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
	this.box = new Box(this.x, this.y, 16, 16, this.xvel, this.yvel, ['player', 'pacer']); // Set physics class for this actor
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
		
		//this.xvel *= Math.pow(0.992, speed);
	}
	
	this.draw = function(){
		var reflect = 100; // Depth reflection goes before fading completely
		var drawx = r(this.x - lookx);
		var drawy = 200;
		context.drawImage(spritesheet, this.image * 16, 16, 16, 16, drawx, r(this.y - 16 - looky), 16, 16);
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
				context.strokeStyle = '#aaa';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 4, 4);
				context.globalAlpha = 1;
		}
	}
	
	this.onGround = function(){
		return (this.y > 216 - this.size);
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
	}
}

// Collision detection class
function Box(x, y, w, h, xvel, yvel, colgroup){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.col = colgroup;
	this.right = false;
	this.left = false;
	this.up = false;
	this.down = false;
	
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
				var xcol = (((this.x - (hr == colareax - 1 ? 1 : 0)) >> 4) + hr);
				var ycol = (((this.y - (vr == colareay - 1 ? 1 : 0)) >> 4) + vr); 
				if(lv[ycol - 1][xcol] == '#'){
					collision = true;
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
			this.x = ((this.x >> 4) << 4) + (this.xvel > 0 ? 0 : 16);
			this.xvel = 0;
		}
		this.y += this.yvel;
		if(this.collide()){
			this.y = ((this.y >> 4) << 4) + (this.yvel > 0 ? 0 : 16);
			if(this.yvel < 0){
				this.down = true;
			}
			this.yvel = 0;
		}
		this.reset();
		
	}
	
	this.run = function(){
		this.y += 1;
		if(this.collide() == false){
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
	for(i in camera){
		lookx += (camera[i] instanceof Array ? camera[i][0] : camera[i].x + camera[i].xvel) - 250;
		// looky += (camera[i] == instanceof Array ? camera[i][1] : camera[i].y) - 175;
	}
	lookx /= camera.length;
	looky /= camera.length;
	/*
	if( instanceof Array){
		lookx = camera[0];
		looky = camera[1];
	}else{
		lookx = camera.x - 250 + camera.xvel * 5;
		looky = 0;
	}
	*/
	for(i in controllers){
		controllers[i].checkKeys();
	}
	for(i in actors){
		actors[i].simulate();
		actors[i].draw();
	}
	context.globalAlpha = 1;
	context.lineWidth = 1;
	for(i in levels[level]){
		for(j in levels[level][i]){
			if(levels[level][i][j] == '#'){
				//context.fillStyle = ['#aaa', '#bbb', '#ccc', '#ddd', '#eee', '#fff'][Math.floor(Math.random() * 6)];
				context.fillStyle = '#7a7';
				if(i > 0){
					if(levels[level][i - 1][j] == '#'){
						context.fillStyle = '#ca4';
					}
				}
				context.fillRect((j << 4) - r(lookx), i << 4, 16, 16);
				if(context.fillStyle == '#ccaa44'){
					context.fillStyle = '#b93';
					for(k = 1; k <= 3; k++){
						context.fillRect((j << 4) - r(lookx) + (seed(j * i + k) * 14), (i << 4) + (seed(j * i / k) * 14), 2, 2);
					}
				}
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
	context.fillText('Health: ' + actors[0].health, 10, 290);
	context.fillText('X: ' + r(actors[0].x), 10, 310);
	context.fillText('Y: ' + r(actors[0].y), 70, 310);
	lastspeed = (new Date() % 10 == 0 ? r(1000 / speed) : lastspeed);
	context.fillText('FPS: ' + lastspeed, 10, 20);
	context.textAlign = 'right';
	context.fillText('Sint version α 0.3.3', 490, 310);
	context.fillText(test, 490, 290);
	context.fillText('Actors: ' + actors.length, 490, 20);
	context.fillText('Particles: ' + particles.length, 490, 40);
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
	// Slow down game to test low framerates
	/*
	for(var j=1; j < 10000000; j++){
		j = j;
	}
	*/
}