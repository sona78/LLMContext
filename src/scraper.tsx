// import { useState } from "react";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey:
//
//   dangerouslyAllowBrowser: true,
// });

function Scraper() {
  //   const [scrapedData, setScrapedData] = useState({ title: "", prompts: [], responses: [] });

  const mixArrays = (arr1: any[], arr2: any[]) => {
    arr1 = labelArray(arr1, true);
    arr2 = labelArray(arr2, false);
    const result = [];
    while (arr1.length > 0 && arr2.length > 0) {
      result.push(arr1.shift(), arr2.shift());
    }
    result.push(...arr1, ...arr2);
    return result;
  };

  const labelArray = (arr: any[], isPrompt: boolean) => {
    if (isPrompt) {
      return arr.map((item) => `Prompt: ${item}`);
    } else {
      return arr.map((item) => `Response: ${item}`);
    }
  };
  const handleScrape = () => {
    chrome.runtime.sendMessage("scrape", (response: any) => {
      const scrapings = response.data[0].result;
      console.log(response.data);
      console.log(response.data[0].result);
      if (scrapings && (scrapings.prompts?.length > 0 || scrapings.responses?.length > 0)) {
        const context = mixArrays(scrapings.prompts, scrapings.responses).join(" ");
        handleContextParsing(context);
      }
    });
  };

  const handleContextParsing = async (context: string) => {
    // openai.chat.completions
    //   .create({
    //     model: "gpt-3.5-turbo-0125",
    //     messages: [
    //       {
    //         role: "system",
    //         content:
    //           "You are a helpful assistant trying to parse user queries into a context useful for AI language models to improve the personalization of their responses",
    //       },
    //       {
    //         role: "user",
    //         content: `Based on the context below, create the context framework about what you can identify about me, my needs, the items that I need most clarification with, my style of questioning, and my values to improve future LLM queries?\n ${context}`,
    //       },
    //     ],
    //     max_tokens: 400,
    //     temperature: 1.3,
    //   })
    //   .then((response) => console.log(response));
    console.log(context);
  };
  return (
    <>
      <button onClick={handleScrape}>Scrape Current Page</button>
    </>
  );
}

export default Scraper;
