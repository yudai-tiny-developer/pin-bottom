chrome.commands.onCommand.addListener(command => {
    chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, command).catch(error => {
                // Receiving end does not exist
            });
        });
    });
});
