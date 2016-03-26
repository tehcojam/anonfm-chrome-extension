var src = 'http:/anon.fm:8000/radio';
var audio = new Audio();
audio.preload = 'none';



chrome.runtime.onMessage.addListener(function(mes, sender, sendResponse) {

	if (mes.cmd == "toggle") {
		if (audio.paused) {
			audio.setAttribute('src', src);
			audio.play();
			sendResponse({'result': 'playing'});
		} else {
			audio.setAttribute('src', '');
			sendResponse({'result': 'paused'});
		}
	} else if (mes.cmd == "status") {
		audio.paused ? sendResponse({'status': 'play'})	: sendResponse({'status': 'pause'});
	}
});

// fetch('http://anon.fm:8000/radio').then(function(response) {
// 	var reader = response.body.getReader();
// 	var audioCtx = new AudioContext();
// 	//var source = audioCtx.createBufferSource();
// 	var f = true;
// 	var buff = new Uint8Array(0);

// 	function addToBuffer(chunk) {
// 		var tArray = chunk.value;
// 		var buffer = new ArrayBuffer(tArray.length);
// 		var view = new Uint8Array(buffer);
// 		view.set(tArray);
// 		buff = arrayConcat(buff, view);
// 		// audioCtx.decodeAudioData(buff.buffer).then(function(decodedData){

// 		// });
// 		if (buff.length > 10000000) {playSample()}
// 		while (true) {
			
// 			return reader.read().then(addToBuffer).catch(e => console.log(e));
// 		}

// 	}


// 	function arrayConcat(arr1, arr2) {
// 		var resultArray = new Uint8Array(arr1.length + arr2.length);
// 		resultArray.set(arr1);
// 		resultArray.set(arr2, arr1.length);

// 		return resultArray;
// 	}

// 	function playSample(chunk) {

// 		var source = audioCtx.createBufferSource();
// 		audioCtx.decodeAudioData(buff.buffer).then(function(decodedData) {

// 			console.log(typeof(decodedData));
// 			console.log(decodedData.sampleRate);
// 			console.log(decodedData.length);
// 			console.log(decodedData.duration);
// 			console.log(decodedData.numberOfChannels);
// 	        source.buffer = decodedData;
// 	        //console.log('playsample buff1: ' + buff.length);
// 	        buff = new Uint8Array(0);
// 	        //console.log('playsample buff2: ' + buff.length);
// 	        source.connect(audioCtx.destination);
// 	        source.start(0);
// 	        source.onended = function() {
// 	        console.log('onended++++++++++++++++++++++++++++++++++=');
// 	        	playSample();
// 	        	//playRadio();	
// 	        }
// 		})
// 	}


// 	function playRadio() {
// 		//return reader.read().then(addToBuffer).then(playSample).catch(e => console.log(e));
// 		return reader.read().then(addToBuffer).catch(e => console.log(e));
// 	}


// 	return playRadio();
// }).catch(e => console.log(e))
