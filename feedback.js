window.onload = function() {
    var answerQoute = JSON.parse(sessionStorage[window.name]);
    var qoute = answerQoute[0];
    var djanswer = answerQoute[1];
    document.getElementById('ask').innerHTML = qoute;
    document.getElementById('answer').innerHTML = djanswer;

    getForm()
    .then(function(resolve) {
        insertCaptcha(resolve);
    })
    .then(function(resolve) {
        document.getElementById('btn').addEventListener('click', function() {
            sendAnswer().then(handleResponse).catch(function(e) {console.log( 'listener error \n'+ e)});
        });
    }).catch(function(e) {console.log( 'error \n'+ e)});
}


function sendAnswer() {
    return new Promise(function(resolve, reject){
        var form = document.forms[0];
        var left = 500 - parseInt(form.msg.value.length);

        var cid = 'cid=' + encodeURIComponent(form.cid.value);
        var left = '$left=' + encodeURIComponent(left);
        var msg = '$msg=' + encodeURIComponent(form.msg.value);
        var check = '$check=' + encodeURIComponent(form.check.value);

        var formData =  cid + left + msg + check;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://anon.fm/feedback');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            resolve(xhr.responseText);
            console.log('answer response\n' + xhr.responseText);
            }
        }
        xhr.send(formData);
    });
}


function getForm() {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://anon.fm/feedback' + '?' + Math.random());
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText);
            }
        }
        xhr.onerror = function() { 
            reject(new Error("getForm Error"));
        }
        
        xhr.send();
    });
}


function insertCaptcha(resolve) {

    var cid = resolve.match(/<input type="hidden" name="cid" value="(\d*)">/)[1];
    var captcha = resolve.match(/<img src="(.*\.gif)">/)[1];
    var form = document.forms[0];
    form.cid.value = cid;
    form.captcha.src = "https://anon.fm" + captcha;
    form.msg.value = '';
    form.check.value = '';
}

function handleResponse(resolve) {
    console.log('answer sent');
    var id = resolve.match(/<strong>(.*)<\/strong>/)[1];
    console.log(id);

    if (id == 'Неверный код подтверждения') {
        insertCaptcha(resolve);
        document.getElementById('alert').innerHTML = 'Неверный код подтверждения';        
    } else {
        var nick = resolve.match(/<p>.*<\/p>/);
        console.log('nick is: ' + nick);
        document.body.innerHTML = '';
        //var btnSendMore = document.createElement('button');
        var div = document.createElement('div');
        div.innerHTML = nick;
        document.body.appendChild(div);
        
    }
}