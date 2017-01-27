'use strict';

chrome.browserAction.setBadgeBackgroundColor({color: [100, 100, 100, 1]});
chrome.browserAction.setBadgeText({text: ''});

var volume, server = 1, port = 7934;

var src = 'https://listen' + server + '.myradio24.com/' + port, audio = new Audio();
audio.preload = 'none';
//audio.volume = 0.5;
audio.toggle = function() {
	if (audio.paused) {
		audio.setAttribute('src', src);
		audio.play();
		if (!/OPR\//.test(navigator.userAgent)) {
			chrome.browserAction.setBadgeText({text: '\u23F5'});
		} else {
			chrome.browserAction.setBadgeText({text: 'play'});
		}
	} else {
		audio.setAttribute('src', '');
		chrome.browserAction.setBadgeText({text: ''});
	}
};

if (!_ls('player_vol')) {
	volume = 50;
	audio.volume = volume/100;
	_ls_set('player_vol', volume);
}

document.addEventListener('DOMContentLoaded', function() {
	audio.volume = _ls('player_vol')/100;
	volume = _ls('player_vol');
});

chrome.runtime.onMessage.addListener(
	function(mes, sender, sendResponse) {
	switch (mes.cmd) {
		case 'toggle':
			audio.toggle();
			sendResponse({'result': audio.paused});
			break;

		case 'status':
			sendResponse({'result': audio.paused});
			break;

		default:
			break;
	}
});

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.action) {
			case 'setvol':
				volume = request.volume;
				audio.volume = volume/100;
				break;

			case 'getsett':
				sendResponse({vol: volume});
				break;

			default:
				break;
		}
});
