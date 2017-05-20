'use strict'

/*
 * Функция для склонения слов от числительных.
 * Взято здесь: gist.github.com/ivan1911/5327202#gistcomment-1669858
 */

function declOfNum(number, titles) {
	var
		number = Math.abs(number),
		cases = [2, 0, 1, 1, 1, 2]

	return number + ' ' + titles[(number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5]]
}

/*
 * Функция для создания вкладок (модифицированная).
 * Взято здесь: vk.cc/6EwIs0
 */

$make.tabs = function(selector) {
	var
		tabAnchors = this.qs(selector + ' li', ['a']),
		tabs = this.qs(selector + '_tabs section', ['a'])

	for (var i = 0; i < tabAnchors.length; i++) {
		if (tabAnchors[i].classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchors[i].addEventListener('click', function(e) {
			var clickedAnchor = e.target || e.srcElement
			clickedAnchor.classList.add('active')

			for (var i = 0; i < tabs.length; i++) {
				if (tabs[i].dataset.tab == clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block'
				} else {
					tabs[i].style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			}
		})
	}
}

function showRemainingTime(date) {
	var
		remaining = $make.tr('startsIn') + ' ',
		now = new Date(),
		delta = (date - now)/1000,
		days = Math.floor(delta/86400),
		hours = Math.floor(delta/3600),
		minutes = Math.floor((delta%3600)/60),
		browserLang = navigator.language || navigator.userLanguage

	if (browserLang == 'ru') {
		if (days) {
			remaining += declOfNum(days, ['день', 'дня', 'дней'])
		} else if (hours) {
			remaining += declOfNum(hours, ['час', 'часа', 'часов'])
			remaining += ' и ' + declOfNum(minutes, ['минуту', 'минуты', 'минут'])
		} else if (minutes) {
			remaining += declOfNum(minutes, ['минуту', 'минуты', 'минут'])
		} else {
			remaining += 'минуту'
		}
	} else {
		if (days) {
			remaining += declOfNum(days, ['day', 'days', 'days'])
		} else if (hours) {
			remaining += declOfNum(hours, ['hour', 'hours', 'hours'])
			remaining += ' and ' + declOfNum(minutes, ['minute', 'minutes', 'minutes'])
		} else if (minutes) {
			remaining += declOfNum(minutes, ['minute', 'minutes', 'minutes'])
		} else {
			remaining += 'a minute'
		}
	}

	return remaining
}

document.addEventListener('DOMContentLoaded', function() {
	getData(API.anime_sched).then(showBroadcast)
	getData(API.main_api).then(showSong)

	var aw_timer = setInterval(function() {
		getData(API.main_api).then(showSong)
	}, 5000)

	var
		volume = $make.qs('.volume'),
		docStyle = document.documentElement.style

	volume.oninput = function() {
		chrome.runtime.sendMessage({cmd: 'setVol', volume: this.value})
		docStyle.setProperty('--volume', this.value + '%')
	}

	volume.onchange = function() { $ls.set('aw_chr_radioVol', this.value) }

	chrome.runtime.sendMessage({cmd: 'getVol'}, function(response) {
		volume.value = response.result
		docStyle.setProperty('--volume', response.result + '%')
	})

	if (!$ls.get('aw_chr_defaultTab')) {
		$ls.set('aw_chr_defaultTab', 'radio');
		$make.qs('[data-tab="radio"]').classList.add('active')
	} else {
		switch ($ls.get('aw_chr_defaultTab')) {
			default:
			case 'radio':
				$make.qs('[data-tab="radio"]').classList.add('active');	break
			case 'anime':
				$make.qs('[data-tab="anime"]').classList.add('active')
		}
	}

	$make.tabs('.tabs')

	var
		optionsBtn = $make.qs('.options'),
		playBtn = $make.qs('.playpause')

	optionsBtn.onclick = function() { chrome.runtime.openOptionsPage() }

	chrome.runtime.sendMessage({cmd: 'status'}, function(response) {
		var state = response.result ? 'icon icon-play' : 'icon icon-pause';
		playBtn.firstChild.setAttribute('class', state);
	});

	playBtn.onclick = function() {
		chrome.runtime.sendMessage({cmd: 'toggle'}, function(response) {
			if (response.result)
				playBtn.firstChild.setAttribute('class', 'icon icon-play')
				else playBtn.firstChild.setAttribute('class', 'icon icon-pause')
		})
	}
})

function showBroadcast(schedList) {
	var
		schedList = getNextSched(schedList),
		next = schedList.next,
		current = schedList.current,
		nextBrEl = $make.qs('.nextBroadcast')

	if (current) $make.qs('.currentBroadcast').innerHTML = $make.elem('p', $make.tr('curStream') + ':', 'section--title', ['html']) + $make.elem('p', $make.link('https://' + domain.aw + '/anime?from=' + userBrowser, $make.xss(current[2]), ['html']), 'section--content', ['html'])

	if (next[0] != null) {
		//$ls.set('sched_next', JSON.stringify(next))
		var brTime = new Date(parseInt(next[0][0] * 1000))

		nextBrEl.innerHTML = $make.elem('p', $make.tr('nextStream') + ' (' + showRemainingTime(brTime) + '):', 'section--title', ['html'])
		nextBrEl.innerHTML += $make.elem('p', $make.xss(next[0][2]), 'section--content', ['html'])
	} else {
		nextBrEl.innerHTML = $make.elem('p', $make.tr('curStream') + ':', 'section--title', ['html']) + $make.elem('p', $make.tr('noStream'), 'section--content', ['html']);
	}
}

function showSong(apiOuptut) {
	var
		radioD = JSON.parse(apiOuptut)['radio-v2'][$currentPoint.key()],
		currSong = $make.xss(radioD['song']['curr']).split(' - '),
		songData = currSong[0]

	if (currSong[1]) songData += ' &ndash; ' + currSong[1];

	switch (radioD['rj']) {
		case 'Auto-DJ':
			$make.qs('.nowRJ').textContent = ''; break
		default:
			$make.qs('.nowRJ').innerHTML = $make.elem('p', $make.tr('airLive') + ':', 'section--title', ['html']) + $make.elem('p', $make.link('https://' + domain.aw + '/radio?from=' + userBrowser, $make.xss(radioD['rj']), ['html']), 'section--content', ['html'])
	}

	$make.qs('.nowPlay').innerHTML = $make.elem('p', $make.tr('nowSong') + ':', 'section--title', ['html']) + $make.elem('p', songData, 'section--content', ['html'])
}
