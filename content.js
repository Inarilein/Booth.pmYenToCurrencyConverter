const exchangeRates = {
    JPY: { symbol: "JPY", rate: 1 },
    EUR: { symbol: "EUR", rate: 0.0059 },
    USD: { symbol: "USD", rate: 0.0063 },
    GBP: { symbol: "GBP", rate: 0.0049 }
  };
  
  function convertPrices(currency) {
    const selectors = [
      ".price.u-text-primary.u-text-left.u-tpg-caption2",
      ".variation-price.u-text-right",
      ".text-primary400.font-bold.typography-14.py-4",
      ".cart-item__price",
      ".cart-box-subtotal-price"
    ];
  
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const priceText = el.innerText;
        const yenMatch = priceText.match(/(\d{1,3}(,\d{3})*) JPY(~?)/);
  
        if (yenMatch) {
          const yenAmount = parseInt(yenMatch[1].replace(/,/g, ""));
          if (currency === "JPY") {
            el.innerText = `${yenAmount.toLocaleString()} JPY${yenMatch[3]}`;
          } else {
            const exchangeRate = exchangeRates[currency].rate;
            const symbol = exchangeRates[currency].symbol;
            const convertedAmount = (yenAmount * exchangeRate).toFixed(2);
            if (yenMatch[3] === "~") {
              el.innerText = `${yenAmount.toLocaleString()} JPY~ (${convertedAmount} ${symbol}~)`;
            } else {
              el.innerText = `${yenAmount.toLocaleString()} JPY (${convertedAmount} ${symbol})`;
            }
          }
        }
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["currency"], (result) => {
      const currency = result.currency || "JPY";
      convertPrices(currency);
    });
  });
  
  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(["currency"], (result) => {
      const currency = result.currency || "JPY";
      convertPrices(currency);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  