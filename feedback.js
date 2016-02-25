window.onload = function() {
    document.getElementById('qoute').innerHTML = sessionStorage[window.name]; 

    getForm()
    .then(function(resolve) {
        insertCaptcha(resolve);
    })
    .then(function(resolve) {
        document.getElementById('btn').addEventListener('click', function() {
            sendAnswer().then(function(resolve) {
                var id = resolve.match(/<strong>(.*)<\/strong>/)[1];
                console.log(id);
                if (id == 'Неверный код подтверждения') {
                    insertCaptcha(resolve);
                    console.log("неверный код подтверждения. отправить еще раз");
                } else {
                    var form = document.forms[0];
                    form.parentNode.removeChild(form);
                    var nick = document.createElement('p');
                    nick.innerHTML = id;
                    document.body.appendChild(nick);
                }
            });
        });
    });
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
