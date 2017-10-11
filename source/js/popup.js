'use strict'

/*
 * Функция для склонения слов от числительных.
 * Взято здесь: gist.github.com/ivan1911/5327202#gistcomment-1669858
 */

var declOfNum = ((num, titles) => {
	let
		number = Math.abs(num),
		cases = [2, 0, 1, 1, 1, 2]

	return number + ' ' + titles[(number%100>4 && number%100<20) ? 2 : cases[(number%10<5)?number%10:5]]
})

/*
 * Функция для создания вкладок (модифицированная).
 * Взято здесь: vk.cc/6EwIs0
 */

$make.tabs = (selector => {
	let
		tabAnchors = $make.qs(selector + ' li', ['a']),
		tabs = $make.qs(selector + '_tabs section', ['a'])

	tabAnchors.forEach((tabAnchor, i) => {
		if (tabAnchor.classList.contains('active')) tabs[i].style.display = 'block'

		tabAnchor.addEventListener('click', (e) => {
			let clickedAnchor = e.target || e.srcElement
			clickedAnchor.classList.add('active')

			for (let i = 0, tabsLength = tabs.length; i < tabsLength; i++) {
				if (tabs[i].dataset.tab == clickedAnchor.dataset.tab) {
					tabs[i].style.display = 'block'
				} else {
					tabs[i].style.display = 'none'
					tabAnchors[i].classList.remove('active')
				}
			}
		})
	})
})

var showRemainingTime = (date => {
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
})

document.addEventListener('DOMContentLoaded', () => {
	getData(API.anime_sched).then(showBroadcast)
	getData(API.main_api).then(showSong)

	let aw_timer = setInterval(() => {
		getData(API.main_api).then(showSong)
	}, 5000)

	let
		volume = $make.qs('.volume'),
		docStyle = document.documentElement.style

	volume.addEventListener('input', (e) => {
		userBrowser.runtime.sendMessage({cmd: 'setVol', volume: e.target.value})
		docStyle.setProperty('--volume', e.target.value + '%')
	})

	volume.addEventListener('change', (e) => $ls.set('aw_chr_radioVol', e.target.value))

	userBrowser.runtime.sendMessage({cmd: 'getVol'}, (response => {
		volume.value = response.result
		docStyle.setProperty('--volume', response.result + '%')
	}))

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

	$make.tabs('.tabs')

	let
		optionsBtn = $make.qs('.options'),
		playBtn = $make.qs('.playpause')

	optionsBtn.onclick = () => { userBrowser.runtime.openOptionsPage() }

	userBrowser.runtime.sendMessage({cmd: 'status'}, (response) => {
		let state = response.result ? 'icon icon-play' : 'icon icon-pause';
		playBtn.firstChild.setAttribute('class', state);
	});

	playBtn.onclick = () => {
		userBrowser.runtime.sendMessage({cmd: 'toggle'}, (response) => {
			if (response.result)
				playBtn.firstChild.setAttribute('class', 'icon icon-play')
				else playBtn.firstChild.setAttribute('class', 'icon icon-pause')
		})
	}
})

var showBroadcast = (schedList => {
	let
		schedListF = getNextSched(schedList),
		next = schedListF.next,
		current = schedListF.current,
		nextBrEl = $make.qs('.nextBroadcast')

	if (current) $make.qs('.currentBroadcast').innerHTML = $create.elem('p', $make.tr('curStream') + ':', 'section--title', ['html']) + $create.elem('p', $create.link(`https://${domain.aw}/anime?from=${userBrowserName}`, $make.safe(current['title']), ['html']), 'section--content', ['html'])

	if (next[0] != null) {
		//$ls.set('sched_next', JSON.stringify(next))
		let brTime = new Date(parseInt(next[0]['s'] * 1000))

		nextBrEl.innerHTML = $create.elem('p', `${$make.tr('nextStream')} (${showRemainingTime(brTime)}):`, 'section--title', ['html'])
		nextBrEl.innerHTML += $create.elem('p', $make.safe(next[0]['title']), 'section--content', ['html'])
	} else {
		nextBrEl.innerHTML = $create.elem('p', $make.tr('curStream') + ':', 'section--title', ['html']) + $create.elem('p', $make.tr('noStream'), 'section--content', ['html']);
	}
})

var showSong = (apiOuptut => {
	let
		radioD = JSON.parse(apiOuptut)['radio-v2'][$currentPoint.key()],
		currSong = $make.safe(radioD['song']['curr']).split(' - '),
		songData = currSong[0]

	if (currSong[1]) songData += ' &ndash; ' + currSong[1];

	switch (radioD['rj'].toLowerCase()) {
		case 'auto-dj':
			$make.qs('.nowRJ').textContent = ''; break
		default:
			$make.qs('.nowRJ').innerHTML = $create.elem('p', $make.tr('airLive') + ':', 'section--title', ['html']) + $create.elem('p', $create.link(`https://${domain.aw}/radio?from=${userBrowserName}`, $make.safe(radioD['rj']), ['html']), 'section--content', ['html'])
	}

	$make.qs('.nowPlay').innerHTML = $create.elem('p', $make.tr('nowSong') + ':', 'section--title', ['html']) + $create.elem('p', songData, 'section--content', ['html'])
})
