'use strict'

var getData = url => {
	let	headers = new Headers()
	headers.append('pragma', 'no-cache')
	headers.append('cache-control', 'no-cache')

	let reqInit = {
	   cache: 'no-cache',
	   headers: headers
	}, request = new Request(`${url}?ts=${Date.now()}`, reqInit)

	return fetch(request).then(r => r.ok ? r.text() : '')
}

var spawnNotification = o => {
	if (!o) { return }

	let options = {
		title:           o.title || 'Asian Wave',
		message:         o.text || '',
		contextMessage:  o.context || '',
		iconUrl:         o.img || 'img/icons/logo-64.png',
		type:            o.type || 'basic',
		buttons:         o.buttons || [],
		isClickable:     false
	}, notifID = ''

	// @HACK Opera не поддерживает кнопки в оповещениях (!!!), поэтому приходится поизвращаться

	if (userBrowserName == 'opera') {
		delete options.buttons
		options.isClickable = true
	}

	userBrowser.notifications.create(notifID, options, id => { notifID = id })

	if (o.link) {
		switch (userBrowserName) {
			case 'opera':
				userBrowser.notifications.onClicked.addListener(id => {
					if (notifID == id) { window.open(o.link) }
				}); break
			default:
				userBrowser.notifications.onButtonClicked.addListener((id, index) => {
					if (notifID == id && index == 0) { window.open(o.link) }
				}); break
		}
	}
}

var getNextSched = schedList => {
	let
		now =         Math.floor(new Date().getTime()/1000),
		schedListF =  JSON.parse(schedList),
		result =      { next: [] }

	schedListF.forEach(item => {
		let
			begin = parseInt(item['s']),
			end = parseInt(item['e'])

		if (begin <= now && end > now) { result.current = item }
		if (begin > now) { result.next.push(item) }
	})

	return result
}

var checkSched = (resolve, section) => {
	let
		schedList =  getNextSched(resolve),
		isLive =     schedList.current,
		pre =        $ls.get('aw_chr_animeNowLive'),
		toURL =      domain.aw

	pre = parseInt(pre)

	switch (section) {
		case 'radio':
			toURL += '/' + section; break
		case 'anime':
		default:
			toURL += '/anime'; break
	}

	if (isLive && !pre) {
		spawnNotification({
			title: $make.tr('nowStream') + ':',
			text: isLive['title'],
			context: toURL,
			buttons: [{title: $make.tr('enjoyStream')}],
			link: 'https://' + toURL + '?from=' + userBrowserName
		})
	}

	if (isLive) {
		$ls.set('aw_chr_animeNowLive', isLive['title'])
	} else { $ls.rm('aw_chr_animeNowLive') }
}

// var compareSched = (pre, current) => {
//   let
// 		equal = [],
// 		curr = current.slice()
//
// 	pre.forEach(function(arr) {
// 		for (let i = 0; i < curr.length; i++) {
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

// var checkSched = resolve => {
// 	let current = getNextSched(resolve).next
//
// 	if ($ls.get('sched_next')) {
// 		let
// 			pre = JSON.parse($ls.get('sched_next')),
// 			changes = compareSched(pre, current)
//
// 		if (changes.length > 0) {
// 			for(let i = 0; i < changes.length; i++) {
// 				spawnNotification(changes[i][2], 'img/icons/logo-64.png', $make.tr('updSched'))
// 			}
//
// 			$ls.set('sched_next', JSON.stringify(current))
// 		}
// 	} else {
// 		$ls.set('sched_next', JSON.stringify(current))
// 	}
// }
