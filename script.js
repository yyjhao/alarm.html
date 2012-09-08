var storage = {
	prefix: 'yyjhao.alarm.',
	get: function(name){
		return localStorage[this.prefix + name];
	},
	set: function(name, val){
		localStorage[this.prefix + name] = val;
	}
};

if(!storage.get('youtube-id')){
	storage.set('youtube-id', 'zh0Oh5zF2iA');
}

//youtube shit
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var myPlayer;
function onYouTubePlayerAPIReady() {
	myPlayer = new YT.Player('youtube-container', {
		height: '300',
		width: '300',
		videoId: storage.get('youtube-id'),
		events: {
			'onReady': function(event){
				event.target.playVideo();
				event.target.pauseVideo();
			}
		}
	});
}

//setup browser-specific stuff.
var isTouch = !!('ontouchstart' in window);
var prefix = (function(){
	var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
		div = document.createElement('div');
	for (var i=0; i<prefixes.length; ++i) {
		if (prefixes[i] + 'Transition' in div.style) { return prefixes[i]; }
	}
})();

//start of main code
var globalTimer = {
	registered: [],
	jsTimer: 0,
	register: function(instance){
		if(this.registered.length === 0){
			this.jsTimer = setInterval(this.updateFunc, 1000);
		}
		this.registered.push(instance);
	},
	unregister: function(instance){
		var pos = this.registered.indexOf(instance);
		if(pos > -1){
			this.registered.splice(pos, 1);
			if(this.registered.length === 0){
				clearInterval(this.jsTimer);
			}
		}
	},
	updateFunc: function(){
		for(var i = 0; i < globalTimer.registered.length; i ++){
			globalTimer.registered[i].update();
		}
	},
	alarm: function(){
		myPlayer.seekTo(0);
		myPlayer.playVideo();
	}
};

var timeLableEnter = function(e){
	if(e.keyCode === 13){
		this.blur();
	}
};

var instance = function(){
	this.dom = document.createElement('li');
	if(isTouch){
		this.dom.className = 'mobile';
	}

	this.progress = document.createElement('div');
	this.progress.className = 'progress';
	this.dom.appendChild(this.progress);

	this.timer = 0;
	this.timeLabel = document.createElement('input');
	//this.timeLabel.contentEditable = true;
	this.timeLabel.type = 'text';
	this.timeLabel.onblur = this.timeEdited(this);
	this.timeLabel.onkeypress = timeLableEnter;
	this.dom.appendChild(this.timeLabel);
	
	var right = document.createElement('div');
	right.className = 'right-container';

	var rotate = document.createElement('div');
	rotate.className = 'rotatable';

	var roarea = document.createElement('div');
	roarea.className = 'rotate-area';

	var but = document.createElement('button');
	but.innerHTML = 'Remove';
	bindClick(but, this.remove(this));

	roarea.appendChild(but);

	var back = document.createElement('div');
	back.className = 'back';
	roarea.appendChild(back);

	rotate.appendChild(roarea);
	right.appendChild(rotate);

	this.check = document.createElement('div');
	this.check.className = 'checkbox';
	bindClick(this.check, this.toggleActive(this));
	right.appendChild(this.check);

	this.dom.appendChild(right);
};

instance.prototype.update = function(){
	if(this.elapsedTime === this.remainingTime){
		globalTimer.alarm();
		this.setActive(false);
	}else{
		this.elapsedTime++;
		this.progress.style.width = this.elapsedTime / this.remainingTime * 100 + '%';
	}
};

instance.prototype.setTime = function(time){
	this.timeLabel.value = time;
};

instance.prototype.createTimer = function(time){
	var hourminute = time.split(':');
	if(hourminute.length > 2){
		this.timer = 0;
		return;
	}else if(hourminute.length === 2){
		var hour = parseInt(hourminute[0]),
			min = parseInt(hourminute[1]);
		if(isNaN(hour) || isNaN(min) || hour > 24 || hour < 0 || min > 60 || min < 0){
			this.timer = 0;
			return;
		}
		if(hour <= 12){
			if(hourminute[1].indexOf("pm") > 0){
				hour += 12;
			}
		}
		this.timer = [hour,min];
		return;
	}

	var afterIn = time.toLowerCase().split(" ");
	if(afterIn.length < 3 || afterIn[0] !== 'after' && afterIn[0] !== 'in'){
		this.timer = 0;
		return;
	}
	if(afterIn[1] == 'a' || afterIn[1] == 'an'){
		afterIn[1] = 1;
	}
	if(isNaN(afterIn[1])){
		this.timer = 0;
		return;
	}

	if(afterIn[2] === 'hour' || afterIn[2] === 'hours'){
		var hours = afterIn[1];
		if(afterIn.length === 3){
			this.timer = hours * 3600;
			return;
		}else if(afterIn.length === 5){
			if(afterIn[3] == 'a' || afterIn[3] == 'an'){
				afterIn[3] = 1;
			}
			if(isNaN(afterIn[3])){
				this.timer = 0;
				return;
			}
			this.timer = hours * 3600 + afterIn[3] * 60;
			return;
		}
		this.timer = 0;
		return;
	}else{
		var minutes = afterIn[1];
		this.timer = minutes * 60;
		return;
	}
};

instance.prototype.setActive = function(yes){
	this.timeLabel.disabled = yes;
	if(yes){
		this.elapsedTime = 0;
		if(this.timer.length){
			var cur = new Date(),
				next = new Date();
			next.setHours(this.timer[0]);
			next.setMinutes(this.timer[1]);
			next.setSeconds(0);
			if(next < cur){
				next = new Date(next.getTime() + 3600000 * 24);
			}
			this.remainingTime = Math.floor((next.getTime() - cur.getTime()) / 1000 );
		}else{
			this.remainingTime = this.timer;
		}
		globalTimer.register(this);
		this.check.classList.add('checked');
	}else{
		globalTimer.unregister(this);
		this.check.classList.remove('checked');
		this.progress.style.width = "";
	}
};

instance.prototype.timeEdited = function(self){
	return function(){
		if(this.value === ""){
			self.remove(self)();
			return;
		}
		self.createTimer(this.value);
		if(self.timer){
			self.check.classList.add('checked');
			self.check.classList.remove('disabled');
			self.setActive(true);
		}else{
			self.check.classList.remove('checked');
			self.check.classList.add('disabled');
		}
	};
};

instance.prototype.remove = function(self){
	return function(){
		self.setActive(false);
		setTimeout(function(){
			self.dom.parentNode.removeChild(self.dom);
		},500);
		self.dom.style[prefix + 'AnimationName'] = 'slide-out';
	};
};

instance.prototype.toggleActive = function(self){
	return function(){
		if(this.classList.contains('disabled')){
			return;
		}
		if(document.activeElement === self.timeLabel){
			self.timeLabel.blur();
		}else{
			if(this.classList.contains('checked')){
				self.setActive(false);
			}else{
				self.setActive(true);
			}
		}
	};
};

var bindClick = function(elm, func){
	if(isTouch){
		var valid = false;
		elm.ontouchstart = function(){
			valid = true;
		};
		elm.ontouchmove = function(){
			valid = false;
		};
		elm.ontouchend = function(e){
			if(valid){
				func.call(this,e);
			}
		};
	}else{
		elm.onclick = func;
	}
};

document.addEventListener("DOMContentLoaded", function(){
	document.querySelector('#setYoutube').onclick = function(){
		var path = document.querySelector('#youtubepath').value;
		var regexS = "[\\?&]v=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(path);
		if(results === null){
			alert("The path is invalid");
		}else{
			myPlayer.loadVideoById(results[1]);
			myPlayer.pauseVideo();
			storage.set('youtube-id',results[1]);
		}
	};

	var addBut = document.querySelector('#add-button'),
		list = document.querySelector('ul');
	bindClick(addBut, function(){
		var ins = new instance();
		ins.setTime("12:12");
		list.insertBefore(ins.dom,addBut);
		ins.timeLabel.focus();
		ins.timeLabel.select();
	});

	var topArea = document.querySelector('#top-area'),
		settingBut = document.querySelector('.top-button');

	bindClick(settingBut,function(){
		topArea.classList.toggle('shown');
		if(topArea.classList.contains('shown')){
			settingBut.innerHTML = 'Done';
		}else{
			settingBut.innerHTML = 'Settings';
		}
	});

	if(isTouch){
		addBut.classList.add('mobile');
		bindClick(list, function(e){
			var et = e.target;
			if(et.tagName === 'INPUT' || et.classList.contains('checkbox')){
				return false;
			}
			while(et.tagName !== 'LI'){
				et = et.parentNode;
			}
			var par = et.parentNode.querySelector('.tapped');
			if(par)	par.classList.remove('tapped');
			if(par != et && et != addBut)et.classList.add('tapped');
			return false;
		});
	}
}, false );


