'use strict'

/*
 * Каждый раз при загрузке расширение возвращает бадж в его "дефолтное" состояние
 */

var extension = userBrowser.browserAction

extension.setBadgeBackgroundColor({color: [100, 100, 100, 1]})
extension.setBadgeText({text: ''})

/*
 * Настройка радио
 */

var getRadioSrc = () => `https://${domain.radio}/radio/${$currentPoint.port()}/listen`

var radio = new Audio(), volume

if (!$ls.get('aw_chr_radioVol')) {
	volume = 50; $ls.set('aw_chr_radioVol', volume)
} else {
	volume = $ls.get('aw_chr_radioVol')
}

radio.preload = 'none'
radio.volume = $ls.get('aw_chr_radioVol')/100

radio.toggle = function() {
	if (radio.paused) {
		radio.src = getRadioSrc()
		radio.play()
		extension.setBadgeText({text: (userBrowserName == 'opera') ? 'play' : '\u23F5'})
	} else {
		radio.src = ''
		extension.setBadgeText({text: ''})
	}
}

radio.toPoint = point => {
	if (!Object.keys(points).includes(point)) { return }

	let
		_this = radio,
		storageRadioOnPauseItemName = 'aw_chr_radioOnPause'

	$ls.set(storageRadioOnPauseItemName, _this.paused)
	$ls.set(storageCurrentPointItemName, point)

	_this.src = getRadioSrc()

	if ($ls.get(storageRadioOnPauseItemName) == 'false') {
		_this.load()
		_this.play()
	}

	$ls.rm(storageRadioOnPauseItemName)
}

/*
 * Обработчики событий
 */

userBrowser.runtime.onMessage.addListener((mes, sender, sendResponse) => {
	switch (mes.cmd) {
		case 'toggle':
			radio.toggle()
			sendResponse({'result': radio.paused}); break
		case 'status':
			sendResponse({'result': radio.paused}); break
		case 'getVol':
			sendResponse({'result': volume}); break
		case 'setVol':
			volume = mes.volume
			radio.volume = volume/100
			break
		case 'changePoint':
			radio.toPoint(mes.point); break
	}
})

userBrowser.alarms.onAlarm.addListener(alarm => {
	getData(API.anime_sched).then(resolve => checkSched(resolve, 'anime'))
})
