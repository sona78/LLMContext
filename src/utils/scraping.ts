interface ScrapeRequest {
  action: "scrape";
}

interface ScrapeResponse {
  data: {
    title: string;
    headings: string[];
  };
}

chrome.runtime.onMessage.addListener((request: ScrapeRequest, sender, sendResponse) => {
  if (request.action === "scrape") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: (): ScrapeResponse["data"] => {
              const title = document.title;
              const headings = Array.from(document.querySelectorAll("h1, h2")).map(
                (h) => h.textContent || ""
              );
              return { title, headings };
            },
          },
          (results) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else if (results && results[0]) {
              sendResponse({ data: results[0].result });
            }
          }
        );
      }
    });
    return true; // Indicates we'll respond asynchronously
  }
});
