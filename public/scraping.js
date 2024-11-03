const LOCAL_HOST = "http://localhost:8000";

const scrapeChatGPT = () => {
  const elements = document.querySelectorAll("div.whitespace-pre-wrap, p");
  const textList = Array.from(elements)
    .map((d) => d.textContent)
    .filter((d) => d != "");
  return textList;
};

const scrapeClaude = () => {
  const elements = document.querySelectorAll(".whitespace-pre-wrap");
  const textList = Array.from(elements).map((d) => d.textContent);
  return textList;
};

const scrapePerplexity = () => {
  const components = document.querySelectorAll(".prose, .whitespace-pre-line");
  const items = Array.from(components)
    .map((comp) => (comp.children.length == 0 ? comp : Array.from(comp.children)))
    .flat();
  const elements = items.filter((d) => d.textContent != "" && d.children.length == 0);
  const textList = elements.map((d) => d.textContent);
  return textList;
};

const scrape = () => {
  const url = document.documentURI;
  const service = window.location.origin.match("([a-zA-Z]+).[a-zA-Z]+$")[1];
  var textList = [];
  if (service === "chatgpt") textList = scrapeChatGPT();
  if (service === "claude") textList = scrapeClaude();
  if (service === "perplexity") textList = scrapePerplexity();
  console.log(`Read ${textList.length} texts from ${service} at ${url}`);
  textList.forEach((text) => {
    console.log(text);
  });
  return { url, textList };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "scrape") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: scraping,
        },
        (results) => {
          sendResponse({ data: results });
        }
      );
    });
  } else if (message.includes("context:")) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => {
            const textArea = document.querySelector(".placeholder");
            const newElement = document.createElement("p");
            newElement.textContent = `Use this context to understand me better and improve your responses for this subject ${message}`;
            textArea.replaceWith(newElement);
            return { data: newElement.textContent };
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
