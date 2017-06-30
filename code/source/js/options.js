'use strict'

document.addEventListener('DOMContentLoaded', function() {
	if (userBrowserName != 'chrome') document.documentElement.classList.add('opera');

	if (!$ls.get('aw_chr_schedCheckTime')) $ls.set('aw_chr_schedCheckTime', 5);

	userBrowser.alarms.get('CheckSchedule', (alarm) => {
		if (alarm != undefined) {
			$make.qs('.schedCheckEnable').checked = true
			$make.qs('.schedCheckTime').value = alarm.periodInMinutes
		} else $make.qs('.schedCheckTime').value = $ls.get('aw_chr_schedCheckTime')
	})

	for (let point in points) {
		if (points.hasOwnProperty(point)) {
			let optElem = $create.elem('option', points[point].name)
			optElem.setAttribute('value', point)
			$make.qs('.radioPoint').appendChild(optElem)
		}
	}

	$make.qs('.radioPoint').value = $currentPoint.key()

	if (!$ls.get('aw_chr_defaultTab'))
		$ls.set('aw_chr_defaultTab', 'radio')
		else $make.qs('.defTab').value = $ls.get('aw_chr_defaultTab')

	$make.qs('.save').addEventListener('click', saveOptions)
})

function saveOptions() {
	let
		radioPoint = $make.qs('.radioPoint').value,
		schedCheckEnable = $make.qs('.schedCheckEnable').checked,
		schedCheckTime = $make.qs('.schedCheckTime').value,
		defTab = $make.qs('.defTab').value

	if (parseFloat(schedCheckTime) >= 2) { $ls.set('aw_chr_schedCheckTime', schedCheckTime) }

	if (radioPoint != $currentPoint.key()) { userBrowser.runtime.sendMessage({cmd: 'changePoint', point: radioPoint}) }

	$ls.set('aw_chr_defaultTab', defTab)

	userBrowser.alarms.clearAll()

	if (schedCheckEnable) userBrowser.alarms.create('CheckSchedule', { delayInMinutes: 1, periodInMinutes: parseFloat($ls.get('aw_chr_schedCheckTime')) || 5 } );

	$make.qs('.saveMsg').style.display = 'inline'
}
