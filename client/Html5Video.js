
var canPlayType = function(type) {
  var canPlay = false;
  var v = document.createElement('video');
  if(v.canPlayType && v.canPlayType(type).replace(/no/, '')) {
    canPlay = true;
  }
  return canPlay;
}

Html5Video = function(options) {
	
	this._qualities = [];

	for(var i = 0; i < options.qualities.length; i++) {
		var q = options.qualities[i];
		for(var j = 0; j < q.sources.length; j++) {
			if(canPlayType(q.sources[j].type)) {
				this._qualities.push({name: q.name, src: q.sources[j].src});
				break;
			}
		}
	}

	if(!this._qualities) {
		throw new Meteor.Error(1, "Browser does not support video type");
		return;
	}

	options.qualities;

	this._qualityDeps = new Deps.Dependency;

	this.quality = function() {
		this._qualityDeps.depend();
		return this._quality;
	}

	this.qualities = function() {
		this._qualityDeps.depend();
		return this._qualities;
	}

	this.setQuality = function(q) {
		this._quality = q;
		for(var i = 0; i < this._qualities.length; i++) {
			if(this._quality.name === this._qualities[i].name) {
				this._qualities[i].selected = true;
			} else {
				this._qualities[i].selected = false;
			}
		}
		this._qualityDeps.changed();
	}

	this._volume = 0;
	this._volumeDeps = new Deps.Dependency;
	this._progressDeps = new Deps.Dependency;
	this._time = 0;
	this._duration = 0;
	this._playing = false;
	this._playingDeps = new Deps.Dependency;
	this._loading = false;
	this._loadingDeps = new Deps.Dependency;
	this._loaded = false;

	this._progesses = [];
	this._progessesDeps = new Deps.Dependency;

	this.setProgresses = function(p) {
		this._progesses = p;
		this._progessesDeps.changed();
	}

	this.progresses = function() {
		this._progessesDeps.depend();
		return this._progesses;
	}


	this.loading = function() {
		this._loadingDeps.depend();
		return this._loading;
	}

	this.loaded = function() {
		this._loadingDeps.depend();
		return this._loading;
	}

	this.setLoading = function(f) {
		this._loading = f;
		this._loadingDeps.changed();
	}

	this.setLoaded = function(f) {
		this._loaded = f;
		this._loadingDeps.changed();
	}

	this.setPlaying = function(f) {
		this._playing = f;
		this._playingDeps.changed();
	}

	this.playing = function() {
		this._playingDeps.depend();
		return this._playing;
	}

	this.setTime = function(t) {
		if(this._duration != 0) {
			if(t > this._duration) t = this._duration;
			else if(t < 0) t = 0;
			this._time = t;
			this._progress = this._time / this._duration;
			this._progressDeps.changed();
		}
	}

	this.setDuration = function(t) {
		this._duration = t;
		this._progressDeps.changed();
	}

	this.setVolume = function(v) {
		if(v < 0) v = 0;
		else if(v > 1) v = 1;
		this._volume = v;
		this._volumeDeps.changed();
	}

	this.volume = function() {
		this._volumeDeps.depend();
		return this._volume;
	}

	this.progress = function() {
		this._progressDeps.depend();
		if(this._duration !== 0) {
			return this._time * 100 / this._duration;
		} else {
			return 0;
		}
	}

	this.time = function() {
		this._progressDeps.depend();
		return this._time;
	}

	this.duration = function() {
		this._progressDeps.depend();
		return this._duration;
	}

	this.seekingOptions = {};

	this.setSeeking = function(time, play) {
		this.seekingOptions = {time: time, play: play};
	}

	this.getSeeking = function() {
		return this.seekingOptions;
	}

	this._persistVolume = 0;
	this.persistVolume = function(v) {
		this._persistVolume = v;
	}
	this.getPersistVolume = function() {
		return this._persistVolume;
	}

	this._active = true;
	this._activeDeps = new Deps.Dependency;

	this.setActive = function(a) {
		this._active = a;
		this._activeDeps.changed();
	}

	this.active = function() {
		this._activeDeps.depend();
		return this._active;
	}

	this.setQuality(this._qualities[options.defaultQuality]);	
	
}