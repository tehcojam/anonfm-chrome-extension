window.onload = function() {

    if (window.name == 'noQoute') {
       var qouteDiv = document.getElementById('qoute');
       qouteDiv.parentNode.removeChild(qouteDiv);

    } else {
        var answerQoute = JSON.parse(sessionStorage[window.name]);
        var qoute = answerQoute[0];
        var djanswer = answerQoute[1];
        document.getElementById('ask').innerHTML = qoute;
        document.getElementById('answer').innerHTML = djanswer;
    }
    getForm().then(insertCaptcha).catch(e => console.log(e));
    
    document.getElementById('btn').addEventListener('click', sendAnswer);
    document.getElementById('check').addEventListener("keypress", function(event) {
        if (event.keyCode == 13)
            sendAnswer();
    });
    
}


function sendAnswer(event) {
    // return new Promise(function(resolve, reject){
    var msg = document.getElementById('msg');
    var cid = document.getElementById('cid');
    var check = document.getElementById('check');
    var left = 500 - parseInt(msg.value.length);


    cid = 'cid=' + cid.value;
    left = '&left=' + left;
    check = '&check=' + check.value;
    msg = '&msg=' + encodeURIComponent(msg.value);
    

    var formData =  cid + left + msg + check;

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    reqInit = {
       method: 'post',
       body: formData,
       headers: headers
    }
    var request = new Request('https://anon.fm/feedback', reqInit);

    fetch(request)
    .then(r => r.text())
    .then(handleResponse)
    .catch(e => console.log(e));;
}


function getForm() {
    var headers = new Headers;
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    reqInit = {
       cache: 'no-cache',
       headers: headers
    }

    var request = new Request('https://anon.fm/feedback', reqInit);

    return fetch(request).then(function(r) { if(r.ok) return r.text() })
}


function insertCaptcha(resolve) {
    var cidInput = document.getElementById('cid');
    var captchaImg = document.getElementById('captcha');
    var check = document.getElementById('check');
    var cid = resolve.match(/<input type="hidden" name="cid" value="(\d*)">/)[1];
    var captcha = resolve.match(/<img src="(.*\.gif)">/)[1];

 
    cidInput.value = cid;
    captchaImg.src = "https://anon.fm" + captcha;
    check.value = '';
}

function handleResponse(resolve) {
    var id = resolve.match(/<strong>(.*)<\/strong>/)[1];
    console.log(id);

    if (id == 'Неверный код подтверждения') {
        insertCaptcha(resolve);
        document.getElementById('alert').innerHTML = 'Неверный код подтверждения';        
    } else {
        document.body.innerHTML = '';
        var div = document.createElement('div');
        div.innerHTML = '<p><font color="#000000">Ваш идентификатор:</font><strong>' + id + '</strong></p>';
        document.body.appendChild(div);
        
        var options = {
            message: 'Ваш id: ' + id,
            iconUrl: '48.png',
            title: 'Сообщение отправлено',
            type: 'basic'
        };
        chrome.notifications.create(options);

        setTimeout(window.close, 1000);
    }
}