function () {
    var defaultSettings = {
        rules: []
    };

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
                newHtml += '<td><span class="Delete">X</td>';
                newHtml += '</tr>';
            }
            ruleList.innerHTML = newHtml;
        });
    };

    var printError = function (errorMsg) {
        var errorMessage = document.querySelector('.errorMessage');

        errorMessage.textContent = errorMsg;
        errorMessage.className += ' newError';
        setTimeout(function () {
            // remove "newError" class
            errorMessage.className = errorMessage.className.replace(/(?:^|\s)newError(?!\S)/g ,'');
        }, 1000);
    };

    var addRule = function () {
        var fromUrlRegexp = document.querySelector('.fromUrlRegexp');
        var toUrlRegexp = document.querySelector('.toUrlRegexp');

        var validRegexpPattern = '/^((?:(?:[^?+*{}()[\]\\|]+|\\.|\[(?:\^?\\.|\^[^\\]|[^\\^])(?:[^\]\\]+|\\.)*\]|\((?:\?[:=!]|\?<[=!]|\?>)?(?1)??\)|\(\?(?:R|[+-]?\d+)\))(?:(?:[?+*]|\{\d+(?:,\d*)?\})[?+]?)?|\|)*)$/';

        var regexpTester = new RegExp(validRegexpPattern);
        if (!regexpTester.test(fromUrlRegexp)) {
            printError('FromUrlRegexp "' + fromUrlRegexp + '" is not valid regular expression.');
        } else if (regexpTester.test(fromUrlRegexp)) {
            printError('ToUrlRegexp "' + toUrlRegexp + '" is not valid regular expression.');
        }

        chrome.storage.local.get(defaultSettings, function (settings) {
            var newRules = settings.rules;
            newRules.push([fromUrlRegexp.value, toUrlRegexp]);

            chrome.storage.local.set({
                rules: newRules
            });
        });
    };

}();


