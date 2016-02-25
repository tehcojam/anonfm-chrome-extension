

window.onload = function() {
    document.getElementById('qoute').innerHTML = sessionStorage[window.name]; 

    getForm()
    .then(function(resolve) {
        var cid = resolve.match(/<input type="hidden" name="cid" value="(\d*)">/)[1];
        var captcha = resolve.match(/<img src="(.*\.gif)">/)[1];
        var form = document.forms[0];
        form.cid.value = cid;
        form.captcha.src = "https://anon.fm" + captcha;
    })
    .then(function(resolve) {
        document.getElementById('btn').addEventListener('click', function() {
            sendAnswer().then(function(resolve) {
                var id = resolve.match(/<strong>(.*)<\/strong>/);
                console.log(id);
            });
        });
    });
}


function sendAnswer() {
    return new Promise(function(resolve, reject){
        var form = document.forms[0];
        form.left.value = 500 - parseInt(form.msg.value.length);

        var cid = 'cid=' + encodeURIComponent(form.cid.value);
        var left = '$left=' + encodeURIComponent(form.left.value);
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

//<strong>baasamoeb8e8</strong>
