'use strict'

/*
 * Функция для склонения слов от числительных.
 * Взято здесь: gist.github.com/ivan1911/5327202#gistcomment-1669858
 */

var declOfNum = (num, titles) => {
	let
		number = Math.abs(num),
		cases = [2, 0, 1, 1, 1, 2]

	return number + ' ' + titles[(number%100>4 && number%100<20) ? 2 : cases[(number%10<5)?number%10:5]]
}

/*
 * Функция для создания вкладок (модифицированная).
 * Взято здесь: vk.cc/6EwIs0
 */

$create.tabs = selector => {
	let
		tabAnchors = $make.qs(selector + ' button', ['a']),
		tabs = $make.qs(selector + '_tabs section', ['a'])

	tabAnchors.forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) {
			tabs[i].style.display = 'block'
		}

		tabAnchor.addEventListener('click', e => {
			let clickedAnchor = e.target
			clickedAnchor.classList.add('active')

			tabs.forEach((tab, i) => {
				if (tab.dataset.tab == clickedAnchor.dataset.tab) {
					tab.style.display = 'block'
				} else {
					tab.style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			})
		})
	})
}

var showRemainingTime = date => {
	let
		remaining = $make.tr('startsIn') + ' ',
		now = new Date(),
		delta = (date - now)/1000,
		days = Math.floor(delta/86400),
		hours = Math.floor(delta/3600),
		minutes = Math.floor((delta%3600)/60)

	if (userLanguage == 'ru') {
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

document.addEventListener('DOMContentLoaded', () => {
	let azuraAPI = `https://${domain.radio}/api/nowplaying/${$currentPoint.id()}`

	getData(API.anime_sched).then(showBroadcast)
	getData(azuraAPI).then(showSong)

	let aw_timer = setInterval(() => {
		getData(azuraAPI).then(showSong)
	}, 5000)

	let
		volume = $make.qs('.volume'),
		docStyle = document.documentElement.style

	volume.addEventListener('input', e => {
		userBrowser.runtime.sendMessage({cmd: 'setVol', volume: e.target.value})
		docStyle.setProperty('--volume', e.target.value + '%')
	})

	volume.addEventListener('change', e => $ls.set('aw_chr_radioVol', e.target.value))

	userBrowser.runtime.sendMessage({cmd: 'getVol'}, response => {
		volume.value = response.result
		docStyle.setProperty('--volume', response.result + '%')
	})

	if (!$ls.get('aw_chr_defaultTab')) {
		$ls.set('aw_chr_defaultTab', 'radio');
		$make.qs('[data-tab="radio"]').classList.add('active')
	} else {
		switch ($ls.get('aw_chr_defaultTab')) {
			case 'anime':
				$make.qs('[data-tab="anime"]').classList.add('active');	break
			default:
			case 'radio':
				$make.qs('[data-tab="radio"]').classList.add('active')
		}
	}

	$create.tabs('.tabs')

	let
		optionsBtn = $make.qs('.options'),
		playBtn = $make.qs('.playpause')

	optionsBtn.onclick = () => { userBrowser.runtime.openOptionsPage() }

	userBrowser.runtime.sendMessage({cmd: 'status'}, response => {
		let state = response.result ? 'icon icon-play' : 'icon icon-pause';
		playBtn.firstChild.setAttribute('class', state);
	});

	playBtn.onclick = () => {
		userBrowser.runtime.sendMessage({cmd: 'toggle'}, response => {
			if (response.result)
				playBtn.firstChild.setAttribute('class', 'icon icon-play')
				else playBtn.firstChild.setAttribute('class', 'icon icon-pause')
		})
	}
})

var showBroadcast = schedList => {
	let
		schedListF = getNextSched(schedList),
		next = schedListF.next,
		current = schedListF.current

	let
		nextBrEl = $make.qs('.nextBroadcast'),
		currBrEl = $make.qs('.currentBroadcast')

	nextBrEl.textContent = ''
	currBrEl.textContent = ''

	if (current) {
		currBrEl.appendChild($create.elem('p', $make.tr('curStream') + ':', 'section--title'))
		currBrEl.appendChild($create.elem('p', $create.link(`https://${domain.nyan}/?from=aw-ext-${userBrowserName}`, $make.safe(current['title']), ['html']), 'section--content'))
	}

	if (next[0] != null) {
		//$ls.set('sched_next', JSON.stringify(next))
		let brTime = new Date(Number(next[0]['s'] * 1000))

		nextBrEl.appendChild($create.elem('p', `${$make.tr('nextStream')} (${showRemainingTime(brTime)}):`, 'section--title'))
		nextBrEl.appendChild($create.elem('p', $make.safe(next[0]['title']), 'section--content'))
	} else {
		nextBrEl.appendChild($create.elem('p', $make.tr('emptySched'), 'section--title'))
	}
}

var showSong = apiOuptut => {
	let
		radioData = apiOuptut,
		songData = radioData['now_playing']['song']['text'].replace(' - ', ' – ')

	let
		songElem =  $make.qs('.nowPlay'),
		rjElem =    $make.qs('.nowRJ')

	songElem.textContent = ''
	rjElem.textContent = ''

	if (radioData['live']['is_live'] != false) {
		rjElem.appendChild($create.elem('p', $make.tr('airLive') + ':', 'section--title'))
		rjElem.appendChild($create.elem('p', $create.link(`https://${domain.aw}/?from=aw-ext-${userBrowserName}`, $make.safe(radioD['rj']), ['html']), 'section--content'))
	}

	songElem.appendChild($create.elem('p', $make.tr('nowSong') + ':', 'section--title'))
	songElem.appendChild($create.elem('p', songData, 'section--content', ['s']))
}
