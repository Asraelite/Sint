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

// Set up variables.

function reset(){
	actors = [];
	controllers = [];
	particles =  [];
	ais = [];
	keys = [];
	
	actors[0] = new Actor(1, 200, 3, 5, 5);
	actors[1] = new Actor(2, 200, 3, 50, 5);
	
	actors[2] = new Actor(2, 200, 1, 100, -100);
	
	controllers[0] = new Controller(actors[0], [[68, 'moveRight'], [65, 'moveLeft'], [87, 'jump'], [67, 'camera'], [77, 'flo', 100]]);
	controllers[1] = new Controller(actors[1], [[39, 'moveRight'], [37, 'moveLeft'], [38, 'jump'], [88, 'camera'], [78, 'bounce', 100]]);
	controllers[2] = new Controller(actors[2], [[90, 'camera']]);
	
	ais[0] = new Ai(actors[2], 'pace');
	
	particles[0] = new Particle(0, 0, 2000, 100, 200, 10, 0);
	
	camera = [actors[0], actors[1]];
	canvas.style.background = '#fff';
	canvas.style.display = 'block';
	canvas.style.border = '1px solid #ddd'
	spritesheet = new Image()
	spritesheet.src = 'newsprites.png';
	document.addEventListener('keydown', keyDown, true);
	document.addEventListener('keyup', keyUp, true);
	animate();
}

level = [
			 ['#...................#']
			,['#...................#']
			,['########............#']
			,['################...##']
			,['#####################']
		]

function animate() {
	requestAnimFrame(animate);
	loopGame();
}

function r(num){
	return Math.round(num);
}

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

function Ai(object, ai){
	this.actor = object;
	this.aivars = [0, 0, 0];
	this.run = function(){
		switch(ai){
			case 'alphaBot':
				var playerIndex = -1;
				var topDistance = 400;
				for(i in actors){
					if(actors[i].image == 0 && Math.abs(actors[i].x - this.actor) < topDistance){
						playerIndex = i;
						topDistance = Math.abs(actors[i].x - this.actor) - 50;
					}
				}
				if(playerIndex >= 0){
					
				}
				break;
			case 'pace':
				if(this.aivars[0] == 0 || this.actor.x < -300 || this.actor.x > 300){
					this.aivars[0] = (this.actor.x > 0 ? -1 : 1);
				}
				if(this.xvel == 0){
					this.action('jump');
				}
				this.actor.xvel += ((0.02 * this.aivars[0]) * speed);
		}
	}
}

function Actor(type, health, power, xpos, ypos){
	this.image = type;
	this.health = health;
	this.power = power;
	this.xvel = this.yvel = this.jump = 0;
	this.imageLoad = 2;
	this.right = false;
	this.left = false;
	this.down = false;
	this.up = false;
	this.x = xpos;
	this.y = ypos;
	this.oneactions = [];
	this.actionsturn = [];
	
	this.refreshActions = function(){
		this.oneactions = [];
		for(i in this.actionsturn){
			this.oneactions.push(this.actionsturn[i]);
		}
	}
	
	this.action = function(type){
		switch(type){
			case 'moveLeft':
				this.xvel -= (0.05 * speed);
				break;
			case 'moveRight':
				this.xvel += (0.05 * speed);
				break;
			case 'jump':
				this.yvel = (this.down ? -4 - this.power : this.yvel);
				break;
			case 'melee':
				this.yvel = -6;
				break;
			case 'camera':
				camera = [this];
				break;
			case 'stream':
				particles.push(new Particle(0, 0, 60000, this.x, this.y - 1, this.xvel * 3 + ((Math.random() - 0.5) * 10), -3 + this.yvel * 3));
				break;
			case 'bounce':
				particles.push(new Particle(1, 0, 5000, this.x, this.y - 1, this.xvel * 2 + ((Math.random() - 0.5) * 5), -5 + this.yvel * 3));
				break;
			case 'flo':
				particles.push(new Particle(2, 0, 100000, this.x, this.y - 16, this.xvel * 4 + ((Math.random() - 0.5) * 10), -10));
				break;
		}
		this.actionsturn.push(type);
	}
	
	this.xCheck = function(){
		this.left = this.right = false;
		for(j in actors){
			if(actors[j].image != this.image){
				if(actors[j].x + 17 > this.x && this.x > actors[j].x && this.sameY(actors[j])){
					this.left = true;
					this.x = actors[j].x + 16;
					this.xvel = (this.xvel < 0 ? 0 : this.xvel);
				}
				if(this.x + 17 > actors[j].x && this.x < actors[j].x && this.sameY(actors[j])){
					this.right = true;
					this.x = actors[j].x - 16;
					this.xvel = (this.xvel > 0 ? 0 : this.xvel);
				}
			}
		}
	}
	
	this.yCheck = function(){
		this.up = this.down = false;
		if(this.y >= 216){
			this.down = true;
			this.y = 216;
			this.yvel = 0;
		}
		for(j in actors){
			if(actors[j].image != this.image){
				if(this.y + 15 > actors[j].y && this.y < actors[j].y + 15 && this.sameX(actors[j])){
					this.down = true;
					this.y = actors[j].y - 18;
					this.yvel = 0;
				}
			}
		}
	}
	
	this.sameY = function(obj){
		return (this.y < obj.y + 15 && this.y + 15 > obj.y);
	}
	
	this.sameX = function(obj){
		return (this.x + 16 > obj.x && this.x < obj.x + 16);
	}
	
	this.simulate = function(){
		this.y += this.yvel;
		this.yCheck();
		if(this.down){
			if(this.yvel > 10){
				this.yvel *= -0.2;
				this.y -= 1;
			}else{
				this.yvel = 0;
			}
		}else{
			this.yvel += 0.03 * speed;
		}
		this.x += this.xvel;
		this.xCheck();
		this.xvel /= 1 + (0.005 * speed);
	}
	
	this.draw = function(){
		context.drawImage(spritesheet, this.image * 17, 0, 16, 16, r(this.x - lookx), r(this.y - 16 - looky), 16, 16);
		context.globalAlpha = 1;
		context.drawImage(spritesheet, this.image * 17, 17, 16, 16, r(this.x - lookx), r((216 - (this.y - 216)) - looky), 16, 16);
		// StartX, StartY, EndX, EndY
		var gradient = context.createLinearGradient(r(this.x - lookx), r((214 - (this.y - 216)) - looky - 5), r(this.x - lookx), r((214 - (this.y - 216)) - looky) + 16);
		gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0)');
		gradient.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
		context.fillStyle = gradient;
		context.fillRect(r(this.x - lookx), r((216 - (this.y - 216)) - looky), 16, 16);
		context.globalAlpha = 1;
		context.fillStyle = "#444";
		context.font = "10pt Arial";
		context.fillText(actors[0].sameY(actors[1]), 10, 100);
		//context.fillText(particles[0].deleteme, 10, 120);
	}
	//this.xvel += (canMove(xpos, ypos, '-1', this.xvel));
}

function Particle(type, affiliation, lifespan, xpos, ypos, xvel, yvel){
	this.x = xpos;
	this.y = ypos;
	this.xvel = xvel;
	this.yvel = yvel;
	this.type = type;
	this.life = lifespan;
	this.size = [3, 5, 7][type];
	this.created = this.timeup = new Date();
	this.timeup = new Date(this.timeup.getTime() + lifespan);
	this.deleteme = false;
	var angle = Math.random() * 360
	this.addx = Math.sin(angle) * ((particles.length + 200) / 5);
	this.addy = Math.cos(angle) * ((particles.length + 200) / 10);
	
	this.draw = function(){
		//context.beginPath();
		//context.rect(this.x, this.y, 3, 3);
		switch(this.type){
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
				context.strokeStyle = '#fac';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 4, 4);
				break;
			case 2:
				context.globalAlpha = 0.2;
				context.lineWidth = 1;
				context.strokeStyle = '#363';
				context.strokeRect(r(this.x - lookx) + 0.5, r(this.y - looky) + 0.5, 5, 5);
				context.strokeStyle = '#7b7';
				context.strokeRect(r(this.x - lookx) + 0.5, r(213 - (this.y - 216) - looky) + 0.5, 5, 5);
				context.globalAlpha = 1;
				break;
		}
	}
	
	this.onGround = function(){
		return (this.y + this.size >= 216);
	}
	
	this.simulate = function(){
		switch(this.type){
			case 0:
				this.yvel += (this.onGround() ? 0 : 0.01 * speed);
				this.xvel /= 1 + (0.005 * speed);
				this.x += this.xvel;
				this.y += this.yvel;
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = 0;
				}
				break;
			case 1:
				this.yvel += (this.onGround() ? 0 : 0.007 * speed);
				this.xvel /= 1 + (0.001 * speed);
				this.x += this.xvel;
				this.y += this.yvel;
				if(this.onGround()){
					this.y = 216 - this.size;
					this.yvel = (this.yvel > 2 ? this.yvel * -0.7 : 0);
				}
				break;
			case 2:
				this.yvel /= 1 + (0.005 * speed);
				this.xvel /= 1 + (0.005 * speed);
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
		}
		if(thisLoop > this.timeup){
			this.deleteme = true;
		}
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
		lookx += (camera[i] instanceof Array ? camera[i][0] : camera[i].x) - 250;
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
}