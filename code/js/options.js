'use strict';

function _elem(querySelector) { return document.querySelector(querySelector) }
function _ls(ls_item) { return localStorage.getItem(ls_item) }
function _ls_rm(ls_item) { return localStorage.removeItem(ls_item) }
function _ls_set(ls_item, ls_item_var) { return localStorage.setItem(ls_item, ls_item_var) }
function tr(string) { return chrome.i18n.getMessage(string) }

document.addEventListener('DOMContentLoaded', function() {
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

	if (!_ls('defTab')) {
		_ls_set('defTab', 'defRadio');
	} else {
		_elem('#defTab').value = _ls('defTab');
	}

	if (_ls('schedCheckTime') === undefined) {
		_ls_set('schedCheckTime', false);
	} else {
		_elem('#schedCheckTime').value = _ls('schedCheckTime');
	}

	_elem('#save').addEventListener('click', saveOptions);
});

function saveOptions() {
	var
		schedCheckEnable = _elem('#schedCheckEnable').checked,
		schedCheckTime = _elem('#schedCheckTime').value,
		defTab = document.getElementById('defTab').value;

	_ls_set('schedCheckTime', schedCheckTime);
	_ls_set('defTab', defTab);

	chrome.alarms.clearAll();

	if (schedCheckEnable) {
		chrome.alarms.create("CheckSchedule", {delayInMinutes: 0.1, periodInMinutes: parseInt(schedCheckTime) || 10});
		_ls_rm('schedCheckEnable');
	} else {
		_ls_set('schedCheckEnable', 0);
	}

	_elem('#saveMsg').style.display = 'inline';
}
