document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("currencyForm");
  
    // Load the current currency selection
    chrome.storage.sync.get(["currency"], (result) => {
      if (result.currency) {
        form.currency.value = result.currency;
      }
    });
  
    // Update the currency selection
    form.addEventListener("change", () => {
      const currency = form.currency.value;
      chrome.storage.sync.set({ currency }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
              window.location.reload();
            }
          });
        });
      });
    });
  });
  