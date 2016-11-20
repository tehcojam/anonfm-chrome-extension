'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function _elems(querySelector) {return document.querySelectorAll(querySelector)}
function _ls(ls_item) {return localStorage.getItem(ls_item)}
function _ls_set(ls_item, ls_item_var) {return localStorage.setItem(ls_item, ls_item_var)}
function tr(string) {return chrome.i18n.getMessage(string)}

var awURL = 'asianwave.ru', shedURL = 'streams-shed.json', apiURL = 'api.json';

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

var initSchedTime = parseInt(_ls('schedCheckTime')) || 3, schedCheckEnable = _ls('schedCheckEnable');

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
	var schedList = getNextSched(resolve), isLive = schedList.current[2], pre = parseInt(_ls('isLive'));

	if (isLive && !pre) {
		spawnNotification(isLive, 'img/icons/48.png', tr('nowStream') + ':', 'https://'+awURL+'/anime/');
	}

	_ls_set('isLive', isLive)
}

function checkSched(resolve) {
	var current = getNextSched(resolve).next;
	if (_ls('sched')) {
		var pre = JSON.parse(_ls('sched')), changes = compareSched(pre, current);

		if (changes.length > 0){
			//console.log('sched updated');
			for(var i=0;i<changes.length;i++) {
				spawnNotification(changes[i][2], 'img/icons/48.png', tr('updShed'));
			}
			_ls_set('sched', JSON.stringify(current));
		}
	} else {
		_ls_set('sched', JSON.stringify(current));
	}

}
