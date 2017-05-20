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

Object.keys(API).forEach(function(key) { API[key] = 'https://' + domain.aw + '/api/' + API[key] })

/*
 * Определение браузера
 */

var userBrowser = 'chrome'
if (/OPR\//.test(navigator.userAgent)) userBrowser = 'opera'

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
	name: function() {
		return $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].name : points['jp'].name
	},
	port: function() {
		return $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].port : points['jp'].port
	},
	srv: function() {
		return $ls.get('aw_chr_radioPoint') ? points[$ls.get('aw_chr_radioPoint')].srv : points['jp'].srv
	},
	key: function () {
		return $ls.get('aw_chr_radioPoint') || 'jp'
	}
}

/*
 * Локализация
 */

$make.tr = function(s) { return chrome.i18n.getMessage(s) }

;(function() {
	var
		needsTr = $make.qs('[data-tr]', ['a']),
		needsTrTitle = $make.qs('[data-tr-title]', ['a'])

	needsTr.forEach(function(item) { item.textContent = $make.tr(item.dataset.tr) })

	needsTrTitle.forEach(function(item) { item.setAttribute('title', $make.tr(item.dataset.trTitle)) })
})()
