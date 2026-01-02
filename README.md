# Simple Web Crawler

## Description
This project is a simple web crawler implemented in TypeScript using Node.js.
It demonstrates crawling a single web page while respecting robots.txt rules.

## Technologies
- Node.js
- TypeScript
- axios
- cheerio
- robots-parser
- sentiment

## Functionality
- Checks robots.txt before crawling
- Fetches a single web page
- Extracts the page title, meta description, H1, H2, H3 headings and paragraphs
- Displays crawled data in the console
- Performs sentiment analysis on data crawled and prints analysis in console

## Setup and Run

### Prerequisites
- Node.js **version 20 or higher**
- npm **version 10 or higher**

### Installation
- Install dependencies: 
    ```bash 
    npm install

### Run the crawler
- Run the crawler:
    ```bash
    npm run crawl <web_page_url>