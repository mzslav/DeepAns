chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "deepans-menu",
    title: "Analyze with DeepAns",
    contexts: ["selection"]
  });


  chrome.storage.sync.set({ enabled: true });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "deepans-menu" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }, () => {
      chrome.tabs.sendMessage(tab.id, { action: "showModal", text: info.selectionText });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showModal") {
    chrome.tabs.sendMessage(sender.tab.id, { action: "showModal", text: message.text });
  }
});


chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(['enabled'], (result) => {
    const newEnabledState = !result.enabled;
    chrome.storage.sync.set({ enabled: newEnabledState });


    const iconPath = newEnabledState ? 'icons/on.png' : 'icons/off.png';
    chrome.action.setIcon({ path: iconPath });
  });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["streamEnabled"], (data) => {
        if (data.streamEnabled === undefined) {
            chrome.storage.sync.set({ streamEnabled: true }); // Переконуємось, що значення збережене
        }
    });
});
