import {useState} from 'react'

function Scraper() {
    const [scrapedData, setScrapedData] = useState(null);

    const handleScrape = () => {
        chrome.runtime.sendMessage({action: "scrape"}, (response: any) => {
        setScrapedData(response.data);
        });
    };

    return (
        <>
         <button onClick={handleScrape}>Scrape Current Page</button>
         {scrapedData}
        </>
    )
}

export default Scraper