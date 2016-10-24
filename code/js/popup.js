'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function _elemAll(querySelector) {return document.querySelectorAll(querySelector)}
function tr(string) {return chrome.i18n.getMessage(string)}

function makeTabs(selector) {
	var tab_lists_anchors = _elemAll(selector + ' li'), divs = _elem(selector + '_tabs').querySelectorAll('div[id*="tab_"]');
	for (var i = 0; i < tab_lists_anchors.length; i++) {
		if (tab_lists_anchors[i].classList.contains('active')) {
			divs[i].style.display = 'block';
		}
	}

	for (i = 0; i < tab_lists_anchors.length; i++) {
			_elemAll(selector + ' li')[i].addEventListener('click', function(e) {

			for (i = 0; i < divs.length; i++) {
				divs[i].style.display = 'none';
			}
			for (i = 0; i < tab_lists_anchors.length; i++) {
				tab_lists_anchors[i].classList.remove('active');
			}

			var clicked_tab = e.target || e.srcElement;

			clicked_tab.classList.add('active');
			var div_to_show = '#tab_' + clicked_tab.dataset.tab;

			_elem(div_to_show).style.display = 'block';
		});
	}
}

document.addEventListener('DOMContentLoaded', function() {
	chrome.extension.sendMessage({action: 'getsett'}, function(response){
		volume.value = response.vol;
	});

	if (localStorage['defTab'] === undefined) {
		localStorage['defTab'] = 'defRadio';
		_elem('[data-tab=radio]').classList.add('active');
	} else {
		switch (localStorage['defTab']) {
			default:
			case 'defRadio':
				_elem('[data-tab=radio]').classList.add('active');
				break;
			case 'defAnime':
				_elem('[data-tab=anime]').classList.add('active');
				break;
		}
	}

	makeTabs('.tabs');

	var optionsBtn = _elem('.options'), playBtn = _elem('.playpause'), state;

	optionsBtn.addEventListener('click', function() {
		chrome.runtime.openOptionsPage();
	});

	chrome.runtime.sendMessage({cmd: 'status'}, function(response) {
		state = response.result ? 'icon icon-play' : 'icon icon-pause';
		playBtn.firstChild.setAttribute('class', state);
	});

	playBtn.addEventListener('click', function() {
		chrome.runtime.sendMessage({cmd: 'toggle'}, function(response) {
			if (response.result) {
				playBtn.firstChild.setAttribute('class', 'icon icon-play');
			} else {
				playBtn.firstChild.setAttribute('class', 'icon icon-pause');
			}
		});
	});
});

var volume = _elem('.volume');

volume.addEventListener('input', function() {
	chrome.extension.sendMessage({action: 'setvol', volume: this.value});
});

volume.addEventListener('change', function() {
	_ls_set('player_vol', this.value);
});


/* Локализация */

var trTitles = [
	['.top-panel .options', 'options'],
	['.links a[href*="asianwave.ru"]', 'awSite'],
	['.links a[href*="vk.com/"]', 'awVKPage']
];

for (var i = 0; i < trTitles.length; i++) {
	_elem(trTitles[i][0]).setAttribute('title', tr(trTitles[i][1]));
}
