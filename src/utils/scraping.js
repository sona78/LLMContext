chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: () => {
          const title = document.title;
          const headings = Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent);
          return {title, headings};
        }
      }, (results) => {
        sendResponse({data: results[0].result});
      });
    });
    
    return true;
  }
});