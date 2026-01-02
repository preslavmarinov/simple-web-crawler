import axios from "axios";
import * as cheerio from "cheerio";
import robotsParser from "robots-parser";
import { analyzeSentiment, scoreToLabel } from "./sentiment";

async function canCrawl(url: string): Promise<boolean | undefined> {
  const robotsUrl = new URL("/robots.txt", url).toString();

  try {
    const response = await axios.get(robotsUrl);
    const robots = robotsParser(robotsUrl, response.data);

    return robots.isAllowed(url, "*");
  } catch {
    return true;
  }
}

async function crawlPage(url: string) {
    const allowed = await canCrawl(url);
  
    if (!allowed) {
      console.log("Crawling is blocked by robots.txt");
      return;
    }
  
    console.log("Crawling allowed. Fetching page...");
  
    let html: any;
    try {
        const response = await axios.get(url);
        html = response.data;
    } catch (err: any) {
        console.error("Failed to fetch page:", err.message);
        if (err.response) {
            console.error("Status code:", err.response.status);
        }
        return;
    }
  
    const page = cheerio.load(html);
  
    const title = page("title").text();
    const metaDescription = page('meta[name="description"]').attr("content") || "";
    const h1Texts: string[] = [];
    const h2Texts: string[] = [];
    const h3Texts: string[] = [];
    const paragraphTexts: string[] = [];

    page("h1").each((_, element) => {
        h1Texts.push(page(element).text());
    });

    page("h2").each((_, element) => {
        h2Texts.push(page(element).text());
    });

    page("h3").each((_, element) => {
        h3Texts.push(page(element).text());
    });

    page("p").each((index, element) => {
        const text = page(element).text().trim();
        if (text.length > 0) {
          paragraphTexts.push(text);
        }
    });
  
    console.log("=== Crawled Data ===");
    console.log("Title:", title);
    console.log("Meta description:", metaDescription);
    console.log("H1 headings:", h1Texts);
    console.log("H2 headings:", h2Texts);
    console.log("H3 headings:", h3Texts);
    console.log("Paragraphs:", paragraphTexts);

    performSentimentAnalysis(title, metaDescription, h1Texts, h2Texts, h3Texts, paragraphTexts);
}

function performSentimentAnalysis(
  title: string,
  metaDescription: string,
  h1Texts: string[],
  h2Texts: string[],
  h3Texts: string[],
  paragraphTexts: string[]
) {
    const allHeadingsText = [...h1Texts, ...h2Texts, ...h3Texts].join(" ");
    const allParagraphsText = paragraphTexts.join(" ");
    const fullPageText = [title, metaDescription, allHeadingsText, allParagraphsText].join(" ");

    const titleSentiment = analyzeSentiment(title);
    const metaSentiment = analyzeSentiment(metaDescription);
    const headingsSentiment = analyzeSentiment(allHeadingsText);
    const paragraphsSentiment = analyzeSentiment(allParagraphsText);
    const pageSentiment = analyzeSentiment(fullPageText);

    console.log("");
    console.log("=== Sentiment Analysis ===");
    console.log("Title:", scoreToLabel(titleSentiment.score), titleSentiment);
    console.log("Meta description:", scoreToLabel(metaSentiment.score), metaSentiment);
    console.log("Headings:", scoreToLabel(headingsSentiment.score), headingsSentiment);
    console.log("Paragraphs:", scoreToLabel(paragraphsSentiment.score), paragraphsSentiment);
    console.log("Overall page:", scoreToLabel(pageSentiment.score), pageSentiment);
}

const targetUrl: string = process.argv[2];

if (!targetUrl) {
    console.error("Please provide a URL to crawl.");
    console.error("Example: npm run crawl https://example.com");
    process.exit(1);
}

crawlPage(targetUrl).catch(console.error);