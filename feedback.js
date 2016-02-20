function countLeft(field) {
		    var size=field.value.length;
		    var left=maxlen-size;
		    if( left < 0 ) {
		    	field.value=field.value.substring(0,maxlen);
		    } else {
		    	document.getElementById("charsleft").value=left;
		    }
		}

function sendAnswer() {
    return new Promise(function(resolve, reject){
        var form = document.forms[0]; 
        var body = 'cid=' + encodeURIComponent(form.cid.value) + '$left=' + encodeURIComponent(form.left.value) + '$msg=' + encodeURIComponent(form.msg.value) + '$check=' + encodeURIComponent(form.check.value)

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