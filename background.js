chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "deepans-menu",
    title: "Analyze with DeepAns",
    contexts: ["selection"]
  });
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

// Слухаємо повідомлення від content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showModal") {
    chrome.tabs.sendMessage(sender.tab.id, { action: "showModal", text: message.text });
  }
});
