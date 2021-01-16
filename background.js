
var tabIdToNewTitle = {};
var tabIdToOrigTitle = {};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

    //console.log(JSON.stringify(request));

    if (request.action == "renameTab") {
        let baseUrl = getBaseUrl(request.tabUrl);

        //console.log("base url =" + baseUrl);

        if (!request.applyToAll) {
            //console.log('updating only tab:' + request.tabId);

            if (!tabIdToOrigTitle[request.tabId]) {
                console.log('saving tab:' + request.tabId + ', title:' + request.origTitle);
                tabIdToOrigTitle[request.tabId] = request.origTitle;
                tabIdToNewTitle[request.tabId] = request.newTitle;
            }

            chrome.tabs.executeScript(request.tabId, {
                code: 'document.title="' + request.newTitle + '";'
            });
        } else {
            chrome.tabs.query({
                url: baseUrl + '/*'
            }, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    let cTab = tabs[i];

                    if (!tabIdToOrigTitle[cTab.id]) {
                        console.log('saving tab:' + cTab.id + ', title:' + cTab.title);
                        tabIdToOrigTitle[cTab.id] = cTab.title;
                    }

                    tabIdToNewTitle[cTab.id] = request.newTitle;
                    console.log('renaming tab:' + cTab.id);
                    chrome.tabs.executeScript(cTab.id, {
                        code: 'document.title="' + request.newTitle + '";'
                    });
                }
            });
        }
    } else if (request.action == "resetAll") {
        //console.log('action = resetAll');

        const tabIds = Object.keys(tabIdToOrigTitle);
        tabIdToNewTitle = {};

        for (const tabId of tabIds) {
            let origTitle = tabIdToOrigTitle[tabId];

            //console.log('tabId:' + tabId + ', original title = ' + origTitle);
            //console.log(typeof tabId);

            chrome.tabs.executeScript(parseInt(tabId, 10), {
                code: 'document.title="' + origTitle + '";'
            });
        }
    }

    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    sendResponse({
        farewell: "goodbye"
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('Tab:' + tabId + ' refreshed');
    if (tabIdToNewTitle[tabId]) {
        //console.log('found tab title = ' + tabIdToNewTitle[tabId]);
        chrome.tabs.executeScript(tabId, {
            code: 'document.title="' + tabIdToNewTitle[tabId] + '";'
        });
    }
});

function getBaseUrl(url) {
    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var baseUrl = protocol + '//' + host;
    return baseUrl;
}
