// var audio = new Audio('http:/anon.fm:8000/radio');

// chrome.runtime.onMessage.addListener(function(mes, sender, sendResponse) {
// 	if (mes.cmd == "toggle") {
// 		if (audio.paused) {
// 			audio.play();
// 			sendResponse({'result': 'playing'})
// 		} else {
// 			audio.pause();
// 			sendResponse({'result': 'paused'})
// 		}
// 	} else if (mes.cmd == "status") {
// 		if (audio.paused) {
// 			sendResponse({'status': 'play'})	
// 		} else {
// 			sendResponse({'status': 'pause'})
// 		}
		
// 	}

// });

// fetch('http://anon.fm:8000/radio').then(function(r){
// 	var reader = r.body.getReader();
// 	console.log(reader)
// 	return reader.read();
// }).then(function(result, done) {
// 	console.log(done);
// 	console.log(result.done);
//    	//var audioCtx = new AudioContext;
	
// 	function playRadio() {
// //		if (!done) {
// 			var tArray = result.value;
// 			var buffer = new ArrayBuffer(tArray.length);
// 			var view = new Uint8Array(buffer);

// 			source = audioCtx.createBufferSource();
// 			audioCtx.decodeAudioData(view.buffer, function(decodedData) {
// 		        source.buffer = decodedData;
// 		        source.connect(audioCtx.destination);
// 		        source.start(0);
// 		    });

		    
// //	    }
// 		if(done) {console.log('ddddddddddddddone')}
// 		//return playRadio();
// 	}	

// 	return playRadio();

// }).catch(e => console.log(e))



fetch('http://anon.fm:8000/radio').then(function(response) {
	var reader = response.body.getReader();
	var audioCtx = new AudioContext();
	//var source = audioCtx.createBufferSource();
	function playRadio() {
		return reader.read().then(function(result) {
			if (!result.done) {
				console.log(result.value)
				var tArray = result.value;
				var buffer = new ArrayBuffer(tArray.length);
				var view = new Uint8Array(buffer);
				view.set(tArray);

				var source = audioCtx.createBufferSource();
				audioCtx.decodeAudioData(view.buffer).then(function(decodedData) {
			        source.buffer = decodedData;
			        source.connect(audioCtx.destination);
			        source.start(0);
			    }).catch(e => console.log(e));
			} else { console.log('ddddddddddddddone')}

			//return playRadio();
		}).catch(e => console.log(e));

	}


	return playRadio();
}).catch(e => console.log(e))
