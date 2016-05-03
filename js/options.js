window.onload = function() {

	chrome.alarms.get('CheckSchedule', function(alarm) {
		if (alarm !== undefined) {
			document.getElementById('schedCheckEnable').checked = true;
			document.getElementById('schedCheckTime').value = alarm.periodInMinutes;
		}
	});

	chrome.alarms.get('CheckNewAnswers', function(alarm) {
		if (alarm !== undefined) {
			document.getElementById('answersCheckEnable').checked = true;
			document.getElementById('answersCheckTime').value = alarm.periodInMinutes;
		}
	});

	document.getElementById('save').addEventListener('click', saveOptions);	
}


function saveOptions() {
	var schedCheckEnable = document.getElementById('schedCheckEnable').checked;
	var answersCheckEnable = document.getElementById('answersCheckEnable').checked;
	var schedCheckTime = document.getElementById('schedCheckTime').value;
	var answersCheckTime = document.getElementById('answersCheckTime').value;

	localStorage['schedCheckTime'] = schedCheckTime;
	localStorage['answersCheckTime'] = answersCheckTime;

	chrome.alarms.clearAll(bool => console.log('cleared: ' + bool))

	if (schedCheckEnable) {
		chrome.alarms.create("CheckSchedule", {delayInMinutes: 0.1, periodInMinutes: parseInt(schedCheckTime) || 3});
	}

	if (answersCheckEnable) {
		chrome.alarms.create("CheckNewAnswers", {delayInMinutes: 0.1, periodInMinutes: parseInt(answersCheckTime) || 3});
	}
	document.getElementById('savedMsg').innerHTML = 'Схоронил!';
}