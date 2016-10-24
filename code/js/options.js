'use strict';

function _elem(querySelector) {return document.querySelector(querySelector)}
function tr(string) {return chrome.i18n.getMessage(string)}

window.onload = function() {
	_elem('.tr--schedCheckEnable').textContent = tr('schedCheckEnable');
	_elem('.tr--schedCheckTime').textContent = tr('schedCheckTime');
	_elem('.tr--defaultTab').textContent = tr('defaultTab');

	_elem('#save').textContent = tr('optSave');
	_elem('#saveMsg').textContent = tr('optSaved');
	_elem('#minTs').textContent = tr('optMin');

	chrome.alarms.get('CheckSchedule', function(alarm) {
		if (alarm !== undefined) {
			_elem('#schedCheckEnable').checked = true;
			_elem('#schedCheckTime').value = alarm.periodInMinutes;
		}
	});

	if (localStorage['defTab'] === undefined) {
		localStorage['defTab'] = 'defRadio';
	} else {
		_elem('#defTab').value = localStorage['defTab'];
	}

	_elem('#schedCheckTime').value = localStorage['schedCheckTime'];
	_elem('#save').addEventListener('click', saveOptions);
}

function saveOptions() {
	var schedCheckEnable = _elem('#schedCheckEnable').checked, schedCheckTime = _elem('#schedCheckTime').value, defTab = document.getElementById('defTab').value;

	localStorage['schedCheckTime'] = schedCheckTime;
	localStorage['defTab'] = defTab;

	chrome.alarms.clearAll();

	if (schedCheckEnable) {
		chrome.alarms.create("CheckSchedule", {delayInMinutes: 0.1, periodInMinutes: parseInt(schedCheckTime) || 10});
		localStorage.removeItem('schedCheckEnable');
	} else {
		localStorage['schedCheckEnable'] = 0;
	}

	_elem('#saveMsg').style.display = 'inline';
}
