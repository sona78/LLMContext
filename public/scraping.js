chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "scrape") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => {
            const title = document.title;
            const prompts = Array.from(document.querySelectorAll("div.whitespace-pre-wrap")).map(
              (d) => d.textContent
            );
            const responses = Array.from(document.querySelectorAll("p")).map((h) => h.textContent);

            return { title, prompts, responses };
          },
        },
        (results) => {
          sendResponse({ data: results });
        }
      );
    });

    return true;
  }
});
