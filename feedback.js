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
        // var form = document.forms[0];
        // var formData = new FormData;
        // var left = 500 - parseInt(form.msg.value.length)
        // formData.append("left", left);
        // formData.append('cid', form.cid.value);
        // formData.append('check', form.check.value);
        // formData.append('msg', form.msg.value);
        var form = document.forms[0];
        var left = 500 - parseInt(form.msg.value.length);

        var cid = 'cid=' + encodeURIComponent(form.cid.value);
        left = '$left=' + encodeURIComponent(left);
        var check = '$check=' + encodeURIComponent(form.check.value);
        var msg = '$msg=' + encodeURIComponent(form.msg.value);
        

        var formData =  cid + left + check + msg ;
        localStorage['test'] = JSON.stringify(formData);
        console.log(left);
        console.log(formData);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://anon.fm/feedback');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            localStorage['debugresolve'] = JSON.stringify(xhr.responseText);
            resolve(xhr.responseText);
            }
        }
        xhr.send(formData);
        console.log('message sent');
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
    form.check.value = '';
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

        console.log('hadle function done');

        setTimeout(window.close, 1000);
    }
}