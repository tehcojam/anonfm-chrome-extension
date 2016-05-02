var src = 'http:/anon.fm:8000/radio';
var audio = new Audio();
audio.preload = 'none';
audio.volume = 0.5;
audio.toggle = function() {
	if (audio.paused) {
		audio.setAttribute('src', src);
		audio.play();
	} else {
		audio.setAttribute('src', '');
	}
};


chrome.runtime.onMessage.addListener(function(mes, sender, sendResponse) {
	switch (mes.cmd) {
		case 'toggle':
			audio.toggle();
			sendResponse({'result': audio.paused});
			break;

		case 'status':
			sendResponse({'result': audio.paused});
			break;

		// case 'volumeUp':
		// 	audio.volume += 0.1;
		// 	break;

		// case 'volumeDown':
		// 	audio.volume -= 0.1;
		// 	break;

		default:
			break;
	}

});