var selectedQuality = -1;
var qualityDep = new Deps.Dependency;

var video = {
  width: 600,
  height: 400,
  qualities: [ 
    {
      name: "240p", 
      sources: [
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_240.webm", type: "video/webm"},
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_240.mp4", type: "video/mp4"}
      ]
    },
    {
      name: "480p", 
      sources: [
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_480.webm", type: "video/webm"},
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_480.mp4", type: "video/mp4"}
      ]
    },
    {
      name: "720p", 
      sources: [
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_720.webm", type: "video/webm"},
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_720.mp4", type: "video/mp4"}
      ]
    },
    {
      name: "1080p", 
      sources: [
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_1080.webm", type: "video/webm"},
        {src: "https://download.dev.lifetape.com/p_147/processed_videos/bb7b0404474f3cdebb0287ae664438c5_1397211551927_87_1080.mp4", type: "video/mp4"}
      ]
    }
  ],
  defaultQuality: 0
};

UI.body.video = function() {
  return video;
}  

Template.html5Video.sources = function() {
  if(this.qualities) {
    if(selectedQuality === -1) selectedQuality = this.defaultQuality;
    if(this.qualities[selectedQuality]) {
      return this.qualities[this.defaultQuality].sources;
    }
  }
}

Session.setDefault("seeking", false);
Session.setDefault("logs", "");

Template.html5Video.logs = function() {
  return Session.get("logs");
}

function timeRangesToString(r, total) {
  var log = "";
  for (var i=0; i<r.length; i++) {
    log += "[ " + Math.round(r.start(i) * 100/total) + "%, " + Math.round(r.end(i) * 100/total) + "% ]<br>";
  }
  return log;
}

Template.html5Video.position = function() {
  return Session.get("position");
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
  return formatTime(Session.get("duration"));
}

Template.html5Video.active = function() {
  return Session.get("userActive");
}

Template.html5Video.rendered = function() {
  var v = this.find("video");
  var thumb = this.find(".thumb");
  var self = this;
  $("body").on("mousemove.seek", function(event){
    if(Session.get("seeking")) {
      var clientX = event.clientX;
      var diff = clientX - Session.get("seek_x");
      var position = Session.get("position") + diff;
      Session.set("seek_x", clientX);
      Session.set("position", position);
    }
    Session.set("userActive", true);
  });

  $("body").on("mouseup.seek", function(evt){
    if(Session.get("seeking")) {
      $("body").css("cursor", "default");
      var x = $(thumb).offset().left - $(thumb).outerWidth() / 2;
      var currentTime = (x * v.duration)/($(v).width() - $(thumb).outerWidth());
      seekVideo(v, currentTime);
      Session.set("seeking", false);
    }
  });

  $(v).on("mousestop", function(){
    Meteor.setTimeout(function(){
      Session.set("userActive", false);
    }, 5000);
  })

  $(v).on("mouseout", function(){
    Meteor.setTimeout(function(){
      Session.set("userActive", false);
    }, 1000);
  });
}

Template.html5Video.destroyed = function() {
  var v = this.find("video");
  $("body").off("mousemove.seek");
  $("body").off("mouseup.seek");
  $(v).off("mouseout");
  $(v).off("mousestop");
}

Session.setDefault("currentTime", 0);
 
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

Template.html5Video.events({
  "mousedown .thumb": function(event, template) {
    event.stopPropagation();
    var v = template.find("video");
    if(v) {
      Session.set("seeking", true);
      Session.set("seek_x", event.clientX);
      $("body").css("cursor", "pointer");
    }
  },
  "click .thumb": function(event) {
    event.stopPropagation();
  },
  "click .track": function(event, template) {
    var v = template.find("video");
    var thumb = $(template.find(".thumb"));
    if(v) {
      var x = event.offsetX - thumb.outerWidth() / 2;
      var currentTime = (x * v.duration)/($(v).width() - thumb.outerWidth());
      seekVideo(v, currentTime);
    }
  },
  "canplay video": function(event) {
  //  console.log("canplay");
  },
  "loadeddata video": function(event) {
    console.log("loadeddata");
  },
  "click .fa-play": function(event, template) {
    var v = template.find("video");
    if(v) {
      console.log("click .fa-play")
      v.play();
    }
  },
  "click .fa-pause": function(event, template) {
    var v = template.find("video");
    if(v) {
      v.pause();
    }
  },
  "play video": function(event, template) {
    var el = template.find(".fa-play");
    if(el) {
      $(el).removeClass("fa-play").addClass("fa-pause");
    }
  },
  "pause video": function(event, template) {
    var el = template.find(".fa-pause");
    if(el) {
      $(el).removeClass("fa-pause").addClass("fa-play");
    }
  },
  "click .settingsBtn": function(event, template) {
    var el = template.find(".settings");
    if(el) {
      if($(el).hasClass("open")) {
        $(el).removeClass("open");
      } else {
        $(el).addClass("open");
      }
    }
  },
  "click .fullScreen": function(event, template) {
    var el = $(template.find(".video-wrap"));
    if(el.hasClass("full-screen")) {
      toggleFullScreen();
      $("html").removeClass("video-full-screen");
      el.removeClass("full-screen");
    } else {
      toggleFullScreen();
      $("html").addClass("video-full-screen");
      el.addClass("full-screen");
    }
  },
  "loadedmetadata video": function(event) {
    console.log("loadedmetadata");
  },
  "loadstart": function(event) {
    console.log("loadstart");
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
    //console.log(Session.get("seeking") + " " + v.currentTime);
    if(!Session.get("seeking")) {
      var position = (v.currentTime / v.duration) * ($(v).width() - $(template.find(".thumb")).outerWidth());
      Session.set("currentTime", v.currentTime);
      Session.set("duration", v.duration);
      Session.set("position", position);
    } 
  },
  "volumechanged video": function(event) {
    console.log("volumechanged");
  }
})


function toggleFullScreen() {
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