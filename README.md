# Edeka24-scraper

Edeka24-scraper is a scraper for the German supermarket chain Edeka-24, developed using Apify SDK.

## Requirements

- Have Node.js version 10.17 or higher installed.
- Have NPM installed.

## Usage
To run the scraper simply cd into the edeka24-scraper directory and run:
```bash
apify run -p
```
## Limitations
For each product category the website only loads 30 products, to load more products multiple XHR need to be sent, and from my understanding that's not supported by the Cheerio Crawler, in which the scraper currently relies on, alternatively Puppeteer Crawler should be used.