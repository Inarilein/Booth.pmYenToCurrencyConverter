document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("currencyForm");

  // Load current currency selection
  chrome.storage.sync.get(["currency"], (result) => {
    if (result.currency) {
      const input = form.querySelector(
        `input[name="currency"][value="${result.currency}"]`
      );
      if (input) {
        input.checked = true;
      }
    }
  });

  // Save currency on change (no reload needed)
  form.addEventListener("change", () => {
    const currency = form.currency.value;
    chrome.storage.sync.set({ currency });
  });
});
