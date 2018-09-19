# Расширение Asian Wave для браузеров на Chromium
![interface](https://raw.githubusercontent.com/tehcojam/aw_chrome/master/images/screenshots/en-anime.png)
Текущая версия — 0.5.6.
Скачать можно в [Chrome Web Store](https://chrome.google.com/webstore/detail/ecbegehkeefmdjnjhldeogkhbhhjhfje) и [Opera Addons](https://addons.opera.com/ru/extensions/details/asian-wave/).

## To Do
* Сделать рефракторинг кода;
* Добавить переводы на другие языки;
* Сделать порт под Firefox;
* Сделать возможность поиска текущего трека.

## Сборка
Необходимо установить git и Node.js (проверялось на версии 8.9.4), после чего выполнить следующие команды:
* `git clone https://github.com/tehcojam/aw_chrome`
* `cd aw_chrome`
* `npm install`
* `npm install gulp-cli -g`
* `gulp`

Готовое к использованию расширение будет лежать в папке `build/`.

## Лицензирование
Весь код расширения доступен под [лицензией MIT](license.txt).

### Сторонний контент
* Логотипы проекта в `icons/` принадлежат [Asian Wave](https://asianwave.ru);
* Иконочный шрифт [Font Awesome](http://fontawesome.io) (только частично, спасибо [IcoMoon](https://icomoon.io/app)) – [SIL OFL 1.1](http://scripts.sil.org/OFL).
