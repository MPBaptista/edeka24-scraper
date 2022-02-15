# Edeka24-scraper

Edeka24-scraper is a scraper for the German supermarket chain Edeka-24, developed using Apify SDK.

## Requirements

- Have Node.js version 10.17 or higher installed.
- Have NPM installed.

## Usage
To run the scraper simply cd into the /edeka24-scraper directory and run:
```bash
apify run -p
```
## Limitations
There are two know limitations to the scraper:
- Ideally the scrapper would have multiple anti-scraping techniques implemented, but since there isn't currently access to a proxy it fully relies on shared IP emulation. Which isn't enough to completely prevent blocking.
- For each product category the website only loads 30 products, to load more products multiple XHR need to be sent, and from my understanding that's not supported by the Cheerio Crawler, in which the scraper currently relies on, alternatively Puppeteer Crawler should be used.

## Roadmap
- Solve limitations described above.
- Current feeding of crawler sources via static INPUT.json is not optimal, alternatively a utility function should be developed to scrape for those sources.