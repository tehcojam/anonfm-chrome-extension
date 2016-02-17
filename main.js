document.addEventListener('DOMContentLoaded', function() {
    getData('/state.txt').then(showState, showError);
    getData('/shed.js').then(showBroadcast, showError);

});

function getData(url) {
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://anon.fm' + url + '?' + Math.random());
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                resolve(xhr.responseText);
            }
        }
        xhr.send();
    });
}

function showState(state) {
    var obj = txtToObj(state.toString());
    var el = document.createElement('p');
    var trackTitle = obj.Title || 'Анкноун';

    if (parseInt(obj.isLive)) {
        el.innerHTML = '<p><b>Живой диджей:</b> В эфире</p>';
    } else {
        el.innerHTML = '<p><b>Живой диджей:</b> Не найден</p>'
    }
    if (parseInt(obj.isVideo)) {
        getData('/info.js').then(showVideoLink, showError);
    } else {
        el.innerHTML += '<p><b>Видимопоток:</b> Не найден</p>';
    }
    el.innerHTML += '<p><b>Сейчас играет: </b>' + trackTitle + '</p>';
    document.getElementById('dj').appendChild(el);
}

function showBroadcast(shedList) {
    var shedList = getNextShed(shedList);
    var next = shedList.next;
    var current = shedList.current;
    if (current) {
        document.getElementById('currentBroadcast').innerHTML = '<p>Сейчас в эфире: ' + current[2] + ' - ' + current[3] + '</p>';
    }
    localStorage.shed = JSON.stringify(next);

    var el = document.createElement('p');
    var brTime = new Date(parseInt(next[0][0] * 1000));
    el.innerHTML = '<span id="next">Ближайший эфир: </span>';
    el.innerHTML += next[0][3] + '<br>' + next[0][2];
    el.innerHTML += '<br>' + showRemainingTime(brTime);
    document.getElementById('nextBroadcast').appendChild(el);
}

function txtToObj(str) {
    var obj = {};
    var arr = str.split('\n');
    for (i = 0; i < arr.length; i += 2) {
        obj[arr[i]] = arr[i+1];
    }
    return obj;
}

function showVideoLink(obj) {
    var obj = JSON.parse(obj);
    if (obj.video) {
        var el = document.createElement('p')
        el.innerHTML = '<b>Видимопоток:</b> <a href="' + obj.video + '"target="_blank">Открыть</a>';
        document.getElementById('video').appendChild(el)
    } else {
        document.getElementById('video').innerHTML = '<p>Видимопоток: Не найден</p>';
    }
}

 function showError(err) {
    console.log('error: ' + err);
}

function spawnNotification(body,icon,title) {
  var options = {
      body: body,
      icon: icon
  };
  new Notification(title, options);
}

function compareShed(pre, current) {
  var equal = [];
  var curr = current.slice();
    pre.forEach(function(arr, arrInd) {
    for(i=0;i<curr.length;i++) {
      if (arr.every(function(el, ind){ return el == curr[i][ind]?true:false;} ) ) {
          equal.push(i);
      }
    }  
   });
   for(i=0;i<equal.length;i++) {
        delete curr[equal[i]];
   }
   for(i=0;i<curr.length;i++) {
        if (curr[i] == undefined) {
            curr.splice(i,1);
            i--;
        };
    }
  return curr;
}

//alarms
chrome.alarms.create("CheckSchedule", {delayInMinutes: 0.1, periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(function(alarm){
    //check schedule for update
    getData('/shed.js').then(function(resolve){
        var current = getNextShed(resolve).next;
        if (localStorage['shed']) {
            var pre = JSON.parse(localStorage['shed']);
            var changes = compareShed(pre, current);
            if (changes.length > 0){
                console.log('shed updated')
;                for(i=0;i<changes.length;i++) {
                    spawnNotification(changes[i][3], '48.png', 'Изменение в расписании');
                }
                localStorage.shed = JSON.stringify(current);
            } 
        } else {
            localStorage.shed = JSON.stringify(current);
        }
    }, showError);
    //check DJ isLive 
    getData('/state.txt').then(function(resolve){
        var isLive = parseInt(txtToObj(resolve).isLive);
        var pre = parseInt(localStorage['isLive']);
        if (isLive && !pre) {
            spawnNotification(' ', '48.png', 'Диджей в эфире');
        }
        localStorage['isLive'] = isLive;
    }, showError);
});


function getNextShed(shedList) {
    var now=Math.floor(new Date().getTime()/1000);
    var shedList = JSON.parse(shedList);
    var result = {
        next: []
    };
    for (i=0; i < shedList.length; i++) {
        var begin = parseInt(shedList[i][0]);
        var end = parseInt(shedList[i][1]);

        if (begin <= now && end > now) {
            result.current = shedList[i];
        }

        if (begin > now) {
            result.next.push(shedList[i]);
        } 
    }
    return result;
}

function showRemainingTime(date) {
    var now = new Date();
    var delta = (date - now)/1000;
    var remaining = 'Через ';

    var days = Math.floor(delta/86400);
    var hours = Math.floor(delta/3600);
    var minutes = Math.floor((delta%3600)/60);
    if (days) {
        remaining += days + ' ' + showEnding(days, ['день', 'дня', 'дней']);
    } else if (hours) {
        remaining += hours + ' ' + showEnding(hours, ['час', 'часа', 'часов']);
        remaining += ' ' + minutes + ' ' + showEnding(minutes, ['минуту', 'минуты', 'минут']);
    } else if (minutes) {
        remaining += minutes + ' ' + showEnding(minutes, ['минуту', 'минуты', 'минут']);    
    } else {
        remaining = 'Через минуту';
    }
    return remaining;
}

function showEnding(num, endings) {
    switch(num%10) {
        case 1:
            return endings[0];
            break;
        case 2:
        case 3:
        case 4:
            return endings[1];
        default:
            return endings[2];
    }
}