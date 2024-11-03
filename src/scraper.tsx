import OpenAI from "openai";
import axios from "axios";
// const openai = new OpenAI({
//   apiKey:
//   dangerouslyAllowBrowser: true,
// });
import Button from "react-bootstrap/Button";
const LOCAL_HOST = "http://localhost:8000";

const aiSites = [
  {
    title: "ChatGPT",
    logo: "https://swipefile.com/do-a-chatgpt-swot-analysis-on-your-company/chatgpt-logo-chat-gpt/",
  },
  {
    title: "Perplexity AI",
    logo: "https://perplexity.ai/static/media/perplexity-logo.439a59c5.svg",
  },
  {
    title: "Google Bard",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Bard_Logo.svg/1200px-Bard_Logo.svg.png",
  },
  {
    title: "Claude",
    logo: "https://blog.analystonfire.com/wp-content/uploads/2023/03/Claude.jpg",
  },
];

function Scraper() {
  // const [scrapedData, setScrapedData] = useState(null);
  // const [scrapedData, setScrapedData] = useState({ title: "", prompts: [], responses: [] });
  // const [currentPages, setCurrentPages] = useState<{ title: string; logo: string }[]>([]);

  // const handleAddPage = (title: string, logo: string) => {
  //   setCurrentPages((prevPages) => [...prevPages, { title, logo }]);
  // };

  const handleScrape = () => {
    chrome.runtime.sendMessage("scrape", (response: any) => {
      const scrapings = response.data[0].result;
      console.log(response.data);
      console.log(response.data[0].result);
      if (scrapings && scrapings.textList?.length > 0) {
        const context = scrapings.textList.join("\n\n ");
        handleContextParsing(context, scrapings.url);
      }
    });
  };

  const handleContextParsing = async (context: string, url: string) => {
    openai.chat.completions
      .create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant trying to parse user queries into a context useful for AI language models to improve the personalization of their responses",
          },
          {
            role: "user",
            content: `Based on the context below, create the context framework about what you can identify about me, my needs, the items that I need most clarification with, my style of questioning, and my values to improve future LLM queries?\n ${context}`,
          },
        ],
        max_tokens: 400,
        temperature: 1.3,
      })
      .then((response: any) => {
        console.log(response.choices[0].message.content);
        const user_id = 1;
        axios
          .post(`${LOCAL_HOST}/post_context?user=${user_id}&url=${url}&context=${context}`)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      });

    console.log(context);
  };

  return (
    <div className="scraper-container">
      <h4 className="text-sm font-medium leading-none" style={{ color: "white" }}>
        Current Sites
      </h4>
      <div className="ai-sites-display" style={{ color: "white" }}>
        {aiSites.map((site, index) => (
          <div key={index} className="site-item">
            {site.title}
          </div>
        ))}
      </div>
      <div className="button-container">
        <Button className="glow set-page-button" onClick={handleScrape}>
          Extract Page
        </Button>
      </div>
    </div>
  );
}

export default Scraper;
