'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function _ls(ls_item) {return localStorage.getItem(ls_item)}
function _ls_rm(ls_item) {return localStorage.removeItem(ls_item)}
function _ls_set(ls_item, ls_item_var) {return localStorage.setItem(ls_item, ls_item_var)}
function tr(string) {return chrome.i18n.getMessage(string)}

var shedURL = 'streams-shed.json', apiURL = 'api.json', awURL = 'asianwave.ru';

function getData(url) {
	var url = 'https://'+awURL+'/api/' + url + '?from=chrome&ts=' + Date.now(), headers = new Headers();
	headers.append('pragma', 'no-cache');
	headers.append('cache-control', 'no-cache');

	var reqInit = {
	   cache: 'no-cache',
	   headers: headers
	}, request = new Request(url, reqInit);

	return fetch(request).then(function(r) { if(r.ok) return r.text();});
}

document.addEventListener('DOMContentLoaded', function() {
	getData(shedURL).then(showBroadcast);
	getData(apiURL).then(showSong);
});

function showBroadcast(schedList) {
	var schedList = getNextSched(schedList), next = schedList.next,	current = schedList.current, nextBrEl = _elem('.nextBroadcast');
	if (current) {
		_elem('.currentBroadcast').innerHTML = '<p class="section--title">' + tr('curStream') + ':</p><p class="section--content"><a href="https://'+awURL+'/anime/" target="_blank">' + current[2].toString() + '</a></p>';
	}

	if (next[0] != null) {
		localStorage.sched = JSON.stringify(next);

		var brTime = new Date(parseInt(next[0][0] * 1000));
		nextBrEl.innerHTML = '<p class="section--title">' + tr('nextStream') + ' (' + showRemainingTime(brTime) + '):</p>';
		nextBrEl.innerHTML += '<p class="section--content">' + next[0][2].toString() + '</p>';
		//nextBrEl.innerHTML += '<p class="section--sub-content">' + showRemainingTime(brTime) + '</p>';
	} else {
		nextBrEl.innerHTML = '<p class="section--title">'+ tr('curStream') + ':</p><p class="section--content">' + tr('noStream') + '</p>';
	}
}

function showSong(apiOuptut) {
	var radioD = JSON.parse(apiOuptut)['radio'];

	_elem('.nowPlay').innerHTML = '<p class="section--title">' + tr('nowSong') + ':</p><p class="section--content">' + radioD['song']['curr'].toString() + '</p>';

	switch (radioD['rj']) {
		case 'Auto-DJ':
			_elem('.nowRJ').textContent = '';
			break;
		default:
			_elem('.nowRJ').innerHTML = '<p class="section--title">' + tr('airLive') + ':</p><p class="section--content"><a href="https://'+awURL+'/radio/" target="_blank">' + radioD['rj'].toString() + '</a></p>';

	}
}

function spawnNotification(body, icon, title, lnk, buttons, type, id, imageUrl) {
	var options = {
		message: body,
		iconUrl: icon,
		title: title,
		type: type || 'basic',
		buttons: buttons || [],
		imageUrl: imageUrl
	};
	chrome.notifications.create(id, options);
	if (lnk != undefined) {
		chrome.notifications.onClicked.addListener(function(id) {
			window.open(lnk);
		});
	}
}

function compareSched(pre, current) {
  var equal = [], curr = current.slice();
	pre.forEach(function(arr) {
	for(var i=0;i<curr.length;i++) {
	  if (arr.every(function(el, ind){ return el == curr[i][ind]?true:false;} ) ) {
		  equal.push(i);
	  }
	}
   });
   for(var i=0;i<equal.length;i++) {
		delete curr[equal[i]];
   }
   for(i=0;i<curr.length;i++) {
		if (curr[i] === undefined) {
			curr.splice(i,1);
			i--;
		}
	}
  return curr;
}

//alarms

var initSchedTime = parseInt(localStorage['schedCheckTime']) || 3,
		schedCheckEnable = localStorage['schedCheckEnable'];

if (parseInt(schedCheckEnable)) {
	chrome.alarms.create("CheckSchedule", {delayInMinutes: 1, periodInMinutes: initSchedTime});
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	//check schedule for update
	//getData(shedURL).then(checkSched);

	//check DJ isLive
	getData(shedURL).then(checkStream);
});


function getNextSched(schedList) {
	var now = Math.floor(new Date().getTime()/1000), schedList = JSON.parse(schedList), result = {next: []};
	for (var i = 0; i < schedList.length; i++) {
		var begin = parseInt(schedList[i][0]), end = parseInt(schedList[i][1]);

		if (begin <= now && end > now) {
			result.current = schedList[i];
		}

		if (begin > now) {
			result.next.push(schedList[i]);
		}
	}
	return result;
}

function showRemainingTime(date) {
	var remaining = tr('startsIn') + ' ', now = new Date(), delta = (date - now)/1000, days = Math.floor(delta/86400), hours = Math.floor(delta/3600), minutes = Math.floor((delta%3600)/60), browserLang = navigator.language || navigator.userLanguage;
	if (browserLang === 'ru') {
		var dayn_s = 'д', hours_s = 'час', minutes_s = 'минут';
		if (days) {
			remaining += declOfNum(days, [dayn_s+'ень', dayn_s+'ня', dayn_s+'ней']);
		} else if (hours) {
			remaining += declOfNum(hours, [hours_s, hours_s+'а', hours_s+'ов']);
			remaining += ' и ' + declOfNum(minutes, [minutes_s+'у', minutes_s+'ы', minutes_s]);
		} else if (minutes) {
			remaining += declOfNum(minutes, [minutes_s+'у', minutes_s+'ы', minutes_s]);
		} else {
			remaining += minutes_s+'у';
		}
	} else {
		if (days) {
			remaining += declOfNum(days, ['day', 'days', 'days']);
		} else if (hours) {
			remaining += declOfNum(hours, ['hour', 'hours', 'hours']);
			remaining += ' and ' + declOfNum(minutes, ['minute', 'minutes', 'minutes']);
		} else if (minutes) {
			remaining += declOfNum(minutes, ['minute', 'minutes', 'minutes']);
		} else {
			remaining += 'a minute';
		}
	}
	return remaining;
}

/*
	* функция для склонения слов от числительных.
	* Взято здесь: https://gist.github.com/ivan1911/5327202#gistcomment-1669858
*/

function declOfNum(number, titles) {
	var titles, number = Math.abs(number), cases = [2, 0, 1, 1, 1, 2];
	return number + ' ' + titles[(number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5]];
}

// function checkDj(resolve){
// 	var isLive = parseInt(txtToObj(resolve).isLive);
// 	var pre = parseInt(localStorage['isLive']);
//
// 	if (isLive && !pre) {
// 		spawnNotification(' ', 'img/icons/48.png', 'Диджей в эфире');
// 	}
//
// 	localStorage['isLive'] = isLive;
// }

function checkStream(resolve){
	var schedList = getNextSched(resolve), isLive = schedList.current[2], pre = parseInt(localStorage['isLive']);

	if (isLive && !pre) {
		spawnNotification(isLive, 'img/icons/48.png', tr('nowStream') + ':', 'https://'+awURL+'/anime/');
	}

	localStorage['isLive'] = isLive;
}

function checkSched(resolve) {
	var current = getNextSched(resolve).next;
	if (localStorage['sched']) {
		var pre = JSON.parse(localStorage['sched']);
		var changes = compareSched(pre, current);

		if (changes.length > 0){
			//console.log('sched updated');
			for(var i=0;i<changes.length;i++) {
				spawnNotification(changes[i][2], 'img/icons/48.png', tr('updShed'));
			}
			localStorage.sched = JSON.stringify(current);
		}
	} else {
		localStorage.sched = JSON.stringify(current);
	}

}
