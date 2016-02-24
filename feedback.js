function sendAnswer() {
    return new Promise(function(resolve, reject){
        var form = document.forms[0];
        var cid = 'cid=' + encodeURIComponent(form.cid.value);
        var left = '$left=' + encodeURIComponent(form.left.value);
        var msg = '$msg=' + encodeURIComponent(form.msg.value);
        var check = '$check=' + encodeURIComponent(form.check.value);

        var body =  cid + left + msg + check;

        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.open('POST', 'https://anon.fm/feedback');
        xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            resolve(xhr.responseText);
            }
        }
        xhr.send(body);
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
window.onload = function() {
 document.getElementById('qoute').innerHTML = localStorage[window.name];   
}
