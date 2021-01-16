//Wire up event event handlers

var a = 0;
document.addEventListener("DOMContentLoaded", function (event) {
    console.log('popup loaded');
    var changeTitleButton = document.getElementById("changeTitle");
    var applyToAllCheckbox = document.getElementById("applyToAll");
    var resetAllButton = document.getElementById("resetAll");

    setBaseUrl();

    changeTitleButton.addEventListener('click', function () {
        var newTitle = document.getElementById("newTitle").value;
        //console.log("newTitle = " + newTitle);

        if (newTitle.length > 0 && newTitle.trim()) {

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var currTab = tabs[0];

                if (currTab) { // Sanity check
                    var message = {
                        action: "renameTab",
                        tabId: currTab.id,
                        origTitle: currTab.title,
                        newTitle: newTitle,
                        tabUrl: currTab.url,
                        applyToAll: applyToAllCheckbox.checked
                    };

                    //console.log('sending message:' + JSON.stringify(message));

                    chrome.runtime.sendMessage(message, function (response) {
                        console.log(response);
                    });
                }
            });
        }
    });

    resetAllButton.addEventListener('click', function () {
        var message = {
            action: "resetAll"
        }
        chrome.runtime.sendMessage(message, function (response) {
            console.log(response);
        });
    });

});

function setBaseUrl() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var currTab = tabs[0];

        if (currTab) {
            var hostName = getHostName(currTab.url);
            document.getElementById("baseUrl").innerHTML = hostName;
        }
    })
}

function getBaseUrl(url) {
    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var baseUrl = protocol + '//' + host;
    return baseUrl;
}

function getHostName(url) {
    var pathArray = url.split('/');
    return pathArray[2];
}
