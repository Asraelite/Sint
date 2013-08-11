/*
	This was an attempt to create a loading bar type thing to load files 1-by-1.
	Mainly for when the game had lots of sounds that took a while to load.
	Didn't work properly and is now obsolete as of version Alpha 0.4.2
*/

window.onload = function(){
	canvas = document.getElementById('game');
	context = canvas.getContext('2d');
	canvas.style.display = 'block'; // Set up canvas
	canvas.style.border = '1px solid #ddd';
	canvas.style.background = '#fff'; // Set canvas style
	canvas.style.margin = (window.innerHeight > 360 ? window.innerHeight / 2 - 180 + 'px auto' : '10px auto');
	if(window.File && window.FileReader && window.FileList && window.Blob){
		startLoad();
	}else{
		document.write('Please make sure your browser supports HTML5, then reload the page');
	}
};

function startLoad(){
	var files = ['sint.js', 'level.js', 'actors.png']; // Files to load
	context.font = '16pt Helvetica';
	context.fillStyle = '#9af';
	context.textAlign = 'center';
	context.fillText('Loading files...', 250, 165);
	for(i in files){
		var ext = /(?:\.([^.]+))?$/;
		var ext = ext.exec(files[i])[1];
		var loaded = true;
		switch(ext){
			case 'js':
				var ref = document.createElement('script');
				ref.setAttribute('src', files[i]);
				console.debug('Loaded Javascript script "' + files[i] + '".');
				break;
			case 'css':
				var ref = document.createElement('link');
				ref.setAttribute('rel', 'stylesheer');
				ref.setAttribute('type', 'text/css');
				ref.setAttribute('src', files[i]);
				console.debug('Loaded CSS file "' + files[i] + '".');
				break;
			case 'png':
				var name = files[i].substr(0, files[i].lastIndexOf('.'));
				eval(name + ' = new Image();');
				eval(name + '.src = "' + files[i] + '"');
				console.debug('Loaded PNG image "' + files[i] + '".');
				break;
			default:
				console.error('Unsupported file extension "' + ext + '" for file "' + files[i] + '", could not load.');
				var loaded = false;
				break;
		}
		if(loaded){
			document.getElementsByTagName("head")[0].appendChild(ref);
		}
	}
	setTimeout(test, 100);
}

function test(){
	start();
}