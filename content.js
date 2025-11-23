const exchangeRates = {
  JPY: { symbol: "JPY", rate: 1 },
  EUR: { symbol: "EUR", rate: 0.0055 },
  USD: { symbol: "USD", rate: 0.0064 },
  GBP: { symbol: "GBP", rate: 0.0049 }
};

// Allgemeine Format-Funktion mit steuerbarer Nachkommastellenanzahl
function formatNumber(value, minDecimals = 0, maxDecimals = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals
  }).format(value);
}

function parseJpyFromText(text) {
  if (!text) return null;

  const cleaned = text.replace(/\u00a0/g, " ").trim();

  const patterns = [
    /([\d,\.]+)\s*JPY/i,      // "300 JPY"
    /JPY\s*([\d,\.]+)/i,      // "JPY 300"
    /[¥￥]\s*([\d,\.]+)/,     // "¥300" oder "￥300"
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(/,/g, ""));
      if (!Number.isNaN(num)) return num;
    }
  }

  // Fallback: irgendeine Zahl im Text
  const fallback = cleaned.match(/([\d][\d,\.]*)/);
  if (fallback && fallback[1]) {
    const num = parseFloat(fallback[1].replace(/,/g, ""));
    if (!Number.isNaN(num)) return num;
  }

  return null;
}

function convertPrices(currency) {
  const rateInfo = exchangeRates[currency] || exchangeRates.JPY;
  const rate = rateInfo.rate;
  const symbol = rateInfo.symbol;

  const selectors = [
    ".text-primary400",
    ".price.text-primary400.text-left.u-tpg-caption2",
    ".pl-16.text-primary400",
    ".variation-price",
    ".cart-btns.variations.variation-item.variation-price"
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      // Original JPY-Wert merken
      let originalJpy = el.dataset.originalJpy;

      if (!originalJpy) {
        const parsed = parseJpyFromText(el.textContent);
        if (parsed == null) return;
        originalJpy = String(parsed);
        el.dataset.originalJpy = originalJpy;
      }

      const jpyValue = parseFloat(originalJpy);
      if (Number.isNaN(jpyValue)) return;

      // Wenn wieder auf JPY gestellt → Original anzeigen (ohne Nachkommastellen)
      if (currency === "JPY") {
        const formattedJpy = formatNumber(jpyValue, 0, 0);
        el.textContent = `${formattedJpy} JPY`;
        return;
      }

      const converted = jpyValue * rate;

      // JPY immer ohne Nachkommastellen, konvertierte Währung immer mit genau 2
      const formattedJpy = formatNumber(jpyValue, 0, 0);
      const formattedConverted = formatNumber(converted, 2, 2);

      el.textContent = `${formattedJpy} JPY (${symbol} ${formattedConverted})`;
    });
  });
}

// Initial: nach DOM-Load Währung holen und umrechnen
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["currency"], (result) => {
    const currency = result.currency || "JPY";
    convertPrices(currency);
  });
});

// Bei DOM-Änderungen (z.B. SPA-Navigation, Ajax) neu anwenden
const observer = new MutationObserver(() => {
  chrome.storage.sync.get(["currency"], (result) => {
    const currency = result.currency || "JPY";
    convertPrices(currency);
  });
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}

// Auf Änderungen der Währung im Storage reagieren (Popup-Wechsel)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.currency) {
    const newCurrency = changes.currency.newValue || "JPY";
    convertPrices(newCurrency);
  }
});
