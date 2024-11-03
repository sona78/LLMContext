const LOCAL_HOST = "http://localhost:8000";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "scrape") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
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
  } else if (message === "drop") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => {
            const textArea = document.querySelector(".placeholder");
            const newElement = document.createElement("p");
            chrome.storage.local.get(["user_id"], async (result) => {
              if (res) {
                await fetch(
                  `${LOCAL_HOST}/get_context?user_id=${result.user_id}&question=${textArea.textContent})`
                ).then((context) => {
                  newElement.textContent = `Use this context to understand me better and improve your responses for this subject ${context}`;
                  textArea.replaceWith(newElement);
                  return { data: newElement.textContent };
                });
              }
            });
          },
        },
        (results) => {
          sendResponse({ data: results });
        }
      );
    });
  }

  return true;
});
