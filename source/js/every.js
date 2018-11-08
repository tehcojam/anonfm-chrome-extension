'use strict'

/*
 * API
 */

var domain = {
	aw: {
		same:  'asianwave.ru',
		api:   'aw-api.blyat.science'
	},

	nyan: {
		same:  'nyan.stream',
		api:   'nyan-api.blyat.science'
	},

	mr24: 'myradio24.com'
}

domain.radio = `ryuko.${domain.aw.same}`

var API = {
	anime_sched: `https://${domain.nyan.api}/api/sched`,
	radio_sched: `https://${domain.aw.api}/api/sched`
}

/*
 * Определение браузера
 */

var
	userBrowser = chrome,
	userBrowserName = 'chrome',
	userLanguage = navigator.language || navigator.userLanguage,
	userIsOnline = navigator.onLine

if (/OPR\//.test(navigator.userAgent)) { userBrowserName = 'opera' }

if (/Firefox\//.test(navigator.userAgent)) {
	userBrowser = browser
	userBrowserName = 'firefox'
}

var fromString = `?from=aw-ext-${userBrowserName}`

/*
 * Маунты радио
 */

const DEFAULT_POINT = 'mu'

var points = {
	mu: {
		name: 'Music',
		mr24: {
			server: 1,
			port: 7934
		},
	},
}, storageCurrentPointItemName = 'aw_chr_radioPoint'

switch ($ls.get(storageCurrentPointItemName)) { // фоллбек
	case 'jp':
	case 'ru':
	case 'kr':
	case 'ta':
		$ls.set(storageCurrentPointItemName, DEFAULT_POINT)
}

/*
 * Информация о маунтах радио
 */

var $currentPoint = {
	mr24: {
		server: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].mr24.server
			: points[DEFAULT_POINT].mr24.server,

		port: () => $ls.get(storageCurrentPointItemName)
			? points[$ls.get(storageCurrentPointItemName)].mr24.port
			: points[DEFAULT_POINT].mr24.port,
	},

	name: () => $ls.get(storageCurrentPointItemName)
		? points[$ls.get(storageCurrentPointItemName)].name
		: points[DEFAULT_POINT].name,

	key: () => $ls.get(storageCurrentPointItemName) || DEFAULT_POINT
}

/*
 * Локализация
 */

$make.tr = s => userBrowser.i18n.getMessage(s)

void (() => {
	let
		needsTr = $make.qs('[data-tr]', ['a']),
		needsTrTitle = $make.qs('[data-tr-title]', ['a'])

	needsTr.forEach(item => { item.textContent = $make.tr(item.dataset.tr) })
	needsTrTitle.forEach(item => {
		item.setAttribute('title', $make.tr(item.dataset.trTitle))
	})
})()
