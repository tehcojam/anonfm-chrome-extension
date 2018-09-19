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
	}
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

var points = {
	mu: {
		name: 'Music',
		port: 8000,
		id: 1
	},
	ta: {
		name: 'Talk',
		port: 8010,
		id: 2
	}
}, storageCurrentPointItemName = 'aw_chr_radioPoint'

switch ($ls.get(storageCurrentPointItemName)) { // фоллбек
	case 'jp':
	case 'ru':
	case 'kr':
		$ls.set(storageCurrentPointItemName, 'mu')
}

/*
 * Информация о маунтах радио
 */

var $currentPoint = {
	port: () => $ls.get(storageCurrentPointItemName)
		? points[$ls.get(storageCurrentPointItemName)].port
		: points['mu'].port,
	name: () => $ls.get(storageCurrentPointItemName)
		? points[$ls.get(storageCurrentPointItemName)].name
		: points['mu'].name,
	id: () => $ls.get(storageCurrentPointItemName)
		? points[$ls.get(storageCurrentPointItemName)].id
		: points['mu'].id,
	key: () => $ls.get(storageCurrentPointItemName) || 'mu'
}

/*
 * Локализация
 */

$make.tr = s => userBrowser.i18n.getMessage(s)

;(() => {
	let
		needsTr = $make.qs('[data-tr]', ['a']),
		needsTrTitle = $make.qs('[data-tr-title]', ['a'])

	needsTr.forEach(item => { item.textContent = $make.tr(item.dataset.tr) })
	needsTrTitle.forEach(item => {
		item.setAttribute('title', $make.tr(item.dataset.trTitle))
	})
})()
