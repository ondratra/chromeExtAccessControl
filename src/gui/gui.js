// gui is written in vanilla javascript
document.addEventListener('DOMContentLoaded', function () {
    var defaultSettings = {
        rules: [
            ['^.*:\/\/.*\/.*$', '^.*:\/\/.*\/.*$']
        ]
    };
    var errorMsgDuration = 3000;
    var niceJsonSpaces = 4;

    var refreshSettings = function () {
        chrome.storage.local.get(defaultSettings, function (settings) {
            var ruleList = document.querySelector('.ruleList tbody');
            var newHtml = '';

            for (var i = 0; i < settings.rules.length; i++) {
                var fromUrlRegexp = settings.rules[i][0];
                var toUrlRegexp = settings.rules[i][1];

                newHtml += '<tr>';
                newHtml += '<td>' + fromUrlRegexp + '</td>'
                newHtml += '<td>' + toUrlRegexp + '</td>';
                newHtml += '<td><span class="delete" data-index="' + i + '">X</td>';
                newHtml += '</tr>';
            }
            ruleList.innerHTML = newHtml;

            document.querySelector('.fromUrlRegexp').value = '';
            document.querySelector('.toUrlRegexp').value = '';

            // refresh settings in background script
            chrome.extension.getBackgroundPage().chromeExtension.setRules(settings.rules);
        });
    };

    var printError = function (errorMsg) {
        var errorMessage = document.querySelector('.errorMessage');

        errorMessage.textContent = errorMsg;
        errorMessage.className += ' newError';
        setTimeout(function () {
            // remove "newError" class
            errorMessage.className = errorMessage.className.replace(/(?:^|\s)newError(?!\S)/g ,'');
        }, errorMsgDuration);
    };

    var addRule = function () {
        var fromUrlRegexp = document.querySelector('.fromUrlRegexp');
        var toUrlRegexp = document.querySelector('.toUrlRegexp');

        try {
            if (fromUrlRegexp.value.trim()) {
                new RegExp(fromUrlRegexp.value)
            } else {
                throw new Error();
            }
        } catch(e) {
            printError('FromUrlRegexp "' + fromUrlRegexp.value + '" is not valid regular expression.');
            return;
        }
        try {
            if (toUrlRegexp.value.trim()) {
                new RegExp(toUrlRegexp.value)
            } else {
                throw new Error();
            }
        } catch(e) {
            printError('ToUrlRegexp "' + toUrlRegexp.value + '" is not valid regular expression.');
            return;
        }


        chrome.storage.local.get(defaultSettings, function (settings) {
            var newRules = settings.rules;
            newRules.push([fromUrlRegexp.value, toUrlRegexp.value]);

            chrome.storage.local.set({
                rules: newRules
            });

            refreshSettings();
        });
    };

    var removeRule = function (index) {
        chrome.storage.local.get(defaultSettings, function (settings) {
            var newRules = settings.rules;
            newRules.splice(index, 1);

            chrome.storage.local.set({
                rules: newRules
            });

            refreshSettings();
        });
    };

    var downloadLog = function () {
        var logRecords = chrome.extension.getBackgroundPage().chromeExtension.getLogRecords();
        var logJson = JSON.stringify(logRecords, null, niceJsonSpaces);

        var popupWindow = window.open("data:text/html;charset=utf-8," + encodeURIComponent(logJson));
    };

    var init = function () {
        // setup new rule creation
        var newRuleButton = document.querySelector('.saveNewRule');
        newRuleButton.addEventListener('click', function () {
            addRule();
        });

        // setup rule removal
        var ruleList = document.querySelector('.ruleList');
        ruleList.addEventListener('click', function (event) {
            var clickedElement = event.target;
            if (clickedElement.className.match(/(^|\s)delete(\s|$)/)) {
                removeRule(clickedElement.getAttribute('data-index'));
            }
        });

        // setup log download
        var downloadButton = document.querySelector('.downloadLog');
        downloadButton.addEventListener('click', function () {
            downloadLog();
        });

        // refresh rule list gui
        refreshSettings();
    };
    init();
});

