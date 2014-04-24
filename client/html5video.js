Template.html5video.reactiveVideo = function() {
  console.log(this);
  return new Html5Video(this);
}

Session.setDefault("p_seeking", false);
Session.setDefault("v_seeking", false);
Session.setDefault("lastX", 0);

Template.reactive_html5_video.rendered = function() {
	var v = this.find("video");
  	var thumb = this.find(".thumb");
  	var seek_bar = this.find(".seek-bar");
  	var volume_bar = this.find(".volume-bar");
  	var self = this;
  	
  	var videoState = this.data;

  	$(document).on("mousemove.seek", function(event){
    	if(Session.get("p_seeking")) {
      		var clientX = event.clientX;
      		var diff = clientX - Session.get("lastX");
      		var time = diff * videoState.duration() / $(seek_bar).width();
      		var newTime = videoState.time() + time;
      		videoState.setTime(newTime);
			Session.set("lastX", clientX);
      	}
    });

  	$(document).on("mouseup.seek", function(evt){
    	if(Session.get("p_seeking")) {
      		$("body").css("cursor", "default");
      		var x = $(thumb).offset().left - $(thumb).outerWidth() / 2;
      		var currentTime = (x * v.duration)/($(v).width() - $(thumb).outerWidth());
      		setTime(v, currentTime);
      		Session.set("p_seeking", false);
    	}
    	$(self.find(".thumb")).removeClass("stopTransition");
  	});

  	$(document).on("mousemove.volumeseek", function(event){
    	if(Session.get("v_seeking")) {
      		var clientX = event.clientX;
      		var diff = clientX - Session.get("lastX");
      		var volume = v.volume + diff / $(volume_bar).width();
      		setVolume(v, volume);
      		Session.set("lastX", clientX);
    	}
    });

  	$(document).on("mouseup.volumeseek", function(evt){
    	if(Session.get("v_seeking")) {
      		$("body").css("cursor", "default");
      		Session.set("v_seeking", false);
    	}
    	$(self.find(".volume-thumb")).removeClass("stopTransition");
    	$(self.find(".volume-progress")).removeClass("stopTransition");
  	});

  	$(v).on("mousemove", function(){
  		videoState.setActive(true);
  	});

  	$(v).on("mousestop", function(){
    	Meteor.setTimeout(function(){
      		videoState.setActive(false);
    	}, 7000);
  	})

  	$(v).on("mouseout", function(){
   	 	Meteor.setTimeout(function(){
      		videoState.setActive(false);
    	}, 3000);
  	});

  	var settings = this.find(".settings");
  	$(document).on("click", function(event){
    	$(settings).removeClass("open");
  	});
}


Template.reactive_html5_video.helpers({
	active: function() {
		return this.active();
	},
	playing: function() {
		return this.playing();
	},
	paused: function() {
		return !this.playing();
	},
	source: function() {
  		var quality = this.quality();
  		return quality.src;  
	},
	marginThumb: function() {
		var p = this.progress() / 100;
		return (-p) * 16;
	},
	position: function() {
  		var progress = this.progress();
  		return progress;
	},
	volumeLevel: function() {
  		return this.volume() * 100;
	},
	volumeIcon: function() {
  		var volume = this.volume();
  		if(volume == 0) {
    		return "off";
  		} else if(volume <= 0.5){
    		return "down";
  		} else {
    		return "up";
  		}
	},
	progresses: function() {
  		return this.progresses();
	},
	time: function() {
  		return formatTime(this.time());
	},
	duration: function() {
  		return formatTime(this.duration());
	},
	qualities: function() {
		return this.qualities();
	},
	progresses: function() {
		return this.progresses();
	}
});


var formatTime = function(totalSec) {
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = parseInt(totalSec) % 60;
  if(hours == 0) {
    var result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
  } else {
    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
  }
  return result;
}


Template.reactive_html5_video.destroyed = function() {
  var v = this.find("video");
  $(document).off("mousemove.seek");
  $(document).off("mouseup.seek");
  $(document).off("mousemove.volume");
  $(document).off("mouseup.volume");
  $(v).off("mouseout");
  $(v).off("mousestop");
  $(v).off("mousemove");	 
}

var setTime = function(video, time) {
  var playing = false;
  if(!video.paused) {
    playing = true;
  } 
  if(playing) {
    video.pause();
  }
  if(time > video.duration) time = video.duration;
  if(time < 0) time = 0;
  video.currentTime = time; 
  if(playing) {
    video.play();
  }
}

var setVolume = function(video, volume) {
	if(volume > 1) volume = 1;
  	if(volume < 0) volume = 0;
  	video.volume = volume; 
}


Template.reactive_html5_video.events({
  	"click .settings li": function(event, template) {
		event.stopPropagation();
		var state = template.data;
		var video = template.find("video");
    	state.setSeeking(video.currentTime, !video.paused)
    	state.setQuality(this);
    	video.pause();
    	video.load();
  	},
  	"mousedown .thumb": function(event, template) {
    	event.stopPropagation();
    	var v = template.find("video");
    	$(event.target).addClass("stopTransition");
    	if(v) {
      		Session.set("p_seeking", true);
      		Session.set("lastX", event.clientX);
      		$("body").css("cursor", "pointer");
    	}
  	},
  	"click .thumb": function(event) {
    	event.stopPropagation();
  	},
  	"mousedown .volume-thumb": function(event, template) {
    	event.stopPropagation();
    	$(event.target).addClass("stopTransition");
    	$(template.find(".volume-progress")).addClass("stopTransition");
    	var v = template.find("video");
    	if(v) {
      		Session.set("v_seeking", true);
      		Session.set("lastX", event.clientX);
      		$("body").css("cursor", "pointer");
    	}
  	},
  	"click .volume-thumb": function(event, template) {
    	event.stopPropagation();
  	},
  	"click .track": function(event, template) {
    	var v = template.find("video");
    	var thumb = $(template.find(".thumb"));
    	if(v) {
      		var x = (event.clientX - $(v).offset().left) - thumb.outerWidth() / 2;
      		var currentTime = (x * v.duration)/($(v).width() - thumb.outerWidth());
      		setTime(v, currentTime);
    	}
  	},
  	"click .volume-bar": function(event, template) {
    	var v = template.find("video");
    	var thumb = $(template.find(".volume-thumb"));
    	if(v) {
      		var x = (event.clientX - $(event.target).offset().left) - thumb.outerWidth() / 2;
      		var volume = x / $(template.find(".volume-bar")).width();
      		setVolume(v, volume);
    	}
  	},
  	"canplay video": function(event) {
  
  	},
  	"loadeddata video": function(event) {
  
  	},
  	"click .volume": function(event, template) {
    	var v = template.find("video");
    	if(v) {
      		if(v.volume > 0) {
      			template.data.persistVolume(v.volume);
        		v.volume = 0;
      		} else {
        		v.volume = template.data.getPersistVolume();
      		}
    	}
  	},
  	"click .glyphicon-play": function(event, template) {
    	var v = template.find("video");
    	if(v) {
      		v.play();
    	}
  	},
  	"click video": function(event, template) {
    	var v = event.target;
    	if(v) {
      		if(v.paused) {
        		v.play();
      		} else {
        		v.pause();
      		}
    	}
  	},
  	"click .glyphicon-pause": function(event, template) {
    	var v = template.find("video");
    	if(v) {
      		v.pause();
    	}
  	},
  	"play video": function(event, template) {
    	template.data.setPlaying(true);
  	},
  	"pause video": function(event, template) {
    	template.data.setPlaying(false);
  	},
  	"click .settingsBtn": function(event, template) {
    	event.stopPropagation();
    	var el = template.find(".settings");
    	if(el) {
      		var jQueryEl = $(el);
      		if(jQueryEl.hasClass("open")) {
        		jQueryEl.removeClass("open");    
      		} else {
        		jQueryEl.addClass("open");
      		}
    	}
  	},
  	"click .fullScreen": function(event, template) {
    	var el = $(template.find(".video-wrap"));
    	if(el.hasClass("full-screen")) {
      		$("html").removeClass("video-full-screen");
      		el.removeClass("full-screen");
      		toggleFullScreen();
      		$(document).off("webkitfullscreenchange mozfullscreenchange fullscreenchange");
    	} else {
      		$("html").addClass("video-full-screen");
      		el.addClass("full-screen");
      		toggleFullScreen();
      		$(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", function(event){
        		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
          			$("html").removeClass("video-full-screen");
          			el.removeClass("full-screen");
        		}
      		});
    	}
  	},
  	"loadedmetadata video": function(event, template) {
    	var v = event.target;
    	var seekingOptions = template.data.getSeeking();
    	if(seekingOptions.time > 0) {
      		setTime(v, seekingOptions.time);
    	}
    	if(seekingOptions.play) {
      		v.play();
    	}
    	template.data.setVolume(v.volume);
    },
  	"progress video": function(event, template) {
    	var v = event.target;
    	var r = v.buffered;
    	var thumb = template.find(".thumb");
    	var progresses = [];
    	for(var i = 0; i < r.length; i++) {
      		var start = (r.start(i)/v.duration) * ($(v).width() - $(thumb).outerWidth());
      		var end = (r.end(i)/v.duration) * ($(v).width() - $(thumb).outerWidth());
      		var width = end - start;
      		progresses.push({start: start, end: end, width: width});
    	}
    	template.data.setProgresses(progresses);
  	},
  	"timeupdate video": function(event, template) {
    	var v = event.target;
    	if(!Session.get("p_seeking")) {
    		template.data.setTime(v.currentTime);
      		template.data.setDuration(v.duration);
    	} 
  	},
  	"volumechange video": function(event, template) {
    	var v = event.target;
    	template.data.setVolume(v.volume);
    },
  	"mouseenter .track": function(event) {
    	var el = $(event.target);
    	el.addClass("over").addClass("activate");
  	},
  	"mouseout .track": function(event, template) {
    	var el = $(template.find(".track"));
    	el.removeClass("over");
    	Meteor.setTimeout(function(){
      		if(!el.hasClass("over")) {
        		el.removeClass("activate");
      		}
    	}, 5000);
  	}
});


var toggleFullScreen = function() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}