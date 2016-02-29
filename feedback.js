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
            sendAnswer().then(function(resolve) {
                console.log('answer sent');
                var id = resolve.match(/<strong>(.*)<\/strong>/)[1];
                console.log(id);
                if (id == 'Неверный код подтверждения') {
                    insertCaptcha(resolve);
                    console.log("неверный код подтверждения. отправить еще раз");
                } else {
                    var nick = resolve.match(/<p>.*<\/p>/);
                    document.body.innerHTML = '';
                    var btnSendMore = document.createElement('button');
                    var btnClose = document.createElement('button')
                    btnClose.innerHTML = 'Закрыть';
                    var p = document.createElement('p');
                    var div = document.createElement('div');
                    p.innerHTML = "Ваши id: " + nick;
                    div.appendChild(btnClose);
                    document.body.appendChild(p);
                    document.body.appendChild(div);
                    btnClose.addEventListener('click', window.close);
                }
            });
        });
    }).catch(function(e) {console.log(e)});
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
            console.log(xhr.responseText);
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
