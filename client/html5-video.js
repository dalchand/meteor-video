var _currentSrc = "";
var selectedQualityDeps = new Deps.Dependency;
var video = {
  width: 600,
  height: 400,
  qualities: [ 
    {
      name: "240p", 
      src: "https://download.dev.lifetape.com/p_145/processed_videos/e2e5b3e6a4eb89604c738173277add1b_1393345708986_48_240.webm"
    }
  ],
  defaultQuality: 0
};

Template.html5Video.created = function() {
  var video = this.data;
  if(video.qualities) {
    var index = 0;
    if(video.defaultQuality) {
      index = video.defaultQuality;
    }
    _currentSrc = video.qualities[index].src;
    selectedQualityDeps.changed();
  }
}

UI.body.video = function() {
  return video;
}  

Template.html5Video.source = function() {
  selectedQualityDeps.depend();
  return _currentSrc;  
}

Template.html5Video.selected = function() {
  selectedQualityDeps.depend();
  return (_currentSrc === this.src);
}


Session.setDefault("seeking", false);

Template.html5Video.position = function() {
  return Session.get("position");
}

Template.html5Video.volumeLevel = function() {
  return Session.get("volumeLevel");
}

Template.html5Video.volumeIcon = function() {
  var volume = Session.get("volumeLevel");
  if(volume == 0) {
    return "off";
  } else if(volume <= 50){
    return "down";
  } else {
    return "up";
  }
}

Template.html5Video.progresses = function() {
  return Session.get("progresses");
}

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

Template.html5Video.currentTime = function() {
  return formatTime(Session.get("currentTime"));
}

Template.html5Video.duration = function() {
  if(Session.get("duration")) {
    return formatTime(Session.get("duration"));
  }
}

Template.html5Video.active = function() {
  return Session.get("userActive");
}

Template.html5Video.rendered = function() {
  var v = this.find("video");
  var thumb = this.find(".thumb");
  var self = this;
  $(document).on("mousemove.seek", function(event){
    if(Session.get("seeking")) {
      var clientX = event.clientX;
      var diff = clientX - Session.get("seek_x");
      var position = Session.get("position") + diff;
      Session.set("seek_x", clientX);
      Session.set("position", position);
    }
    Session.set("userActive", true);
  });

  $(document).on("mouseup.seek", function(evt){
    if(Session.get("seeking")) {
      $("body").css("cursor", "default");
      var x = $(thumb).offset().left - $(thumb).outerWidth() / 2;
      var currentTime = (x * v.duration)/($(v).width() - $(thumb).outerWidth());
      seekVideo(v, currentTime);
      Session.set("seeking", false);
    }
    $(self.find(".thumb")).removeClass("stopTransition");
  });

  $(document).on("mousemove.volumeseek", function(event){
    if(Session.get("volume_seeking")) {
      var clientX = event.clientX;
      var diff = clientX - Session.get("volume_seek_x");
      var volume = Session.get("volumeLevel") + diff * 100 / 75;
      if(volume < 0) volume = 0;
      if(volume > 100) volume = 100;
      Session.set("volume_seek_x", clientX);
      Session.set("volumeLevel", volume);
      v.volume = volume / 100;
    }
    Session.set("userActive", true);
  });

  $(document).on("mouseup.volumeseek", function(evt){
    if(Session.get("volume_seeking")) {
      $("body").css("cursor", "default");
      Session.set("volume_seeking", false);
    }
    $(self.find(".volume-thumb")).removeClass("stopTransition");
    $(self.find(".volume-progress")).removeClass("stopTransition");
  });

  $(v).on("mousestop", function(){
    Meteor.setTimeout(function(){
      Session.set("userActive", false);
    }, 6000);
  })

  $(v).on("mouseout", function(){
    Meteor.setTimeout(function(){
      Session.set("userActive", false);
    }, 3000);
  });

  var settings = this.find(".settings");
  $(document).on("click", function(event){
    $(settings).removeClass("open");
  })
}

Template.html5Video.destroyed = function() {
  var v = this.find("video");
  $("body").off("mousemove.seek");
  $("body").off("mouseup.seek");
  $(v).off("mouseout");
  $(v).off("mousestop");
}

Session.setDefault("currentTime", 0);
Session.setDefault("volumeLevel", 0);
var seekVideo = function(video, position) {
  var playing = false;
  if(!video.paused) {
    playing = true;
  } 
  if(playing) {
    video.pause();
  }
  video.currentTime = position; 
  if(playing) {
    video.play();
  }
}

var _currentTime = 0;
var _play = false;
var _currentVolume = 0;

Template.html5Video.events({
  "click .settings li": function(event, template) {
    event.stopPropagation();
    _currentSrc = this.src;
    var video = template.find("video");
    _currentTime = video.currentTime;
    _play = !video.paused;
    selectedQualityDeps.changed();
    video.pause();
    video.load();
  },
  "mousedown .thumb": function(event, template) {
    event.stopPropagation();
    var v = template.find("video");
    $(event.target).addClass("stopTransition");
    if(v) {
      Session.set("seeking", true);
      Session.set("seek_x", event.clientX);
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
      Session.set("volume_seeking", true);
      Session.set("volume_seek_x", event.clientX);
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
      seekVideo(v, currentTime);
    }
  },
  "click .volume-bar": function(event, template) {
    var v = template.find("video");
    var thumb = $(template.find(".volume-thumb"));
    if(v) {
      var x = (event.clientX - $(event.target).offset().left) - thumb.outerWidth() / 2;
      var volume = x / 75;
      if(volume < 0) volume = 0;
      if(volume > 100) volume = 100;
      v.volume = volume;
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
        _currentVolume = v.volume;
        v.volume = 0;
      } else {
        v.volume = _currentVolume;
      }
    }
  },
  "click .fa-play": function(event, template) {
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
  "click .fa-pause": function(event, template) {
    var v = template.find("video");
    if(v) {
      v.pause();
    }
  },
  "play video": function(event, template) {
    var el = template.findAll(".fa-play");
    var video = template.find(".video-wrap");
    var mainPlay = template.find(".main-play");
    if(el) {
      $(el).removeClass("fa-play").addClass("fa-pause");
      $(video).removeClass("paused");
      Meteor.setTimeout(function(){
        $(mainPlay).css("opacity", 0);
      }, 50);
    }
  },
  "pause video": function(event, template) {
    var el = template.findAll(".fa-pause");
    var video = template.find(".video-wrap");
    var mainPlay = template.find(".main-play");
    if(el) {
      $(el).removeClass("fa-pause").addClass("fa-play");
      $(video).addClass("paused");
      Meteor.setTimeout(function(){
        $(mainPlay).css("opacity", "");
      }, 50)
    }
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
      })
    }
  },
  "fullscreenchange .video-wrap": function(event, template) {
    console.log(event);
  },
  "loadedmetadata video": function(event) {
    var v = event.target;
    if(_currentTime > 0) {
      v.currentTime = _currentTime;
    }
    if(_play) {
      v.play();
    }
    Session.set("volumeLevel", 100 * v.volume);
  },
  "loadstart": function(event) {
  
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
    Session.set("progresses", progresses);
  },
  "timeupdate video": function(event, template) {
    var v = event.target;
    if(!Session.get("seeking")) {
      var position = (v.currentTime / v.duration) * ($(v).width() - $(template.find(".thumb")).outerWidth());
      Session.set("currentTime", v.currentTime);
      Session.set("duration", v.duration);
      Session.set("position", position);
    } 
  },
  "volumechange video": function(event) {
    var v = event.target;
    Session.set("volumeLevel", 100 * v.volume);
  }
})


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