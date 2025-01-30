document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.getElementById('toggle-switch');
  

    chrome.storage.sync.get(['enabled'], (result) => {
      const isEnabled = result.enabled || false; 
      toggleSwitch.checked = isEnabled;
    });
  

    toggleSwitch.addEventListener('change', () => {
      const newEnabledState = toggleSwitch.checked;
      chrome.storage.sync.set({ enabled: newEnabledState });
    });
  });
  