var audio = new Audio('http:/anon.fm:8000/radio');
audio.preload = 'none';
var ctx = new AudioContext();
var source = context.createMediaElementSource(audio);
source.connect(ctx.destination);
source.start();



chrome.runtime.onMessage.addListener(function(mes, sender, sendResponse) {
	if (mes.cmd == "toggle") {
		if (audio.paused) {
			audio.play();
			sendResponse({'result': 'playing'})
		} else {
			audio.pause();
			sendResponse({'result': 'paused'})
		}
	} else if (mes.cmd == "status") {
		if (audio.paused) {
			sendResponse({'status': 'play'})	
		} else {
			sendResponse({'status': 'pause'})
		}
		
	}

 });

// fetch('http://anon.fm:8000/radio').then(function(response) {
// 	var reader = response.body.getReader();
// 	var audioCtx = new AudioContext();
// 	//var source = audioCtx.createBufferSource();

// 	var buff = new Uint8Array(0);

// 	function addToBuffer(chunk) {
// 		var tArray = chunk.value;
// 		var buffer = new ArrayBuffer(tArray.length);
// 		var view = new Uint8Array(buffer);
// 		view.set(tArray);
// 		buff = arrayConcat(buff, view);

// 		if (buff.length < 5000000) {
// 			return reader.read().then(addToBuffer).catch(e => console.log(e));
// 		}
// 		return 'done';
		
// 	}


// 	function arrayConcat(arr1, arr2) {
// 		var resultArray = new Uint8Array(arr1.length + arr2.length);
// 		resultArray.set(arr1);
// 		resultArray.set(arr2, arr1.length);

// 		return resultArray;
// 	}

// 	function playSample(done) {
// 		var source = audioCtx.createBufferSource();
// 		audioCtx.decodeAudioData(buff.buffer).then(function(decodedData) {
// 	        source.buffer = decodedData;
// 	        source.connect(audioCtx.destination);
// 	        source.start(0);
// 	        source.onended = function() {
// 	        	console.log('onended++++++++++++++++++++++++++++++++++=');
// 	        	buff = new Uint8Array(0);
// 	        	playRadio();	
// 	        }
// 		})
// 	}


// 	function playRadio() {
// 		return reader.read().then(addToBuffer).then(playSample).catch(e => console.log(e));
// 	}


// 	return playRadio();
// }).catch(e => console.log(e))

// AudioContext.createMediaElementSource()

