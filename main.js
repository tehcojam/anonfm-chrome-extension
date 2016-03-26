document.addEventListener('DOMContentLoaded', function() {
    getData('/state.txt').then(showState).catch(e => console.log(e));
    getData('/shed.js').then(showBroadcast).catch(e => console.log(e));

    //panel
    document.getElementById('msgBtn').addEventListener('click', function() {
        window.open('feedback.html', 'noQoute', 'target=_blank, width=600, height=300');
    });

    document.getElementById('options').addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    var playBtn = document.getElementById('player');
    
    chrome.runtime.sendMessage({cmd: "status"}, function(response) {
        if(response) {
            console.log(response);
            playBtn.firstChild.src = "img/" + response.status + ".svg";
        }
    });

    playBtn.addEventListener('click', function() {
        chrome.runtime.sendMessage({cmd: "toggle"}, function(response) {
            console.log(response.result);
            if (response.result == 'paused') {
                playBtn.firstChild.src = "img/play.svg";
            } else {
                playBtn.firstChild.src = "img/pause.svg";
            }

        });
    });    

});



function showState(state) {
    var obj = txtToObj(state.toString());
    var inner ='';
    var trackTitle = obj.Title || 'Анкноун';

    if (parseInt(obj.isLive)) {
        inner = '<p><b>Живой диджей:</b> В эфире</p>';
    } else {
        inner = '<p><b>Живой диджей:</b> Не найден</p>';
    }
    if (parseInt(obj.isVideo)) {
        getData('/info.js').then(showVideoLink).catch(e => console.log(e));
    } else {
        inner += '<p><b>Видимопоток:</b> Не найден</p>';
    }
    inner += '<p><b>Сейчас играет: </b>' + trackTitle + '</p>';
    document.getElementById('dj').innerHTML = inner;
}


function showBroadcast(schedList) {
    var schedList = getNextSched(schedList);
    var next = schedList.next;
    var current = schedList.current;
    if (current) {
        document.getElementById('currentBroadcast').innerHTML = '<p>Сейчас в эфире: ' + current[2] + ' - ' + current[3] + '</p>';
    }
    localStorage.sched = JSON.stringify(next);

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
    for (var i = 0; i < arr.length; i += 2) {
        obj[arr[i]] = arr[i+1];
    }
    return obj;
}


function showVideoLink(obj) {
    var obj = JSON.parse(obj);
    if (obj.video) {
        var el = document.createElement('p');
        el.innerHTML = '<b>Видимопоток:</b> <a href="' + obj.video + '"target="_blank">Открыть</a>';
        document.getElementById('video').appendChild(el);
    } else {
        document.getElementById('video').innerHTML = '<p>Видимопоток: Не найден</p>';
    }
}


// function spawnNotification(body,icon, title, buttons, type, id) {
//     var options = {
//         body: body,
//         icon: icon,
//         title: title,
//         type: type || 'basic',
//         buttons: buttons || []
//     }
//   new Notification(title, options);
// };


function spawnNotification(body,icon, title, buttons, type, id, imageUrl) {
    var options = {
        message: body,
        iconUrl: icon,
        title: title,
        type: type || 'basic',
        buttons: buttons || [],
        imageUrl: imageUrl
    };
    chrome.notifications.create(id, options);
}

function compareSched(pre, current) {
  var equal = [];
  var curr = current.slice();
    pre.forEach(function(arr) {
    for(var i=0;i<curr.length;i++) {
      if (arr.every(function(el, ind){ return el == curr[i][ind]?true:false;} ) ) {
          equal.push(i);
      }
    }  
   });
   for(var i=0;i<equal.length;i++) {
        delete curr[equal[i]];
   }
   for(i=0;i<curr.length;i++) {
        if (curr[i] === undefined) {
            curr.splice(i,1);
            i--;
        }
    }
  return curr;
}

//alarms

var initSchedTime = parseInt(localStorage['schedCheckTime']) || 3;
var initAnswersTime = parseInt(localStorage['answersCheckTime']) || 3;

chrome.alarms.create("CheckSchedule", {delayInMinutes: 1, periodInMinutes: initSchedTime});
chrome.alarms.create("CheckNewAnswers", {delayInMinutes: 1, periodInMinutes: initAnswersTime});


chrome.alarms.onAlarm.addListener(function(alarm){
    //check schedule for update
    getData('/shed.js').then(checkSched).catch(e => console.log(e));

    //check DJ isLive 
    getData('/state.txt').then(checkDj).catch(e => console.log(e));

    if (alarm.name == 'CheckNewAnswers') {
        getData('/answers.js').then(getNewAnswers).catch(e => console.log(e));
    }
});


function getNextSched(schedList) {
    var now=Math.floor(new Date().getTime()/1000);
    var schedList = JSON.parse(schedList);
    var result = {
        next: []
    };
    for (var i=0; i < schedList.length; i++) {
        var begin = parseInt(schedList[i][0]);
        var end = parseInt(schedList[i][1]);

        if (begin <= now && end > now) {
            result.current = schedList[i];
        }

        if (begin > now) {
            result.next.push(schedList[i]);
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
        case 2:
        case 3:
        case 4:
            return endings[1];
        default:
            return endings[2];
    }
}


//answers functions

function getNewAnswers(answers) {

    var answers = JSON.parse(answers);
    if (localStorage["lastAnswer"]) {
        for (var i = 0; i < answers.length; i++) {
            var answerTimestamp = getTimestamp(answers[i][3]);
            var lastTimestamp = JSON.parse(localStorage["lastAnswer"])[6];

            //Dear Lord forgive me for my sins
            var currentServerTime = getServerTime(); 
            if ( answerTimestamp > currentServerTime) break;

            if ( answerTimestamp > lastTimestamp) {
                if (answers[i][1] == 'Расписание') continue;
                
                var notificationType = 'basic';
                var buttons = [{title: 'Ответить'}];
                var title = 'Сообщение';
                var body = answers[i][2] + '\n' + answers[i][5];
                var id = String(answerTimestamp);
                var imageUrl = body.match(/http?s:[\S]*\.png|jpg|gif/);

                if (imageUrl) {
                    notificationType = "image";
                    imageUrl = imageUrl[0];
                    buttons = null;
                }

                spawnNotification(body, '48.png', title, buttons, notificationType, id, imageUrl);

                sessionStorage[id] = JSON.stringify([answers[i][2], answers[i][5]]);

                chrome.notifications.onButtonClicked.addListener(function(id) {
                    
                    var answerWindow = window.open('feedback.html', id,'target=_blank, width=600, height=480');
                });

            } else {
                break;
            }
        }

    }
    //save last message in localStorage
    var lastAnswer = answers[0];
    var timestamp = getTimestamp(answers[0][3]);
    lastAnswer.push(timestamp);
    localStorage.lastAnswer = JSON.stringify(lastAnswer);
}


function getTimestamp(timeString) {
    var today = new Date();
    var t = timeString.match(/>(\d{2}):(\d{2}):(\d{2}).(\d{3})\d</);
    var timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), t[1], t[2], t[3], t[4]).getTime();

    return timestamp;

}


function getServerTime() {
    var localTime = new Date();
    var serverTime = localTime.getTime() + (localTime.getTimezoneOffset() * 60000) + 180*60000;
    return serverTime;
}
//

function getData(url) {
    var url = 'https://anon.fm' + url;
    var headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    var reqInit = {
       cache: 'no-cache',
       headers: headers
    };

    var request = new Request(url, reqInit);

    return fetch(request).then(function(r) { if(r.ok) return r.text();});
}


function checkDj(resolve){
    var isLive = parseInt(txtToObj(resolve).isLive);
    var pre = parseInt(localStorage['isLive']);

    if (isLive && !pre) {
        spawnNotification(' ', '48.png', 'Диджей в эфире');
    }

    localStorage['isLive'] = isLive;
}


function checkSched(resolve) {
    var current = getNextSched(resolve).next;
    if (localStorage['sched']) {
        var pre = JSON.parse(localStorage['sched']);
        var changes = compareSched(pre, current);

        if (changes.length > 0){
            console.log('sched updated');
            for(var i=0;i<changes.length;i++) {
                spawnNotification(changes[i][3], '48.png', 'Изменение в расписании');
            }
            localStorage.sched = JSON.stringify(current);
        } 
    } else {
        localStorage.sched = JSON.stringify(current);
    }

}