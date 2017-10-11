'use strict'

/*
 * API
 */

var domain = {
	'aw': 'asianwave.ru',
	'mr': 'myradio24.com'
}

var API = {
	'main_api': 'api.json',
	'anime_sched': 'anime-sched.json',
	'radio_sched': 'radio-sched.json' // @TODO вставлять расписание радио-потока
}

for (let key in API) { if (API.hasOwnProperty(key)) API[key] = `https://${domain.aw}/api/${API[key]}` }

/*
 * Определение браузера
 */

var
	userBrowser = chrome,
	userBrowserName = 'chrome',
	userLanguage = navigator.language || navigator.userLanguage,
	userIsOnline = navigator.onLine

if (/OPR\//.test(navigator.userAgent)) userBrowserName = 'opera'

if (/Firefox\//.test(navigator.userAgent)) {
	userBrowser = browser
	userBrowserName = 'firefox'
}

/*
 * Маунты радио
 */

var points = {
	'jp': {
		'name': 'Japan',
		'port': 7934,
		'srv': 1
	}, 'ru': {
		'name': 'Russia',
		'port': 9759,
		'srv': 1
	}, 'kr': {
		'name': 'Korea',
		'port': 3799,
		'srv': 1
	}
}

/*
 * Информация о маунтах радио
 */

var $currentPoint = {
	name: () => $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].name : points['jp'].name,
	port: () => $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].port : points['jp'].port,
	srv: () => $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].srv : points['jp'].srv,
	key: () => $ls.get('aw_chr_radioPoint') || 'jp'
}

/*
 * Локализация
 */

$make.tr = (s) => userBrowser.i18n.getMessage(s);

;(() => {
	let
		needsTr = $make.qs('[data-tr]', ['a']),
		needsTrTitle = $make.qs('[data-tr-title]', ['a'])

	needsTr.forEach(item => { item.textContent = $make.tr(item.dataset.tr) })
	needsTrTitle.forEach(item => { item.setAttribute('title', $make.tr(item.dataset.trTitle)) })
})()
