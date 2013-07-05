this.xCheck = function(){
			this.left = this.right = false;
			for(j in actors){
				if(actors[j].image != this.image){
					if(actors[j].x + 16 > this.x && this.x > actors[j].x && this.sameY(actors[j])){
						this.left = true;
						this.x = actors[j].x + 16;
						this.xvel = (this.xvel < 0 ? 0 : this.xvel);
					}
					if(this.x + 16 > actors[j].x && this.x < actors[j].x && this.sameY(actors[j])){
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
			}
			
			for(j in actors){
				if(actors[j].image != this.image){
					if(this.y + 16 > actors[j].y && this.y < actors[j].y + 16 && this.sameX(actors[j])){
						if(this.y < actors[j].y){
							this.down = true;
							this.y = actors[j].y - 16;
						}else{
							this.up = true;
							this.y = actors[j].y + 16;
						}
					}
				}
			}
		}
		
		this.sameY = function(obj){
			return (this.y < obj.y + 15 && this.y + 16 > obj.y);
		}
		
		this.sameX = function(obj){
			return (this.x + 15 > obj.x && this.x < obj.x + 15);
		}