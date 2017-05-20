'use strict'

function getData(url) {
	var	headers = new Headers()
	headers.append('pragma', 'no-cache')
	headers.append('cache-control', 'no-cache')

	var reqInit = {
	   cache: 'no-cache',
	   headers: headers
	}, request = new Request(url + '?ts=' + Date.now(), reqInit)

	return fetch(request).then(function(r) { if(r.ok) return r.text() })
}

function spawnNotification(o) {
	if (!o) return;

	var options = {
		title: o.title || 'Asian Wave',
		message: o.text || '',
		contextMessage: o.context || '',
		iconUrl: o.img || 'img/icons/logo-64.png',
		type: o.type || 'basic',
		buttons: o.buttons || [],
		isClickable: false
	}, notifID = ''

	// @HACK Opera не поддерживает кнопки в оповещениях (!!!), поэтому приходится поизвращаться

	if (userBrowser == 'opera') {
		delete options.buttons
		options.isClickable = true
	}

	chrome.notifications.create(notifID, options, function(id) { notifID = id })

	switch (userBrowser) {
		case 'opera':
			if (o.link) chrome.notifications.onClicked.addListener(function(id) { if (notifID == id) window.open(o.link) }); break
		default:
			if (o.link) chrome.notifications.onButtonClicked.addListener(function(id, index) { if (notifID == id && index == 0) window.open(o.link) })
	}
}

function getNextSched(schedList) {
	var
		now = Math.floor(new Date().getTime()/1000),
		schedList = JSON.parse(schedList),
		result = { next: [] }

	schedList.forEach(function(item) {
		var
			begin = parseInt(item[0]),
			end = parseInt(item[1])

		if (begin <= now && end > now) { result.current = item }
		if (begin > now) { result.next.push(item) }
	})

	return result
}

function checkSched(resolve, section) {
	var
		schedList = getNextSched(resolve),
		isLive = schedList.current,
		pre = parseInt($ls.get('aw_chr_animeNowLive')),
		toURL = domain.aw

	switch (section) {
		case 'radio':
			toURL += '/' + section; break
		case 'anime':
		default:
			toURL += '/anime'
	}

	if (isLive && !pre) spawnNotification({title: $make.tr('nowStream') + ':', text: isLive[2], context: toURL, buttons: [{title: $make.tr('enjoyStream')}], link: 'https://' + toURL + '?from=' + userBrowser})

	if (isLive)
		$ls.set('aw_chr_animeNowLive', isLive[2])
		else $ls.rm('aw_chr_animeNowLive')
}

// function compareSched(pre, current) {
//   var
// 		equal = [],
// 		curr = current.slice()
//
// 	pre.forEach(function(arr) {
// 		for (var i = 0; i < curr.length; i++) {
// 		  if (arr.every(function(el, ind)	{return el == curr[i][ind] ? true : false})) equal.push(i)
// 		}
//   })
//
//   for (var i = 0; i < equal.length; i++) delete curr[equal[i]]
//
//   for (var i = 0; i < curr.length; i++) {
// 		if (curr[i] == undefined) curr.splice(i,1);	i--
// 	}
//
//   return curr
// }

// function checkSched(resolve) {
// 	var current = getNextSched(resolve).next
//
// 	if ($ls.get('sched_next')) {
// 		var
// 			pre = JSON.parse($ls.get('sched_next')),
// 			changes = compareSched(pre, current)
//
// 		if (changes.length > 0) {
// 			for(var i = 0; i < changes.length; i++) {
// 				spawnNotification(changes[i][2], 'img/icons/logo-64.png', $make.tr('updSched'))
// 			}
//
// 			$ls.set('sched_next', JSON.stringify(current))
// 		}
// 	} else {
// 		$ls.set('sched_next', JSON.stringify(current))
// 	}
// }
